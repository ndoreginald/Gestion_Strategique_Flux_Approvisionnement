const express = require("express");
const router = express.Router();
const Stock = require("../models/stock");
const Achat = require("../models/achat");
const mongoose = require('mongoose');
const Vente = require("../models/vente");
const Reception = require("../models/reception");
const statsService = require('../services/stats.service');
const { verifyToken } = require("../middlewares/auth");


router.get('/produits/quantite-actuelle',verifyToken, async (req, res) => {
    try {
        // Récupérer toutes les entrées et sorties de stock avec les informations des produits
        const stocks = await Stock.find()
            .populate('produits.produit_id')
            .populate('fournisseur_id', 'nom')
            .populate('produits.categorie_id', 'nom')
            .sort({ date_modif: -1 })
            .exec();

        // Objet pour stocker les quantités par produit_id
        const productQuantities = {};

        // Parcourir toutes les entrées de stock pour calculer la quantité actuelle
        stocks.forEach(stock => {
            stock.produits.forEach(produit => {
                const produitId = produit.produit_id._id.toString(); // Convertir l'ID du produit en chaîne
                
                // Si le produit n'existe pas encore dans productQuantities, on l'initialise
                if (!productQuantities[produitId]) {
                    productQuantities[produitId] = {
                        produit_id: produit.produit_id._id,
                        label: produit.produit_id.label,
                        quantite_actuelle: 0,
                        date_modif: stock.date_modif,
                        fournisseur_id: stock.fournisseur_id?._id || null,
                        nom: stock.fournisseur_id?.nom || 'Non spécifié',
                        status: '',
                        minStock: 10,
                        categorie_id: produit.categorie_id?._id || null,
                        categorie_nom: produit.categorie_id?.nom || 'Non spécifié',
                    };
                }
                

                // Ajouter les quantités d'entrée et soustraire les quantités de sortie
                productQuantities[produitId].quantite_actuelle += (produit.quantite_entree || 0) - (produit.quantite_sortie || 0);

                // Déterminer le statut en fonction de la quantité
                const qte = productQuantities[produitId].quantite_actuelle;
                const min = productQuantities[produitId].minStock;

                if (qte === 0) {
                    productQuantities[produitId].status = 'Rupture';
                } else if (qte < min) {
                    productQuantities[produitId].status = 'Stock faible';
                } else {
                    productQuantities[produitId].status = 'Disponible';
                }

            });
        });

        // Convertir productQuantities en tableau pour la réponse JSON
        const result = Object.values(productQuantities);
         // Trier par ordre alphabétique selon le label
         result.sort((a, b) => a.label.localeCompare(b.label));
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de la récupération des quantités actuelles des produits:", error.message);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/quantites-par-produit',verifyToken, async (req, res) => {
    try {
      const result = await Stock.aggregate([
        { $unwind: "$produits" },
        {
          $group: {
            _id: "$produits.produit_id",
            total_entree: { $sum: "$produits.quantite_entree" },
            total_sortie: { $sum: "$produits.quantite_sortie" }
          }
        },
        {
          $lookup: {
            from: "produits",
            localField: "_id",
            foreignField: "_id",
            as: "produit"
          }
        },
        { $unwind: "$produit" },
        {
          $project: {
            produit: "$produit.label",
            total_entree: 1,
            total_sortie: 1
          }
        }
      ]);
  
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Erreur d'agrégation", error });
    }
  });


router.get('/quantites-totales', verifyToken, async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    let dateFilter = {};

    // Conversion des dates en objets Date JS
    const parseDate = (dateString) => {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    // Gestion des périodes
    if (period) {
      const now = new Date();
      
      switch(period) {
        case 'day':
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
          
          dateFilter.date_entree = { 
            $gte: startOfDay,
            $lte: endOfDay
          };
          break;
          
        case 'month':
          dateFilter.date_entree = { 
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          };
          break;
          
        case 'year':
          dateFilter.date_entree = { 
            $gte: new Date(now.getFullYear(), 0, 1),
            $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
          };
          break;
          
        default:
          return res.status(400).json({ 
            success: false, 
            message: "Période invalide" 
          });
      }
    } 
    // Filtre personnalisé
    else if (startDate && endDate) {
      const parsedStart = parseDate(startDate);
      const parsedEnd = parseDate(endDate);
      
      if (!parsedStart || !parsedEnd) {
        return res.status(400).json({ 
          success: false, 
          message: "Format de date invalide. Utilisez YYYY-MM-DD" 
        });
      }
      
      // Ajouter les heures pour couvrir toute la journée
      parsedEnd.setHours(23, 59, 59, 999);
      
      dateFilter.date_entree = {
        $gte: parsedStart,
        $lte: parsedEnd
      };
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Paramètres de date manquants" 
      });
    }

    console.log("Filtre appliqué:", JSON.stringify(dateFilter, null, 2)); // Debug

    const aggregationPipeline = [
      { $match: dateFilter },
      { $unwind: "$produits" },
      {
        $facet: {
          entree: [
            { $match: { type: "Entrée" } },
            {
              $group: {
                _id: null,
                total: { $sum: "$produits.quantite_entree" }
              }
            }
          ],
          sortie: [
            { $match: { type: "Sortie" } },
            {
              $group: {
                _id: null,
                total: { $sum: "$produits.quantite_sortie" }
              }
            }
          ]
        }
      },
      {
        $project: {
          total_entree: { $ifNull: [{ $arrayElemAt: ["$entree.total", 0] }, 0] },
          total_sortie: { $ifNull: [{ $arrayElemAt: ["$sortie.total", 0] }, 0] }
        }
      }
    ];

    const [result] = await Stock.aggregate(aggregationPipeline);

    res.status(200).json({
      success: true,
      data: result,
      filtersApplied: dateFilter // Retourne le filtre appliqué pour vérification
    });
    
  } catch (error) {
    console.error("Erreur complète:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors du calcul des quantités",
      error: error.message 
    });
  }
});

  router.get('/',verifyToken, async (req, res) => {
    try {
      const stocks = await Stock.find()
            .populate('produits.produit_id')
            .populate('fournisseur_id', 'nom')
            .populate('client_id', 'nom')
            .populate('produits.categorie_id', 'nom')
            .sort({ date_modif: -1 }); // -1 pour tri décroissant
      res.status(200).json(stocks);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des stocks', error });
    }
  });
  

// Afficher la liste des stocks triés par date d'entrée (du plus récent au plus ancien)
router.get("/in", async (req, res) => {
    try {
        const stocks = await Stock.find({})
            .populate({
                path: 'produits.produit_id',
                model: 'Produit'
            })
            .populate({
                path: 'fournisseur_id',
                model: 'Fournisseur'
            })
            .populate({
                path: 'client_id',
                model: 'Client'
            })
            .sort({ date_entree: -1 }); // Trier par date_entree, du plus récent au plus ancien

            // Calculer la quantité totale pour chaque produit
            stocks.forEach(stock => {
                stock.produits.forEach(produit => {
                    produit._doc.quantite_total = produit.quantite_entree - produit.quantite_sortie;
                });
            });

        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Afficher la liste des stocks triés par date de sortie (du plus récent au plus ancien)
router.get("/out", async (req, res) => {
    try {
        const stocks = await Stock.find({})
            .populate({
                path: 'produits.produit_id',
                model: 'Produit'
            })
            .populate({
                path: 'fournisseur_id',
                model: 'Fournisseur'
            })
            .populate({
                path: 'client_id',
                model: 'Client'
            })
            .sort({ date_sortie: -1 }); // Trier par date_sortie, du plus récent au plus ancien

             // Calculer la quantité totale pour chaque produit
            stocks.forEach(stock => {
                stock.produits.forEach(produit => {
                    produit._doc.quantite_total = produit.quantite_entree - produit.quantite_sortie;
                });
            });

        res.status(200).json(stocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Afficher les stocks pour un produit spécifique
router.get("/produit/:produit_id",verifyToken, async (req, res) => {
    try {
        const { produit_id } = req.params;

        // Vérifiez si l'ID du produit est valide
        if (!mongoose.Types.ObjectId.isValid(produit_id)) {
            return res.status(400).json({ message: "ID de produit invalide" });
        }

        const stock = await Stock.findOne({ "produits.produit_id": produit_id })
            .populate('produits.produit_id', 'label description')
            .populate('fournisseur_id', 'nom')
            .populate('client_id', 'nom')
            .sort({ quantite_actuelle: -1 });

        if (!stock) {
            return res.status(404).json({ message: "Stock non trouvé pour ce produit" });
        }

        res.status(200).json(stock);
    } catch (error) {
        console.error("Erreur lors de la recherche du stock :", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/valeur',verifyToken, async (req, res) => {
    const stock = await Stock.findOne()
    .populate('produits.produit_id');
    
    res.json({
        valeurTotale: stock.valeur_stock_total,
        details: stock.produits.map(p => ({
            produit: p.produit_id.label,
            quantite: p.quantite_actuelle,
            cout_moyen_pondere: p.cout_moyen_pondere,
            valeur: p.quantite_actuelle * p.cout_moyen_pondere
        }))
    });
});
 

  router.get('/inventory-value',verifyToken, async (req, res) => {
    try {
      const value = await statsService.getInventoryValue();
      res.json({ success: true, data: value });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // 1. Modifiez la route pour accepter les dates directement
  router.get('/analytics',verifyToken, async (req, res) => {
    try {
      const { period } = req.query; // 'day', 'week', 'month', 'year'
      
      let dateRange;
      const now = new Date();
      const groupBy = 'month';
      
      if (period === 'year') {
        dateRange = {
          startDate: new Date(now.getFullYear(), 0, 1), // 1er janvier de l'année
          endDate: new Date(now.getFullYear(), 11, 31) // 31 décembre de l'année
        };
      } else {
      switch(period) {
        case 'day':
          dateRange = {
            startDate: new Date(now.setHours(0, 0, 0, 0)),
            endDate: new Date(now.setHours(23, 59, 59, 999))
          };
          break;
        case 'week':
          const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
          dateRange = {
            startDate: new Date(firstDay.setHours(0, 0, 0, 0)),
            endDate: new Date(new Date(firstDay).setDate(firstDay.getDate() + 6))
          };
          break;
        case 'month':
          // Mois en cours uniquement
          dateRange = {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
          };
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: "Invalid period parameter" 
          });
      }
    }
  
      const value = await statsService.getInventoryAnalytics(dateRange, period);
      res.json({ success: true, data: value });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

  router.get('/monthly-comparison',verifyToken, async (req, res) => {
    try {
      const data = await getMonthlyComparison();
      res.json(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données mensuelles:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  async function getVentesByMonth(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Dernier jour du mois
  
    const ventes = await Vente.find({
      date_vente: { $gte: startDate, $lte: endDate },
      statut: { $in: ["Validée"] } // Seulement les ventes validées
    });
  
    const totalTTC = ventes.reduce((sum, vente) => sum + vente.total_ttc, 0);
    return totalTTC;
  }

  async function getReceptionsByMonth(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Dernier jour du mois
  
    const receptions = await Reception.find({
      date_reception: { $gte: startDate, $lte: endDate }
    });
  
    const totalTTC = receptions.reduce((sum, reception) => sum + reception.total_ttc, 0);
    return totalTTC;
  }

  async function getStockValueAtDate(date) {
    const result = await Stock.aggregate([
      { $unwind: "$produits" },
      { 
        $match: { 
          date_modif: { $lte: date } 
        } 
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: ["$produits.quantite_actuelle", "$produits.cout_moyen_pondere"]
            }
          }
        }
      }
    ]);
  
    return result.length > 0 ? result[0].totalValue : 0;
  }

  async function getCOGSByMonth(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
  
    const ventes = await Vente.find({
      date_vente: { $gte: startDate, $lte: endDate },
      statut: "Validée"
    }).populate('produits.produit_id');
  
    let totalCOGS = 0;
  
    for (const vente of ventes) {
      for (const item of vente.produits) {
        // Trouver le stock correspondant au moment de la vente
        const stock = await Stock.findOne({
          "produits.produit_id": item.produit_id._id,
          date_modif: { $lte: vente.date_vente }
        }).sort({ date_modif: -1 });
  
        if (stock) {
          const produitStock = stock.produits.find(p => 
            p.produit_id.toString() === item.produit_id._id.toString()
          );
          
          if (produitStock) {
            totalCOGS += item.quantite * produitStock.cout_moyen_pondere;
          }
        }
      }
    }
  
    return totalCOGS;
  }

  async function getMonthlyComparison() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Calculer le mois précédent
    let prevYear = currentYear;
    let prevMonth = currentMonth - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }
  
    // Récupérer les données en parallèle
    const [
      currentMonthVentes,
      prevMonthVentes,
      currentMonthReceptions,
      prevMonthReceptions,
      currentStockValue,
      prevStockValue,
    ] = await Promise.all([
      getVentesByMonth(currentYear, currentMonth),
      getVentesByMonth(prevYear, prevMonth),
      getReceptionsByMonth(currentYear, currentMonth),
      getReceptionsByMonth(prevYear, prevMonth),
      getStockValueAtDate(now),
    getStockValueAtDate(new Date(prevYear, prevMonth, 0, 23, 59, 59)),
    ]);
  
    // Calcul des marges brutes
    const currentMonthGrossProfit = currentMonthVentes - currentMonthReceptions;
    const prevMonthGrossProfit = prevMonthVentes - prevMonthReceptions;
  
    return {
      ventes: {
        currentMonth: currentMonthVentes,
        prevMonth: prevMonthVentes,
        evolution: calculateEvolution(currentMonthVentes, prevMonthVentes)
      },
      receptions: {
        currentMonth: currentMonthReceptions,
        prevMonth: prevMonthReceptions,
        evolution: calculateEvolution(currentMonthReceptions, prevMonthReceptions)
      },
      margeBrute: {
        currentMonth: currentMonthGrossProfit,
        prevMonth: prevMonthGrossProfit,
        evolution: calculateEvolution(currentMonthGrossProfit, prevMonthGrossProfit),
        margePercentage: currentMonthVentes > 0 
          ? (currentMonthGrossProfit / currentMonthVentes) * 100 
          : 0
      },
    stock: {
      currentValue: currentStockValue,
      previousValue: prevStockValue,
      evolution: calculateEvolution(currentStockValue, prevStockValue)
    }
    };
  }
  
  // Fonction helper pour calculer les évolutions
  function calculateEvolution(current, previous) {
    return previous !== 0 
      ? ((current - previous) / previous) * 100 
      : 0;
  }


router.get("/combined",verifyToken, async (req, res) => {
    try {
        // 1. Récupérer les ventes
        const ventes = await Vente.find({})
            .populate('produits.produit_id')
            .populate('produits.categorie_id', 'nom')
            .populate('client_id')
            .lean(); // Convertir en objets JavaScript simples

        // 2. Récupérer les réceptions
        const receptions = await Reception.find({})
            .populate('produits.produit_id')
            .populate('achat_id', 'num_achat date_achat fournisseur_id')
            .populate('achat_id.fournisseur_id', 'nom')
            .populate('produits.produit_id', 'label')
            .populate('produits.categorie_id', 'nom')
            .lean();

        // 3. Formater les données pour un format commun
        const formattedVentes = ventes.map(vente => ({
            type: 'vente',
            id: vente._id,
            date: vente.date_vente,
            client: vente.client_id,
            produits: vente.produits,
            montant: vente.total_ttc,
            details: {
                statut: vente.statut,
                // Ajoutez d'autres champs spécifiques aux ventes si nécessaire
            }
        }));

        const formattedReceptions = receptions.map(reception => ({
            type: 'reception',
            id: reception._id,
            date: reception.date_reception,
            fournisseur: reception.achat_id?.fournisseur_id,
            produits: reception.produits,
            montant: reception.total_ttc,
            details: {
                num_reception: reception.num_reception,
                achat_num: reception.achat_id?.num_achat,
                // Ajoutez d'autres champs spécifiques aux réceptions si nécessaire
            }
        }));

        // 4. Fusionner et trier
        const combinedData = [...formattedVentes, ...formattedReceptions]
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // 5. Envoyer la réponse
        res.status(200).json(combinedData);

    } catch (error) {
        res.status(500).json({ 
            message: "Erreur lors de la récupération des données combinées",
            error: error.message 
        });
    }
});

router.get('/margin-analysis',verifyToken, async (req, res) => {
    try {
      const { period } = req.query;
      
      // Calculer la plage de dates comme dans votre exemple
      let dateRange;
      const now = new Date();
      
      if (period === 'year') {
        dateRange = {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31)
        };
      } else {
        // ... autres cas comme avant
      }
  
      const marginData = await statsService.getMarginAnalysis(dateRange);
      res.json({ success: true, data: marginData });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });

router.get('/margin-analysis-by-category',verifyToken, async (req, res) => {
    try {
      const { period } = req.query;
      const now = new Date();
      
      let dateRange;
      
      if (period === 'year') {
        dateRange = {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31)
        };
      } else if (period === 'month') {
        dateRange = {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
      } else {
        return res.status(400).json({ 
          success: false, 
          message: "Période invalide. Utilisez 'year' ou 'month'" 
        });
      }
  
      const marginData = await statsService.getMarginAnalysisByCategory(dateRange);
      
      // Formater les nombres et arrondir les marges
      const formattedData = marginData.map(item => ({
        ...item,
        revenue: Math.round(item.revenue),
        cost: Math.round(item.cost),
        profit: Math.round(item.profit),
        margin: parseFloat(item.margin.toFixed(1)),
        products: item.products
      }));
  
      res.json({ 
        success: true, 
        data: formattedData 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });


router.get('/top-profitable-products',verifyToken, async (req, res) => {
    try {
      const { period, limit } = req.query;
      const now = new Date();
      
      let dateRange;
      
      if (period === 'year') {
        dateRange = {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31)
        };
      } else if (period === 'month') {
        dateRange = {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
      } else {
        return res.status(400).json({ 
          success: false, 
          message: "Période invalide. Utilisez 'year' ou 'month'" 
        });
      }
  
      const topProducts = await statsService.getTopProfitableProducts(
        dateRange, 
        parseInt(limit) || 5
      );
      
      res.json({ 
        success: true, 
        data: topProducts 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  });


// Route pour créer un stock de sortie
router.post('/out',verifyToken, async (req, res) => {
    try {
        const { client_id, produits } = req.body;

        // Pour chaque produit, récupérer la quantité actuelle et la mettre à jour
        for (let produit of produits) {
            // Récupérer le stock actuel pour ce produit
            const stockResponse = await Stock.findOne({
                'produits.produit_id': produit.produit_id
            }).sort({ date_sortie: -1 });

            const quantiteActuelle = stockResponse ? stockResponse.produits.find(p => p.produit_id.equals(produit.produit_id)).quantite_actuelle : 0;

            // Calculer la nouvelle quantité actuelle après la sortie
            produit.quantite_entree = produit.quantite_entree || 0;
            produit.quantite_sortie = produit.quantite_sortie || 0;
            produit.quantite_actuelle = quantiteActuelle - produit.quantite_sortie;

            // Vérifier si la quantité actuelle reste positive
            if (produit.quantite_actuelle < 0) {
                return res.status(400).json({ message: `Quantité actuelle négative pour le produit ID ${produit.produit_id}` });
            }
        }

        const newStock = new Stock({
            client_id,
            produits,
            date_sortie: new Date(),
            type: 'Sortie',
        });

        await newStock.save();
        res.status(201).json(newStock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Route pour créer un stock d'entrée
router.post('/in',verifyToken, async (req, res) => {
    try {
        const { fournisseur_id, produits } = req.body;

        // Pour chaque produit, récupérer la quantité actuelle et la mettre à jour
        for (let produit of produits) {
            // Récupérer le stock actuel pour ce produit
            const stockResponse = await Stock.findOne({
                'produits.produit_id': produit.produit_id
            }).sort({ date_entree: -1 });

            const quantiteActuelle = stockResponse ? stockResponse.produits.find(p => p.produit_id.equals(produit.produit_id)).quantite_actuelle : 0;

            // Calculer la nouvelle quantité actuelle
            produit.quantite_entree = produit.quantite_entree || 0;
            produit.quantite_sortie = produit.quantite_sortie || 0;
            produit.quantite_actuelle = quantiteActuelle + produit.quantite_entree;
        }

        const newStock = new Stock({
            fournisseur_id,
            produits,
            date_entree: new Date(),
            type: 'Entrée',
        });

        // Sauvegarde du stock
        await newStock.save();

        // Réponse de succès
        res.status(201).json(newStock);
    } catch (err) {
        // Gestion des erreurs
        res.status(400).json({ message: err.message });
    }
});


// Modifier un stock
router.put('/:id',verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        // Met à jour le stock uniquement si les produits sont fournis
        const updatedStock = await Stock.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedStock) {
            return res.status(404).json({ message: "Stock non trouvé" });
        }

        res.status(200).json(updatedStock);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Supprimer un stock
router.delete("/:id",verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const stock = await Stock.findById(id);

        if (!stock) {
            return res.status(404).json({ message: "Stock non trouvé" });
        }

        // Mettre à jour les quantités des produits après suppression
        for (let produit of stock.produits) {
            const produitDoc = await Produit.findById(produit.produit_id);
            if (produitDoc) {
                produitDoc.quantite_total -= produit.quantite_entree - produit.quantite_sortie;
                await produitDoc.save();
            }
        }

        // Supprimer le stock
        await Stock.findByIdAndDelete(id);
        res.status(200).json("Stock supprimé avec succès");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
