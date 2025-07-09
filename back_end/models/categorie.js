const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// Crée le schéma categorie
const categorieSchema = new Schema({
    nom: { type: String, required: true, unique: true }, 
    description: { type: String, required: false }, 
    image: { type: String },
    date_creation: { type: Date, default: Date.now }, 
    produits: [{
        produit_id: { type: Schema.Types.ObjectId, ref: "Produit" , required: false},
        }]
});

module.exports = mongoose.model("Categorie", categorieSchema);
