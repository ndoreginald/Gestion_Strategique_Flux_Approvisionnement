const mongoose = require("mongoose");
const Produit = require("./produit");
const EcritureComptable = require("./ecritureComptable");
const Vente = require("./vente");
const Schema = mongoose.Schema;

// Crée le schéma stock
const stockSchema = new Schema({
    fournisseur_id: { type: Schema.Types.ObjectId, ref: "Fournisseur", required: false }, // Référence au fournisseur
    client_id: { type: Schema.Types.ObjectId, ref: "Client", required: false }, // Référence au client, facultatif en fonction de l'utilisation
    produits: [
        {
            produit_id: { type: Schema.Types.ObjectId, ref: "Produit", required: true }, 
            quantite_entree: { type: Number, default: 0, required: true }, 
            quantite_sortie: { type: Number, default: 0, required: true }, 
            quantite_actuelle: { type: Number, default: 0, required: false },
            minStock: { type: Number, default: 10, required: false },
            categorie_id: { type: Schema.Types.ObjectId, ref: "Categorie", required: true }, 
            prix_achat: { type: Number, required: true }, // Coût unitaire d'achat
            prix_vente: { type: Number, required: false }, // Prix de vente unitaire
            cout_moyen_pondere: { type: Number, default: 0 }, // CMUP (Coût Moyen Unitair Pondéré)
            date_peremption: { type: Date, required: false }, // Pour gestion FIFO/LIFO
            lot_id: { type: String, required: false } // Identifiant de lot (pour FIFO)  
        }
    ],
    date_entree: { type: Date, required: false }, // Date à laquelle le produit a été ajouté au stock
    date_sortie: { type: Date, required: false }, // Date à laquelle le produit a été retiré du stock, si applicable
    emplacement: { type: String, required: false }, // Emplacement des produits dans le stock
    date_modif: { type: Date, required: false, default: Date.now },
    status: { type: String, enum: ["Disponible", "Rupture", "Stock faible", "Bloqué", "Périmé", "Endommagé", "En Transit"], default: "Disponible" }, //"Réservé", "Bloqué", "Périmé", "Endommagé", "En Transit"
    type: { type: String, enum: ["Entrée", "Sortie", "N/A"], default: "N/A" },
    valeur_stock_total: { type: Number, default: 0 }, // Valeur financière totale du stock
    code_stock: { type: String,required: true, unique: true, default: function() {
        // Génération d'un code unique REC-YYYYMM-XXXX
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `STO-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;}}
    });

stockSchema.pre('save', async function(next) {
    if (!this.code_stock) {
        const count = await this.constructor.countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        this.code_stock = `STO-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
  });

  stockSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
      // En cas de duplication (très rare avec ce format)
      this.code_stock = `STO-${new Date().getTime()}`; // Solution de secours
      this.save();
    } else {
      next(error);
    }
  });

// Méthode statique pour recalculer le coût moyen pondéré
stockSchema.statics.updateCMUP = async function(stockId, produitId, nouvelleQuantite, nouveauPrix) {
  const stock = await this.findById(stockId);
  const produit = stock.produits.find(p => p.produit_id.equals(produitId));
  
  const ancienneValeur = produit.quantite_actuelle * produit.cout_moyen_pondere;
  const nouvelleValeur = nouvelleQuantite * nouveauPrix;
  const totalQuantite = produit.quantite_actuelle + nouvelleQuantite;
  
  produit.cout_moyen_pondere = totalQuantite > 0 
    ? (ancienneValeur + nouvelleValeur) / totalQuantite 
    : nouveauPrix;
    
  await stock.save();
};

stockSchema.pre('save', function(next) {
  this.valeur_stock_total = this.produits.reduce((total, produit) => {
    return total + (produit.quantite_actuelle * produit.cout_moyen_pondere);
  }, 0);
  next();
});

stockSchema.methods.checkStockMinimum = function() {
  this.produits.forEach(produit => {
    if (produit.quantite_actuelle <= produit.minStock) {
      console.log(`Attention : Stock faible pour le produit ${produit.produit_id}`);
    }
  });
};

stockSchema.methods.calculerStockMoyen = async function(produitId) {
  const mouvements = await this.find({
    "produits.produit_id": produitId,
    date_entree: { $exists: true }
  }).sort({ date_entree: 1 });
  
  if (mouvements.length === 0) return 0;
  
  const stockInitial = mouvements[0].produits.find(p => p.produit_id.equals(produitId)).quantite_actuelle;
  const stockFinal = mouvements[mouvements.length - 1].produits.find(p => p.produit_id.equals(produitId)).quantite_actuelle;
  
  const stockMoyen = (stockInitial + stockFinal) / 2;
  
};

stockSchema.statics.calculerRotation = async function(produitId, periodeJours = 365) {
  const produit = await Produit.findById(produitId);
  const stockMoyen = await this.calculerStockMoyen(produitId);

  // Exemple: Récupérer les ventes (à adapter selon votre modèle)
  const ventes = await Vente.aggregate([
    { $unwind: "$produits" },
    { $match: { "produits.produit_id": produitId } },
    { $group: { _id: null, total: { $sum: "$produits.quantite" } } }
  ]);

  const quantiteVendue = ventes[0]?.total || 0;
  return quantiteVendue / stockMoyen;
};

// Point de Commande (ROP)
stockSchema.methods.calculerROP = async function(produitId) {
  try {
    // 1. Valeurs par défaut réalistes
    const delaiLivraison = 7; // jours
    let demandeMoyenne = 1; // Valeur par défaut minimale
    
    // 2. Essayez de calculer la demande réelle
    const dateLimite = new Date();
    dateLimite.setMonth(dateLimite.getMonth() - 3);
    
    const historique = await Vente.aggregate([
      { $unwind: "$produits" },
      { 
        $match: { 
          "produits.produit_id": new mongoose.Types.ObjectId(produitId),
          "date_vente": { $gte: dateLimite },
          "statut": "Validée"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$produits.quantite" },
          joursUniques: { $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$date_vente" } } }
        }
      }
    ]);

    // 3. Ajustement intelligent de la demande
    if (historique.length > 0 && historique[0].joursUniques.length > 0) {
      demandeMoyenne = historique[0].total / historique[0].joursUniques.length;
    } else {
      // Valeur par défaut basée sur le produit
      const produit = await Produit.findById(produitId);
      demandeMoyenne = produit?.minStock ? Math.max(1, produit.minStock * 0.1) : 1;
    }

    // 4. Calcul final avec minimum garanti
    const ROP = Math.max(
      1, // Minimum absolu
      Math.ceil((demandeMoyenne * delaiLivraison) + (demandeMoyenne * 0.5))
    );

    return ROP;
  } catch (err) {
    console.error("Erreur calcul ROP:", err);
    return 1; // Valeur de secours
  }
};


// Dans stock.model.js, forcez une recalcul global
stockSchema.methods.recalculerTousLesStocks = async function() {
  const stocks = await this.find();
  for (const stock of stocks) {
    await stock.calculerValeurStock();
    await stock.save();
  }
};

// À ajouter à la fin de votre modèle Stock
stockSchema.index({ valeur_stock_total: 1 });
stockSchema.index({ "produits.quantite_actuelle": 1 });
stockSchema.index({ "produits.prix_achat": 1 });

module.exports = mongoose.model("Stock", stockSchema);
