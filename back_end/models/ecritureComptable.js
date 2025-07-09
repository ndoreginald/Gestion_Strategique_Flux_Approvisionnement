const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ecritureComptableSchema = new Schema({
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["ACHAT", "VENTE", "AJUSTEMENT"] },
    montant: { type: Number, required: true },
    compte_debit: { type: String, required: true }, // Ex: "Stock", "COGS"
    compte_credit: { type: String, required: true }, // Ex: "Dettes fournisseurs", "Ventes"
    stock_id: { type: Schema.Types.ObjectId, ref: "Stock" },
    description: { type: String }
});

module.exports = mongoose.model("EcritureComptable", ecritureComptableSchema);