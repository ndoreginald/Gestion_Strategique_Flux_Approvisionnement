const express = require("express");
const router = express.Router();
const Achat = require("../models/achat");
const Stock = require("../models/stock");
const Reception = require("../models/reception");
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const Budget = require("../models/budget");
const { verifyToken } = require("../middlewares/auth");


router.get('/' ,verifyToken, async (req, res) => {
  try {
    const budgets = await Budget.find({})
      .populate('categories.categorie_id') 
      .sort({ createdAt: -1 });

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des budgets", error });
  }
});


router.post('/' ,verifyToken, async (req, res) => {
  try {
    const { fiscalYear, period, categories, budgetAmount } = req.body;
    
    // Validation des montants
    if (categories.some(c => c.allocatedAmount <= 0)) {
      return res.status(400).json({ error: "Les montants alloués doivent être positifs" });
    }

    const budget = new Budget({ 
      //reference,
      fiscalYear,
      period,
      categories,
      status: 'Validé',
      budgetAmount
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/category-budget' ,verifyToken, async (req, res) => {
  try {
    const data = await Budget.getTotalAllocatedByCategorie(); // ✅ ici on appelle la méthode du modèle
    res.json(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.get('/year',verifyToken, async (req, res) => {
  try {
    const { fiscalYear } = req.query;

    if (!fiscalYear) {
      return res.status(400).json({ error: 'Paramètre fiscalYear requis' });
    }

    const budgets = await Budget.find({ fiscalYear: parseInt(fiscalYear) })
      .populate('categories.categorie_id') // si tu veux les infos des catégories
      .exec();

    res.json(budgets);
  } catch (error) {
    console.error('Erreur lors de la récupération des budgets :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.get('/budgets/summary/:year', verifyToken, async (req, res) => {
  try {
    const { year } = req.params;

    // Filtrage par année
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // Budgets de l'année
    const budgets = await Budget.find({ fiscalYear: Number(year) })
      .populate('categories.categorie_id', 'nom')
      .lean();

    // Initialisation
    const summary = {
      annualTotals: {
        allocated: 0,
        committed: 0,
        consumed: 0,
        remaining: 0,
        utilizationRate: 0
      },
      byStatus: {
        Brouillon: 0,
        Validé: 0,
        En_attente: 0,
        Rejeté: 0
      },
      byCategory: {},
      budgets: []
    };

    // Agrégation des achats (committedAmount)
    const achats = await Achat.aggregate([
      {
        $match: {
          date_achat: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: "$produits" },
      {
        $lookup: {
          from: "produits",
          localField: "produits.produit_id",
          foreignField: "_id",
          as: "produit"
        }
      },
      { $unwind: "$produit" },
      {
        $group: {
          _id: "$produit.categorie_id",
          committedAmount: { $sum: "$produits.total" }
        }
      }
    ]);

    // Agrégation des réceptions (consumedAmount)
    const receptions = await Reception.aggregate([
      {
        $match: {
          date_reception: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: "$produits" },
      {
        $group: {
          _id: "$produits.categorie_id",
          consumedAmount: { $sum: "$produits.total" }
        }
      }
    ]);

    // Fusion des résultats dans summary.byCategory
    const categoryMap = {};

    achats.forEach(a => {
      const catId = a._id?.toString();
      if (!categoryMap[catId]) categoryMap[catId] = {};
      categoryMap[catId].committed = a.committedAmount;
    });

    receptions.forEach(r => {
      const catId = r._id?.toString();
      if (!categoryMap[catId]) categoryMap[catId] = {};
      categoryMap[catId].consumed = r.consumedAmount;
    });

    // Injecter les données budgétaires
    budgets.forEach(budget => {
      budget.categories.forEach(cat => {
        const catId = cat.categorie_id._id.toString();
        const catName = cat.categorie_id.nom;

        // Init catégorie si absente
        if (!summary.byCategory[catId]) {
          summary.byCategory[catId] = {
            name: catName,
            allocated: 0,
            committed: 0,
            consumed: 0,
            utilizationRate: 0
          };
        }

        // Ajout des montants
        summary.byCategory[catId].allocated += cat.allocatedAmount;
        summary.byCategory[catId].committed = categoryMap[catId]?.committed ?? 0;
        summary.byCategory[catId].consumed = categoryMap[catId]?.consumed ?? 0;

        summary.annualTotals.allocated += cat.allocatedAmount;
        summary.annualTotals.remaining += cat.remainingAmount;
      });

      // Statut
      summary.byStatus[budget.status] = (summary.byStatus[budget.status] ?? 0) + 1;

        summary.budgets.push(budget);
    });

    // Calcul global des committed/consumed
    Object.values(summary.byCategory).forEach(cat => {
      summary.annualTotals.committed += cat.committed;
      summary.annualTotals.consumed += cat.consumed;
    });

    // Calcul du taux d'utilisation global
summary.annualTotals.utilizationRate = summary.annualTotals.allocated > 0
  ? (summary.annualTotals.consumed / summary.annualTotals.allocated) * 100
  : 0;

    // Taux d'utilisation
    Object.entries(summary.byCategory).forEach(([catId, catData]) => {
  catData.utilizationRate = catData.allocated > 0
    ? (catData.consumed / catData.allocated) * 100
    : 0;
});

    res.json(summary);

  } catch (error) {
    console.error("Error in /budgets/summary/:year", error);
    res.status(500).json({ message: error.message });
  }
});



router.get('/monthly-spending/:year' ,verifyToken, async (req, res) => {
  const { year } = req.params;

  try {
    const budgets = await Budget.aggregate([
      {
        $match: {
          fiscalYear: parseInt(year),
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalBudget: { $sum: '$budgetAmount' },
          totalActual: {
            $sum: {
              $sum: '$categories.consumedAmount'
            }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Initialiser des tableaux avec 0 pour chaque mois
    const budgetArray = Array(12).fill(0);
    const actualArray = Array(12).fill(0);

    budgets.forEach(entry => {
      const index = entry._id - 1; // mois 1-12 => index 0-11
      budgetArray[index] = entry.totalBudget;
      actualArray[index] = entry.totalActual;
    });

    // Formater les données pour le frontend

    const result = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Budget',
          data: budgetArray,
          borderColor: 'rgba(25, 118, 210, 0.4)',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          borderWidth: 2,
          fill: true,
          pointRadius: 3
        },
        {
          label: 'Actual',
          data: actualArray,
          borderColor: 'rgba(0, 150, 136, 1)',
          backgroundColor: 'rgba(0, 150, 136, 0)',
          borderWidth: 3,
          pointRadius: 4
        }
      ]
    };

    res.json(result);

  } catch (err) {
    console.error('Erreur lors de l\'agrégation des données mensuelles', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});





module.exports = router;