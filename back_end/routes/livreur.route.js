const express = require("express");
const Livreur = require("../models/livreur");
const { verifyToken } = require("../middlewares/auth");


// Afficher la liste des clients
router.get("/",verifyToken, async (req, res) => {
    try {
        const livreurs = await Livreur.find({}, null, { sort: { nom: "asc" } });
        res.status(200).json(livreurs);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


// Afficher un client par ID
router.get("/:id",verifyToken, async (req, res) => {
    try {
        const { id } = req.params; // Récupère l'ID de l'URL
        const livreur = await Livreur.findById(id); // Recherche le client par son ID

        if (!livreur) {
            return res.status(404).json({ message: "Livreur non trouvé" });
        }

        res.status(200).json(livreur); // Retourne les informations du client
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gère les erreurs
    }
});

  
// Route pour créer un client
router.post('/',verifyToken, async (req, res) => {
    try {
        const { nom, email, adresse, telephone, statut,joinDate,activity,} = req.body;
        const newLivreur = new Livreur(req.body);
        await newLivreur.save();
        res.status(201).json(newLivreur);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Modifier un utilisateur
router.put('/:id',verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const updatedLivreur = await Livreur.findByIdAndUpdate(
            id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json(updatedLivreur);
    } catch (error) {
        res.status(404).json({ "message": error.message });
    }
});

module.exports = router;