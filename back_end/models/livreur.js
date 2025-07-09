const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const livreurSchema = new Schema({
    nom: { type: String, required: true },
    adresse: { type: String, required: true },
    matricule_vehcule: { type: String, required: true, unique: true },
    telephone: { type: String, required: false },
    joinDate: { type: Date , default: Date.now},
    createdBy: { type: String, required: false},
    activity: { type: Number, min: 0, max: 100, default: 0, required: false }, // Sera mis à jour dynamiquement
    statut: { type: String, enum: ["Bloqué", "Actif"], default: "Actif" },
});




module.exports = mongoose.model("Livreur", livreurSchema);
