const express = require("express");
const router = express.Router();
const Achat = require("../models/achat");
const mongoose = require("mongoose");
const Stock = require("../models/stock");
const produit = require("../models/produit");
const { verifyToken } = require("../middlewares/auth");

// Afficher la liste des achats
router.get("/" ,verifyToken , async (req, res) => {
    try {
        const achats = await Achat.find({})
            .populate('produits.produit_id') // Assurez-vous de peupler les produits à l'intérieur de l'objet produits
            .populate('fournisseur_id')
            .populate('user_id')
            .sort({ date_achat: -1 }); 

        res.status(200).json(achats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir le dernier numéro d'achat
router.get("/next-num-achat" , async (req, res) => {
  try {
    const lastAchat = await Achat.findOne().sort({ num_achat: -1 }).exec();
    const nextNumAchat = lastAchat ? lastAchat.num_achat + 1 : 1;
    res.status(200).json({ nextNumAchat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Route pour créer un achat
router.post('/' ,verifyToken, async (req, res) => {
    try {
        const newAchat = new Achat(req.body);
        await newAchat.save();
        res.status(201).json(newAchat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.put('/:id' ,verifyToken, async (req, res) => {
  try {
    const { statut, delais } = req.body;
    
    const achat = await Achat.findById(req.params.id);
    if (!achat) {
      return res.status(404).send('Achat non trouvée');
    }
    
    achat.statut = statut || achat.statut;
    achat.delais = delais || achat.delais;
    
    await achat.save();

    res.status(200).send(achat);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).send(error.message);
  }
});


// Supprimer un achat
router.delete("/:id" ,verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        await Achat.findByIdAndDelete(id);
        res.status(200).json("Achat supprimé avec succès");
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.get('/monthly-purchases' ,verifyToken, async (req, res) => {
    try {
      const aggregatedData = await Achat.aggregate([
        { $unwind: "$produits" },
        {
          $group: {
            _id: {
              year: { $year: "$date_achat" },
              month: { $month: "$date_achat" },
            },
            totalPurchases: { $sum: "$produits.total" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }, // Trie les résultats par année et mois
      ]);
  
      res.json(aggregatedData);
    } catch (error) {
      console.error('Error in aggregation:', error); // Débogage des erreurs
      res.status(500).json({ error: error.message });
    }
  });

router.get('/purchases' ,verifyToken , async (req, res) => {
    try {
      const aggregatedData = await Achat.aggregate([
        { $unwind: "$produits" },
        {
          $group: {
            _id: "$produits.produit_id", // Utiliser le produit_id pour l'agrégation
            totalQuantity: { $sum: "$produits.quantite" } // Total des quantités achetées
          }
        },
        { $sort: { totalQuantity: -1 } }, // Trier par quantité totale décroissante
        {
          $lookup: {
            from: "produits", // Nom de la collection des produits
            localField: "_id", // `_id` ici est `produit_id`
            foreignField: "_id", // `_id` dans la collection `Produit`
            as: "produitDetails" // Nom du champ pour stocker les détails du produit
          }
        },
        { $unwind: "$produitDetails" }, // Décomposer le tableau pour obtenir un objet unique
        {
          $project: {
            _id: 0, // Masquer `_id` si ce n'est pas nécessaire
            produit_id: "$_id", // Renommer `_id` en `produit_id`
            totalQuantity: 1, // Conserver le total des quantités
            name: "$produitDetails.label" // Renommer le champ `label` en `name`
          }
        }
      ]);
  
      res.json(aggregatedData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
router.get('/supplier-purchases' ,verifyToken, async (req, res) => {
    try {
      const aggregatedData = await Achat.aggregate([
        { $unwind: "$produits" },
        {
          $group: {
            _id: "$fournisseur_id",
            totalAmount: { $sum: "$produits.total" }
          }
        },
        {
          $lookup: {
            from: "fournisseurs", // Nom de la collection des fournisseurs
            localField: "_id",
            foreignField: "_id",
            as: "supplierInfo"
          }
        },
        { $unwind: "$supplierInfo" },
        {
          $project: {
            _id: 0,
            supplierId: "$_id",
            supplierName: "$supplierInfo.nom", // Utilise le champ 'nom' du modèle Fournisseur
            totalAmount: 1
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);
  
      res.json(aggregatedData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

router.get("/:id" ,verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const achat = await Achat.findById(id)
            .populate('fournisseur_id')
            .populate('user_id')
            .populate('produits.produit_id');

        if (!achat) {
            return res.status(404).json({ message: "Achat non trouvé" });
        }

        res.status(200).json(achat);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'achat:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
