const express = require("express");
const router = express.Router();
const cron = require('node-cron');
const Fournisseur = require("../models/fournisseur");
const Reception = require("../models/reception");
const Produit = require("../models/produit");
const { verifyToken } = require("../middlewares/auth");

// Tous les jours à minuit
cron.schedule('0 0 * * *', async () => {
    console.log('Début de la mise à jour des activités des fournisseurs...');
    try {
      await Fournisseur.updateActivity();
      console.log('Mise à jour des activités terminée avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour des activités:', err);
    }
  });

  async function updateActivity(fournisseurId) {
    const produitsDuFournisseur = await Produit.find({ fournisseur_id: fournisseurId }).distinct("_id");
    // 1. Récupérer toutes les réceptions du fournisseur
    const receptions = await Reception.find({ 'produits.produit_id': { $in: produitsDuFournisseur } });
    if (receptions.length === 0) return;
  
    // 2. Calculer le total_ttc global pour pondération
    const totalTtcGlobal = receptions.reduce((sum, r) => sum + r.total_ttc, 0);
    let score = 100;
  
    // --- Critères Pondérés ---
    let penaltyDelais = 0;    // 30%
    let penaltyEcarts = 0;    // 15%
    let bonusSatisfaction = 0;// 15%
    let bonusVolume = 0;      // 40% (total_ttc)
  
    receptions.forEach(reception => {
      const poids = reception.total_ttc / totalTtcGlobal; // Poids financier
  
      // 1. Délais (30%)
      if (reception.delais === "Retard") {
        penaltyDelais += 0.3 * poids * 100; // Pénalité max = 30%
      }
  
      // 2. Écarts de quantité (15%)
      const ecartRelatif = reception.produits.reduce(
        (sum, p) => sum + (Math.abs(p.ecart) / p.quantite_commandee), 
        0
      );
      penaltyEcarts += 0.15 * poids * ecartRelatif * 100;
  
      // 3. Satisfaction (15%)
      bonusSatisfaction += 0.15 * poids * (reception.satisfaction - 3) * 20; // Note 3 = neutre
    });
  
    // 4. Total TTC (40%) : Bonus pour volume d'activité
    const volumeRatio = totalTtcGlobal / 100000; // Normalisation (ex: 100000 = référence)
    bonusVolume = 0.4 * Math.min(1, volumeRatio) * 100; // Max 40%
  
    // 5. Calcul final du score
    score = score - penaltyDelais - penaltyEcarts + bonusSatisfaction + bonusVolume;
  
    // 6. Mise à jour avec bornage [0, 100]
    await Fournisseur.updateOne(
      { _id: fournisseurId },
      { activity: Math.max(0, Math.min(100, Math.round(score))) }
    );
  }

// Afficher la liste des fournisseurs
router.get("/",verifyToken, async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.find({}, null, { sort: { nom: "asc" } });
        res.status(200).json(fournisseurs);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Afficher un fournisseur par ID
router.get("/:id",verifyToken, async (req, res) => {
    try {
        const { id } = req.params; // Récupère l'ID de l'URL
        const fournisseur = await Fournisseur.findById(id); // Recherche le fournisseur par son ID

        if (!fournisseur) {
            return res.status(404).json({ message: "Fournisseur non trouvé" });
        }

        res.status(200).json(fournisseur); // Retourne les informations du fournisseur
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gère les erreurs
    }
});

// Route pour créer un fournisseur
router.post("/",verifyToken, async (req, res) => {
    try {
        const { nom, email, adresse, telephone } = req.body;
        const newFournisseur = new Fournisseur(req.body);
        await newFournisseur.save();
        res.status(201).json(newFournisseur);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Modifier un fournisseur
router.put("/:id",verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const updatedFournisseur = await Fournisseur.findByIdAndUpdate(
            id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json(updatedFournisseur);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.put("/update-activity/:id",verifyToken, async (req, res) => {
    try {
      await updateActivity(req.params.id);
      res.status(200).json({ message: "Activity mise à jour" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });    

// Supprimer un fournisseur
router.delete("/:id",verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        await Fournisseur.findByIdAndDelete(id);
        res.status(200).json("Fournisseur deleted successfully");
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
