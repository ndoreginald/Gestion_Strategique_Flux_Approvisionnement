const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Crée le schéma produit
const produitSchema = new Schema({
    label: { type: String, required: true,unique: true },
    description: { type: String, required: false },
    prix_achat: { type: Number , default: 0 , required: true },
    prix_vente: { type: Number , required: true },
    image: { type: String },
    quantite_initiale: { type: Number, default: 0 },
    quantite_actuelle: { type: Number, default: 0, required: false },
    categorie_id: { type: Schema.Types.ObjectId, ref: "Categorie", required: true }, // Référence à la catégorie
    code_barre: { type: String, required: true, unique: false }, date_creation: { type: Date, default: Date.now },
    date_modification: { type: Date, default: Date.now },
    cout_moyen_pondere: { type: Number, default: 0 },
    statut: { type: String, enum: ["actif", "inactif"], default: "actif" }
});



module.exports = mongoose.model("Produit", produitSchema);
