const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Crée le schéma de vente
const venteSchema = new Schema({
    client_id: { type: Schema.Types.ObjectId, ref: "Client", required: true }, // Référence au client
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Référence au fournisseur
    produits: [
        {
            label: { type: String, required: false , default:''},
            produit_id: { type: Schema.Types.ObjectId, ref: "Produit", required: true }, // Référence au produit
            quantite: { type: Number, required: true },
            prix_unitaire: { type: Number, required: true }, // Prix unitaire lors de l'achat
            total: { type: Number, required: true }, // Prix total pour ce produit
            categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: false }
        }],
    date_vente: { type: Date, required: true, default: Date.now },
    statut: { type: String, enum: ["En cours", "Validée", "Annulée", "Remboursée"], default: "En cours" },
    mode_paiement: { type: String, enum: ["Carte", "Espèces","Virement"], default: "Espèces" },
    type_vente: { type: String, enum: ["En ligne", "En magasin"], default: "En magasin" },
    num_vente: { type: Number,required: true, unique: true},
    remise: { type: Number,default: 0, },
    taxes: { type: Number,default: 0,},
    total_ht: { type: Number,required: true,default: 0,  },
    total_ttc: { type: Number, required: true, default: 0, },
    paymentTerms: { type: String, required: false,},
    description: { type: String, required: false },
    adresse_livraison: { type: String, required: false },
    date_livraison: { type: String, required: false },
    frais_livraison: { type: Number, required: false, default: 0, },
    code_vente: { type: String,required: true, unique: true, default: function() {
        // Génération d'un code unique VNT-YYYYMM-XXXX
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `VNT-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;}}
});

venteSchema.pre('save', async function(next) {
    if (!this.code_stock) {
        const count = await this.constructor.countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        this.code_vente = `VNT-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
  });

module.exports = mongoose.model("Vente", venteSchema);
