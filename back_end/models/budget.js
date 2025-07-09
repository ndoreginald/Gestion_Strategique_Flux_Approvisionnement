const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const budgetSchema = new Schema({
  reference: { type: String, required: true, unique: true , default: function() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `BUD-${year}${month}-${Math.floor(1000 + Math.random() * 9000)}`;}}, 

  fiscalYear: { type: Number, required: true },
  period: { type: String, enum: ['Mensuel', 'Trimestriel', 'Annuel'], required: true },
  categories: [{
    categorie_id: { type: Schema.Types.ObjectId, ref: 'Categorie', required: true },
    allocatedAmount: { type: Number, required: true }, // Montant alloué
    committedAmount: { type: Number, default: 0 }, //  Achats
    consumedAmount: { type: Number, default: 0 }, // Receptions
    remainingAmount: { type: Number, default: function() { 
      return this.allocatedAmount - this.committedAmount; 
    }}
  }],
  status: { type: String, enum: ['Brouillon', 'Validé', 'En_attente', 'Rejeté'], default: 'Brouillon'  },
  budgetAmount: { type: Number, required: true },
  utilizationRate: { type: Number, required: false }, 
  createdAt: { type: Date, default: Date.now },
  lastUpdate: { type: Date, default: Date.now }
});


budgetSchema.pre('save', async function(next) {
    if (!this.reference) {
        const count = await this.constructor.countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        this.reference = `BUD-${year}-${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
  });

  budgetSchema.pre('save', function (next) {
  if (this.budgetAmount > 0) {
    const totalConsumed = this.categories.reduce((sum, cat) => sum + (cat.consumedAmount || 0), 0);
    this.utilizationRate = (totalConsumed / this.budgetAmount) * 100;
  } else {
    this.utilizationRate = 0;
  }
  next();
});


budgetSchema.statics.getTotalAllocatedByCategorie = async function () {
  return this.aggregate([
    { $unwind: "$categories" },
    {
      $group: {
        _id: "$categories.categorie_id",
        totalAllocated: { $sum: "$categories.allocatedAmount" }
      }
    },
    {
      $lookup: {
        from: "categories", // doit correspondre au nom réel de la collection MongoDB
        localField: "_id",
        foreignField: "_id",
        as: "categorie"
      }
    },
    { $unwind: "$categorie" },
    {
      $project: {
        _id: 0,
        categorie_id: "$_id",
        categorieName: "$categorie.nom",
        totalAllocated: 1
      }
    }
  ]);
};


module.exports = mongoose.model("Budget", budgetSchema);