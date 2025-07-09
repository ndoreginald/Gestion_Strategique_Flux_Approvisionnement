const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DevisSchema = new Schema({

  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  client_id: { type: Schema.Types.ObjectId, ref: "Client",  required: true, },
  date_devis: { type: Date, default: Date.now,required: true,},
  validite: { type: Date, required: true, },
  num_devis: { type: Number,required: true, unique: true},
  etat: { type: String, enum: ["en cours", "accepté", "rejeté", "expiré"],default: "en cours", },
  produits: [
    {
      produit_id: { type: Schema.Types.ObjectId, ref: "Produit", required: true,  },
      quantite: { type: Number, required: true, min: 1, },
      prix_unitaire: { type: Number, required: true, },
      total: { type: Number, required: true, },
      categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true }
    },
  ],
  remise: { type: Number,default: 0, },
  taxes: { type: Number,default: 0,},
  total_ht: { type: Number,required: true,default: 0,  },
  total_ttc: { type: Number, required: true, default: 0, },
  //conditions_paiement: { type: String,default: "", },
  reference: { type: String, unique: true,required: true, default: function() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `DEV-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;}}

});

DevisSchema.pre('save', async function(next) {
    if (!this.code_stock) {
        const count = await this.constructor.countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        this.reference = `DEV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
  });


module.exports = mongoose.model("Devis", DevisSchema);
