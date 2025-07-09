const express = require("express");
const router = express.Router();
const Categorie = require("../models/categorie");
const produit = require("../models/produit");
const { verifyToken } = require("../middlewares/auth");


// Afficher la liste des catégories
router.get("/",verifyToken, async (req, res) => {
    try {
        const categories = await Categorie.find({}).sort({ nom: "asc" });
        res.status(200).json(categories);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Afficher une catégorie par ID
router.get("/:id",verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const categorie = await Categorie.findById(id);

        if (!categorie) {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }

        res.status(200).json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//Ajouter une nouvelle categorie
router.post('/',verifyToken, async (req, res) => {
    const { nom, description, image ,produits = [] } = req.body; // Fournir une valeur par défaut vide pour `produits`
    
    // Créer une nouvelle instance de catégorie
    const newCategorie = new Categorie({ nom, description, image });
    
    try {
        // Sauvegarder la nouvelle catégorie
        const savedCategorie = await newCategorie.save();

        // Vérifiez si `produits` est un tableau avant de tenter de le parcourir
        let savedProduits = [];
        if (Array.isArray(produits) && produits.length > 0) {
            // Créer et sauvegarder les produits associés
            const produitPromises = produits.map(async (prod) => {
                const newProduit = new produit({ ...prod, categorie_id: savedCategorie._id });
                return await newProduit.save();
            });

            // Attendre que tous les produits soient sauvegardés
            savedProduits = await Promise.all(produitPromises);
            // Ajouter les produits sauvegardés à la catégorie
            savedCategorie.produits = savedProduits.map(produit => produit._id);

            // Sauvegarder la catégorie mise à jour avec les produits
            await savedCategorie.save();
        }

        // Répondre avec la catégorie et les produits associés
        res.status(200).json({ categorie: savedCategorie, produits: savedProduits });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


// Modifier une catégorie
router.put('/:id',verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const updatedCategorie = await Categorie.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedCategorie);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Supprimer une catégorie
router.delete("/:id",verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        await Categorie.findByIdAndDelete(id);
        res.status(200).json("Catégorie supprimée avec succès");
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;
