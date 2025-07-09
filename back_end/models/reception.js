const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Crée le schéma d'achat
const receptionSchema = new Schema({
    achat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Achat', required: true },
    fournisseur_id: { type: Schema.Types.ObjectId, ref: "Fournisseur", required: false },
    date_reception: { type: Date, default: Date.now },
    delais: { type: String, enum: ["Respecté", "Retard","En cours"], default: "En cours" },
    delai_jours: { type: Number, required: false }, // positif = retard, négatif = en avance
    satisfaction: { type: Number, min: 1, max: 5 },
    code_reception: { type: String,required: true, unique: true, default: function() {
              // Génération d'un code unique REC-YYYYMM-XXXX
              const date = new Date();
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              return `REC-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;
            }},
    produits: [{
        produit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
        quantite_commandee: { type: Number, required: true },
        quantite_reçu: { type: Number, required: true },
        ecart: { type: Number, required: false,default: 0, },
        prix_unitaire: { type: Number, required: true },
        total: { type: Number, required: true },
        categorie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categorie', required: true }
    }],
    commentaires: { type: String, required: false,},
    deliveryAddress: { type: String, required: false },
    remise: { type: Number,default: 0, },
    taxes: { type: Number,default: 0,},
    total_ht: { type: Number,required: true,default: 0,  },
    total_ttc: { type: Number, required: true, default: 0, },
});

receptionSchema.pre('save', async function(next) {
  if (!this.code_reception) {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      this.code_reception = `REC-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

receptionSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    // En cas de duplication (très rare avec ce format)
    this.code_reception = `REC-${new Date().getTime()}`; // Solution de secours
    this.save();
  } else {
    next(error);
  }
});


module.exports = mongoose.model("Reception", receptionSchema);