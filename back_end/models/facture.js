const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const factureSchema = new Schema({
    vente_id: { type: Schema.Types.ObjectId, ref: "Vente", required: true },
    client_id: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },  
    //statut: { type: String, enum: ["Payée", "Non Réglée", "Payée à la livraison", "Annulée"], default: "Réglée" },
    produits: [
            {
                label: { type: String, required: false , default:''},
                produit_id: { type: Schema.Types.ObjectId, ref: "Produit", required: true }, // Référence au produit
                quantite: { type: Number, required: true },
                prix_unitaire: { type: Number, required: true }, // Prix unitaire lors de l'achat
                total: { type: Number, required: true }, // Prix total pour ce produit
                categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: false }
            }],
    code_facture: { type: String,required: true, unique: true, default: function() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `FCT-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;}}
});


factureSchema.pre('save', async function(next) {
    if (!this.code_facture) {
        const count = await this.constructor.countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        this.code_facture = `FCT-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
  });


module.exports = mongoose.model("Facture", factureSchema);