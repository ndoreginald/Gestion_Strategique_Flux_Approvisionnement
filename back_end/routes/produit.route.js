const express = require("express");
const router = express.Router();
const produit = require("../models/produit");
const categorie = require("../models/categorie");
const { v4: uuidv4 } = require("uuid");
const { verifyToken } = require("../middlewares/auth");

// Afficher la liste des produits avec les détails de la catégorie
router.get("/",verifyToken, async (req, res) => {
    try {
        // Utilisation de 'populate' pour inclure les détails de la catégorie
        const produits = await produit.find({}, null, { sort: { nom: "asc" } })
            .populate('categorie_id', 'nom') // 'nom' est le champ que vous souhaitez récupérer de la collection 'Categorie'
            .sort({ 'categorie_id.nom': 'asc', 'label': 'asc' });

        res.status(200).json(produits);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.get('/count',verifyToken, async (req, res) => {
    try {
      const count = await produit.countDocuments();
      res.status(200).json({ total: count });
    } catch (err) {
      res.status(500).json({ message: "Erreur lors du comptage des produits", error: err.message });
    }
  });  


// Afficher un produit par ID
router.get("/:id",verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const newProduit = await produit.findById(id);

        if (!newProduit) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        res.status(200).json(newProduit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/',verifyToken, async (req, res) => {
    try {
        // Vérifie si un produit avec le même label existe déjà
        const existingProduit = await produit.findOne({ 
            label: req.body.label 
        });

        if (existingProduit) {
            return res.status(400).json({ 
                message: "Un produit avec ce nom existe déjà" 
            });
        }
        // Si aucun doublon, créez le produit
        const codeBarre = uuidv4();
        const newProduit = new produit({ ...req.body, code_barre: codeBarre });
        const savedProduit = await newProduit.save();
        
        // Mettre à jour la catégorie avec la référence du nouveau produit
        if (req.body.categorie_id) {
            await categorie.findByIdAndUpdate(
                req.body.categorie_id,
                { $push: { produits: savedProduit._id } },
                { new: true }
            );
        }

        res.status(201).json(savedProduit);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Modifier un produit
router.put('/:id',verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const updatedProduit = await produit.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedProduit);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Supprimer un produit
router.delete("/:id",verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        await produit.findByIdAndDelete(id);
        res.status(200).json("Produit supprimé avec succès");
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Route pour récupérer les données des produits
router.get('/products-prices',verifyToken, async (req, res) => {
    try {
      // Récupère tous les produits avec uniquement les champs nécessaires
      const products = await produit.find({}, { label: 1, prix_achat: 1, prix_vente: 1 });
  
      // Retourne les données en format JSON pour être utilisé dans un graphe
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



module.exports = router;
