const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Crée le schéma d'achat
const achatSchema = new Schema({
    fournisseur_id: { type: Schema.Types.ObjectId, ref: "Fournisseur", required: true }, // Référence au fournisseur
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Référence au fournisseur
    date_achat: { type: Date, required: true, default: Date.now },
    date_prevu: { type: Date, required: false },
    num_achat: { type: Number,required: true, unique: true},
    produits: [
        {
            produit_id: { type: Schema.Types.ObjectId, ref: "Produit", required: true }, // Référence au produit
            quantite: { type: Number, required: true },
            quantite_reçu: { type: Number, required: false },
            prix_unitaire: { type: Number, required: true }, // Prix unitaire lors de l'achat
            total: { type: Number, required: true }, // Prix total pour ce produit 
        }
    ],
    statut: { type: String, enum: ["Commandé","En_cours_de_livraison","Réception partielle","annuler","Reçue"], default: "Commandé" },
    delais: { type: String, enum: ["Respecté", "Retard","En cours"], default: "En cours"},
    mode_paiement: { type: String, enum: ["Carte", "Espèces","Virement"], default: "Espèces" , required: false},
    remise: { type: Number,default: 0, },
    taxes: { type: Number,default: 0,},
    total_ht: { type: Number,required: true,default: 0,  },
    total_ttc: { type: Number, required: true, default: 0, },
    paymentTerms: { type: String, required: false,},
    //paymentMethod: { type: String, required: false },
    description: { type: String, required: false },
    //deliveryDate: { type: Date, required: false },
    deliveryAddress: { type: String, required: false },
    frais_transport: { type: Number, required: true, default: 0, },
    documents: { type: [String], required: false },// Bon de commande, contrat, etc.
});


module.exports = mongoose.model("Achat", achatSchema);
