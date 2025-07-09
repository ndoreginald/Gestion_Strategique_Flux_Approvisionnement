const express = require("express");
const router = express.Router();
const Devis = require("../models/devis"); 
const cron = require('node-cron');
const { verifyToken } = require("../middlewares/auth");


// Tâche cron qui s'exécute tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date();
    await Devis.updateMany({ validite: { $lt: today }, etat: { $ne: 'expiré' } }, { etat: 'expiré' });
    console.log('Statut des devis expirés mis à jour.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des devis expirés:', error);
  }
});

// Créer un nouveau devis
router.post("/",verifyToken, async (req, res) => {
  try {
    const lastDevis = await Devis.findOne().sort({ num_devis: -1 }).exec();
    const newNumDevis = lastDevis ? lastDevis.num_devis + 1 : 1;
    const newDevis = new Devis({ ...req.body, num_devis: newNumDevis });
    const savedDevis = await newDevis.save();
    res.status(201).json(savedDevis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
  

// Récupérer tous les devis
router.get("/",verifyToken, async (req, res) => {
  try {
    const devis = await Devis.find()
    .populate("client_id", 'nom')
    .populate("user_id", 'nom')
    .populate('produits.categorie_id', 'nom')
    .populate("produits.produit_id", "label")
    .sort({ date_devis: -1 });
    res.status(200).json(devis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Obtenir le dernier numéro de devis
router.get("/next-num-devis", async (req, res) => {
  try {
    const lastDevis = await Devis.findOne().sort({ num_devis: -1 }).exec();
    const latestNumDevis = lastDevis ? lastDevis.num_devis + 1 : 1;
    res.status(200).json({ latestNumDevis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mettre à jour un devis par son ID
router.put("/:id",verifyToken, async (req, res) => {
  try {
    const updatedDevis = await Devis.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDevis) return res.status(404).json({ message: "Devis non trouvé" });
    res.status(200).json(updatedDevis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un devis par son ID
router.delete("/:id",verifyToken, async (req, res) => {
  try {
    const deletedDevis = await Devis.findByIdAndDelete(req.params.id);
    if (!deletedDevis) return res.status(404).json({ message: "Devis non trouvé" });
    res.status(200).json({ message: "Devis supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/monthly-trend', verifyToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(year, 0, 1); // 1er janvier de l'année
    const endDate = new Date(year, 11, 31); // 31 décembre de l'année

    const monthlyStats = await Devis.aggregate([
      {
        $match: {
          date_devis: {
            $gte: startDate,
            $lte: endDate
          },
          etat: "accepté" // <-- Ajout de ce filtre
        }
      },
      {
        $group: {
          _id: { $month: "$date_devis" },
          count: { $sum: 1 },
          amount: { $sum: "$total_ttc" }
        }
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          amount: 1,
          _id: 0
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    // Créer un tableau complet pour tous les mois
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const completeStats = allMonths.map(month => {
      const found = monthlyStats.find(item => item.month === month);
      return {
        month: getMonthName(month),
        count: found ? found.count : 0,
        amount: found ? found.amount : 0
      };
    });

    res.json(completeStats);
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des tendances mensuelles',
      error: error.message 
    });
  }
});

// Helper function to get month name
function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('fr-FR', { month: 'long' });
}

router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Date actuelle et mois précédent
    const currentDate = new Date();
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(currentDate.getMonth() - 1);

    // 1. Total des devis (tous statuts)
    const getTotalQuotes = async () => {
      const current = await Devis.countDocuments();
      const previous = await Devis.countDocuments({
        date_devis: { $lt: currentDate, $gte: previousMonthDate }
      });
      const trend = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : '100+';
      return { 
        value: current,
        trend: `${trend}%`
      };
    };

    // 2. Chiffre d'affaires total (somme des total_ttc)
    const getTotalAmount = async () => {
      const currentResult = await Devis.aggregate([
        { $group: { _id: null, total: { $sum: "$total_ttc" } } }
      ]);
      const previousResult = await Devis.aggregate([
        { 
          $match: { 
            date_devis: { $lt: currentDate, $gte: previousMonthDate } 
          } 
        },
        { $group: { _id: null, total: { $sum: "$total_ttc" } } }
      ]);
      
      const current = currentResult[0]?.total || 0;
      const previous = previousResult[0]?.total || 0;
      const trend = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : '100+';
      
      return { 
        value: current,
        trend: `${trend}%`
      };
    };

    // 3. Montant moyen par devis
    const getAverageAmount = async () => {
      const currentResult = await Devis.aggregate([
        { $group: { _id: null, avg: { $avg: "$total_ttc" } } }
      ]);
      const previousResult = await Devis.aggregate([
        { 
          $match: { 
            date_devis: { $lt: currentDate, $gte: previousMonthDate } 
          } 
        },
        { $group: { _id: null, avg: { $avg: "$total_ttc" } } }
      ]);
      
      const current = currentResult[0]?.avg || 0;
      const previous = previousResult[0]?.avg || 0;
      const trend = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : '100+';
      
      return { 
        value: current,
        trend: `${trend}%`
      };
    };

    // 4. Distribution par statut
    const getStatusDistribution = async () => {
      const currentResults = await Devis.aggregate([
        { $group: { _id: "$etat", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } }
      ]);
      
      const previousResults = await Devis.aggregate([
        { 
          $match: { 
            date_devis: { $lt: currentDate, $gte: previousMonthDate } 
          } 
        },
        { $group: { _id: "$etat", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } }
      ]);
      
      const distribution = {
        pending: { current: 0, previous: 0 },
        approved: { current: 0, previous: 0 },
        rejected: { current: 0, previous: 0 },
        expired: { current: 0, previous: 0 }
      };
      
      // Current month
      currentResults.forEach(item => {
        switch(item.status) {
          case 'en cours': distribution.pending.current = item.count; break;
          case 'accepté': distribution.approved.current = item.count; break;
          case 'rejeté': distribution.rejected.current = item.count; break;
          case 'expiré': distribution.expired.current = item.count; break;
        }
      });
      
      // Previous month
      previousResults.forEach(item => {
        switch(item.status) {
          case 'en cours': distribution.pending.previous = item.count; break;
          case 'accepté': distribution.approved.previous = item.count; break;
          case 'rejeté': distribution.rejected.previous = item.count; break;
          case 'expiré': distribution.expired.previous = item.count; break;
        }
      });
      
      // Calculate trends
      const calculateTrend = (current, previous) => {
        if (previous === 0) return current > 0 ? '100+' : '0';
        return ((current - previous) / previous * 100).toFixed(1);
      };
      
      return {
        pending: {
          count: distribution.pending.current,
          trend: `${calculateTrend(distribution.pending.current, distribution.pending.previous)}%`
        },
        approved: {
          count: distribution.approved.current,
          trend: `${calculateTrend(distribution.approved.current, distribution.approved.previous)}%`
        },
        rejected: {
          count: distribution.rejected.current,
          trend: `${calculateTrend(distribution.rejected.current, distribution.rejected.previous)}%`
        },
        expired: {
          count: distribution.expired.current,
          trend: `${calculateTrend(distribution.expired.current, distribution.expired.previous)}%`
        }
      };
    };

    // Récupération de toutes les stats
    const stats = {
      totalQuotes: await getTotalQuotes(),
      totalAmount: await getTotalAmount(),
      averageAmount: await getAverageAmount(),
      statusDistribution: await getStatusDistribution()
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching devis stats:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message 
    });
  }
});

router.get('/status-distribution', verifyToken, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Validation des paramètres
    if (!year || !month) {
      return res.status(400).json({ message: 'Les paramètres year et month sont requis' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Dernier jour du mois

    const statusDistribution = await Devis.aggregate([
      {
        $match: {
          date_devis: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: "$etat",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Formatage pour inclure tous les statuts même avec 0 count
    const allStatuses = ["en cours", "accepté", "rejeté", "expiré"];
    const formattedResult = allStatuses.map(status => {
      const found = statusDistribution.find(item => item.status === status);
      return {
        status,
        count: found ? found.count : 0
      };
    });

    res.json(formattedResult);
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de la répartition par statut',
      error: error.message 
    });
  }
});

// Récupérer un devis par son ID
router.get("/:id",verifyToken, async (req, res) => {
  try {
    const devis = await Devis.findById(req.params.id)
    .populate("client_id", 'nom')
    .populate("user_id", 'nom')
    .populate('produits.categorie_id', 'nom')
    .populate("produits.produit_id", "label");
    if (!devis) return res.status(404).json({ message: "Devis non trouvé" });
    res.status(200).json(devis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
