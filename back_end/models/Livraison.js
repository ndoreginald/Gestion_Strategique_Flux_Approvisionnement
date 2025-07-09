const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const livraisonSchema = new Schema({
    vente_id: { type: Schema.Types.ObjectId, ref: "Vente", required: true },
    livreur_id: { type: Schema.Types.ObjectId, ref: "Livreur", required: true },
    //matricule_vehcule: { type: String, required: true, unique: true },
    poids: { type: String,enum: ["leger", "moyen", "lourd",], default: "moyen", required: false },
    priority: { type: String, enum: ["élevée", "moyenne", "faible", "urgente"], default: "Actif" },
    date_livraison: { type: String, required: false },
    frais_livraison: { type: Number, required: false, default: 0, },
    createdBy: { type: String, required: false},
    statut: { type: String, enum: ["En_cours", "Livré","Annulée"], default: "En_cours" },
    activity: { type: Number, min: 0, max: 100, default: 0, required: false }, // Sera mis à jour dynamiquement
    //statut: { type: String, enum: ["Bloqué", "Actif"], default: "Actif" },
});




module.exports = mongoose.model("Livraison", livraisonSchema);
