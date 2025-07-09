const Vente = require('../models/vente');
const Reception = require('../models/reception');
const Stock = require('../models/stock');

class StatsService {

async getInventoryAnalytics(dateRange, groupBy = 'month') {
  const { startDate, endDate } = dateRange;

  // Détermine le format de regroupement
  const dateFormat = "%Y-%m";

  // 1. Achats groupés par période
  const purchasesByPeriod = await Reception.aggregate([
    { 
      $match: { 
        date_reception: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        } 
      } 
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: dateFormat, date: "$date_reception" } }
        },
        total: { $sum: "$total_ttc" }
      }
    },
    { $sort: { "_id.date": 1 } }
  ]);

  // 2. Ventes groupées par période
  const salesByPeriod = await Vente.aggregate([
    { 
      $match: { 
        statut: "Validée",
        date_vente: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        } 
      } 
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: dateFormat, date: "$date_vente" } }
        },
        total: { $sum: "$total_ttc" }
      }
    },
    { $sort: { "_id.date": 1 } }
  ]);

 // [3] Génération de tous les mois de la période
 const allMonths = [];
 const current = new Date(startDate);
 const end = new Date(endDate);
 
 while (current <= end) {
   const month = `${current.getFullYear()}-${(current.getMonth()+1).toString().padStart(2, '0')}`;
   allMonths.push(month);
   current.setMonth(current.getMonth() + 1);
 }

 // [4] Fusion des données avec remplissage des mois sans données
 const inventoryValueData = allMonths.map(month => {
   const purchase = purchasesByPeriod.find(item => item._id.date === month);
   const sale = salesByPeriod.find(item => item._id.date === month);
   
   return {
     date: month,
     achat: purchase?.total || 0,
     vente: sale?.total || 0,
     marge: (sale?.total || 0) - (purchase?.total || 0)
   };
 });

 // [5] Tri chronologique
 inventoryValueData.sort((a, b) => a.date.localeCompare(b.date));

  // 2. Répartition par catégorie
  const categoryDistribution = await Stock.aggregate([
    { $unwind: "$produits" },
    {
      $lookup: {
        from: "categories",
        localField: "produits.categorie_id",
        foreignField: "_id",
        as: "categorie"
      }
    },
    { $unwind: "$categorie" },
    {
      $group: {
        _id: "$categorie.nom",
        value: {
          $sum: { $multiply: ["$produits.quantite_actuelle", "$produits.cout_moyen_pondere"] }
        }
      }
    },
    {
      $project: {
        name: "$_id",
        value: 1,
        _id: 0
      }
    },
    { $sort: { value: -1 } }
  ]);

  return {
    inventoryValueData,
    categoryDistribution
  };
}

async getMarginAnalysis(dateRange) {
  const { startDate, endDate } = dateRange;

  const result = await Vente.aggregate([
    {
      $match: {
        statut: "Validée",
        date_vente: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $lookup: {
        from: "receptions",
        localField: "produits.produit_id",
        foreignField: "produits.produit_id",
        as: "achats"
      }
    },
    {
      $unwind: "$achats"
    },
    {
      $project: {
        marge: { $subtract: ["$total_ttc", "$achats.total_ttc"] },
        coutAchat: "$achats.total_ttc"
      }
    },
    {
      $project: {
        margePourcentage: {
          $cond: {
            if: { $eq: ["$coutAchat", 0] },
            then: 0,
            else: { $multiply: [{ $divide: ["$marge", "$coutAchat"] }, 100] }
          }
        },
        marge: 1
      }
    },
    {
      $bucket: {
        groupBy: "$margePourcentage",
        boundaries: [0, 20, 40, Infinity],
        default: "other",
        output: {
          totalMarge: { $sum: "$marge" },
          count: { $sum: 1 }
        }
      }
    }
  ]);

  // Formater le résultat selon vos besoins
  const pieData = [
    { 
      name: 'Marge élevée (>40%)', 
      value: result.find(r => r._id === 40)?.totalMarge || 0,
      color: '#4CAF50'
    },
    { 
      name: 'Marge moyenne (20-40%)', 
      value: result.find(r => r._id === 20)?.totalMarge || 0,
      color: '#2196F3'
    },
    { 
      name: 'Marge faible (<20%)', 
      value: result.find(r => r._id === 0)?.totalMarge || 0,
      color: '#F44336'
    }
  ];

  return { pieData };
}

async getMarginAnalysisByCategory(dateRange) {
  const { startDate, endDate } = dateRange;

  const result = await Vente.aggregate([
    // Étape 1: Filtrer les ventes validées dans la période
    {
      $match: {
        statut: "Validée",
        date_vente: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        }
      }
    },
    
    // Étape 2: Décomposer le tableau des produits
    { $unwind: "$produits" },
    
    // Étape 3: Joindre les informations des produits
    {
      $lookup: {
        from: "produits",
        localField: "produits.produit_id",
        foreignField: "_id",
        as: "produitInfo"
      }
    },
    { $unwind: "$produitInfo" },
    
    // Étape 4: Joindre les informations des catégories
    {
      $lookup: {
        from: "categories",
        localField: "produitInfo.categorie_id",
        foreignField: "_id",
        as: "categorieInfo"
      }
    },
    { $unwind: "$categorieInfo" },
    
    // Étape 5: Joindre les réceptions correspondantes
    {
      $lookup: {
        from: "receptions",
        let: { produitId: "$produits.produit_id" },
        pipeline: [
          { $unwind: "$produits" },
          { 
            $match: {
              $expr: { $eq: ["$produits.produit_id", "$$produitId"] }
            }
          }
        ],
        as: "achats"
      }
    },
    { $unwind: "$achats" },
    
    // Étape 6: Groupement par catégorie
    {
      $group: {
        _id: "$categorieInfo.nom",
        revenue: { $sum: "$produits.total" },         // CA total
        cost: { $sum: "$achats.produits.total" },     // Coût total
        quantitySold: { $sum: "$produits.quantite" }, // Quantité totale vendue
        uniqueProducts: { $addToSet: "$produits.produit_id" } // Produits distincts
      }
    },
    
    // Étape 7: Calcul des indicateurs
    {
      $project: {
        category: "$_id",
        revenue: 1,
        cost: 1,
        profit: { $subtract: ["$revenue", "$cost"] },
        margin: {
          $cond: {
            if: { $eq: ["$cost", 0] },
            then: 0,
            else: { 
              $multiply: [
                { $divide: [{ $subtract: ["$revenue", "$cost"] }, "$cost"] }, 
                100
              ] 
            }
          }
        },
        quantitySold: 1,          // Quantité totale
        productsCount: { $size: "$uniqueProducts" }, // Nombre de produits distincts
        _id: 0
      }
    },
    
    // Étape 8: Tri par chiffre d'affaires décroissant
    { $sort: { revenue: -1 } }
  ]);

  return result;
}

async getTopProfitableProducts(dateRange, limit = 5) {
  const { startDate, endDate } = dateRange;

  const result = await Vente.aggregate([
    // Étape 1: Filtrer les ventes validées dans la période
    {
      $match: {
        statut: "Validée",
        date_vente: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        }
      }
    },
    
    // Étape 2: Décomposer le tableau des produits
    { $unwind: "$produits" },
    
    // Étape 3: Joindre les informations des produits
    {
      $lookup: {
        from: "produits",
        localField: "produits.produit_id",
        foreignField: "_id",
        as: "produitInfo"
      }
    },
    { $unwind: "$produitInfo" },
    
    // Étape 4: Joindre les informations des catégories
    {
      $lookup: {
        from: "categories",
        localField: "produitInfo.categorie_id",
        foreignField: "_id",
        as: "categorieInfo"
      }
    },
    { $unwind: "$categorieInfo" },
    
    // Étape 5: Joindre les réceptions correspondantes
    {
      $lookup: {
        from: "receptions",
        let: { produitId: "$produits.produit_id" },
        pipeline: [
          { $unwind: "$produits" },
          { 
            $match: {
              $expr: { $eq: ["$produits.produit_id", "$$produitId"] }
            }
          }
        ],
        as: "achats"
      }
    },
    { $unwind: "$achats" },
    
    // Étape 6: Groupement par produit
    {
      $group: {
        _id: {
          productId: "$produits.produit_id",
          productName: "$produitInfo.label",
          category: "$categorieInfo.nom"
        },
        revenue: { $sum: "$produits.total" },
        cost: { $sum: "$achats.produits.total" },
        quantitySold: { $sum: "$produits.quantite" }
      }
    },
    
    // Étape 7: Calcul des indicateurs
    {
      $project: {
        productId: "$_id.productId",
        product: "$_id.productName",
        category: "$_id.category",
        revenue: 1,
        cost: 1,
        profit: { $subtract: ["$revenue", "$cost"] },
        margin: {
          $cond: {
            if: { $eq: ["$cost", 0] },
            then: 0,
            else: { 
              $multiply: [
                { $divide: [{ $subtract: ["$revenue", "$cost"] }, "$cost"] }, 
                100
              ] 
            }
          }
        },
        quantitySold: 1,
        _id: 0
      }
    },
    
    // Étape 8: Tri par profit décroissant
    { $sort: { profit: -1 } },
    
    // Étape 9: Limiter aux X premiers résultats
    { $limit: limit }
  ]);

  // Formater les résultats
  return result.map((item, index) => ({
    id: index + 1,
    product: item.product,
    category: item.category,
    revenue: Math.round(item.revenue),
    cost: Math.round(item.cost),
    profit: Math.round(item.profit),
    margin: parseFloat(item.margin.toFixed(1)),
    quantitySold: item.quantitySold
  }));
}


}

module.exports = new StatsService();