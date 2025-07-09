const express = require("express");
const router = express.Router();
const Vente = require("../models/vente");
const Facture = require("../models/facture");
const mongoose = require("mongoose");
const Produit = require("../models/produit");
const { verifyToken } = require("../middlewares/auth");

// Afficher la liste des factures
router.get("/",verifyToken, async (req, res) => {
    try {
        const factures = await Facture.find({})
            .populate('produits.produit_id')
            .populate('client_id')
            .sort({ date_vente: -1 });

        res.status(200).json(factures);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.post('/',verifyToken, async (req, res) => {
    try {
        const newFacture = new Facture(req.body);
        await newFacture.save();
        res.status(201).json(newFacture);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;