const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Crée le schéma utilisateur
const fournisseurSchema = new Schema({
    nom: { type: String, required: true },
    adresse: { type: String, required: true },
    pays: { type: String, required: true },
    ville: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telephone: { type: String, required: false },
    joinDate: { type: Date , default: Date.now},
    createdBy: { type: String, required: false },
    activity: { type: Number, min: 0, max: 100, default: 0, required: false },
    statut: { type: String, enum: ["Bloqué", "Actif"], default: "Actif" },
});


module.exports = mongoose.model("Fournisseur", fournisseurSchema);
