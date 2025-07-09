const express = require("express");
const router = express.Router();
const Achat = require("../models/achat");
const Stock = require("../models/stock");
const Reception = require("../models/reception");
const mongoose = require('mongoose');
const dayjs = require('dayjs');
const Produit = require("../models/produit");
const { verifyToken } = require("../middlewares/auth");

router.get("/",verifyToken, async (req, res) => {
    try {
        const receptions = await Reception.find({})
            .populate('produits.produit_id')
            .populate('achat_id', 'num_achat date_achat fournisseur_id')
            .populate('achat_id.fournisseur_id', 'nom')
            .populate('achat_id.user_id', 'nom')
            .populate('produits.produit_id', 'label')
            .populate('produits.categorie_id', 'nom')
            .sort({ date_reception: -1 })

        res.status(200).json(receptions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/',verifyToken, async (req, res) => {
  try {
    const { achat_id, produits, ...receptionData } = req.body;
    
    // 1. Vérifier que l'achat existe
    const achat = await Achat.findById(achat_id);
    if (!achat) {
      return res.status(404).json({ message: "Achat non trouvé" });
    }

    // 2. Créer la réception
    const nouvelleReception = new Reception({
      ...receptionData,
      achat_id,
      produits: produits.map(p => ({
        ...p,
        ecart: p.quantite_reçu - p.quantite_commandee
      }))
    });
    await nouvelleReception.save();
    
    // 3. Mettre à jour le statut de l'achat
    await Achat.findByIdAndUpdate(achat_id, { statut: 'Reçue' });
    
    // 4. Mise à jour du stock (optimisée)
    await updateStock(achat.fournisseur_id, nouvelleReception.produits, nouvelleReception.date_reception);
    await updateActivity(achat.fournisseur_id);
    
    res.status(201).json(nouvelleReception);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fonction séparée pour la gestion du stock (corrigée)
async function updateStock(fournisseur_id, produits, date_reception) {
  for (const produit of produits) {
    const { produit_id, quantite_reçu, categorie_id, prix_unitaire } = produit;
    
    if (!prix_unitaire) {
      throw new Error(`Prix unitaire manquant pour le produit ${produit_id}`);
    }

    // Recherche du stock existant
    let stock = await Stock.findOneAndUpdate(
      { 
        "produits.produit_id": produit_id,
        "fournisseur_id": fournisseur_id,
        "type": "Entrée"
      },
      {
        $inc: {
          "produits.$[elem].quantite_entree": quantite_reçu,
          "produits.$[elem].quantite_actuelle": quantite_reçu
        },
        $set: {
          "produits.$[elem].prix_achat": prix_unitaire,
          "produits.$[elem].date_modif": new Date()
        }
      },
      {
        arrayFilters: [{ "elem.produit_id": produit_id }],
        new: true
      }
    );

    if (!stock) {
      // Création d'un nouveau stock si aucun existant
      stock = new Stock({
        fournisseur_id,
        type: 'Entrée',
        produits: [{
          produit_id,
          categorie_id,
          quantite_entree: quantite_reçu,
          quantite_sortie: 0,
          quantite_actuelle: quantite_reçu,
          prix_achat: prix_unitaire,
          cout_moyen_pondere: prix_unitaire,
          date_modif: new Date()
        }],
        date_entree: date_reception,
        date_modif: new Date()
      });
      await stock.save();
    } else {
      // Calcul et mise à jour du CMUP
      await calculateAndUpdateCMUP(stock._id, produit_id, quantite_reçu, prix_unitaire);
    }
  }
}




module.exports = router;