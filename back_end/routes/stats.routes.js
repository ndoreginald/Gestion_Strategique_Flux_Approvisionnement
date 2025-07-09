const express = require('express');
const router = express.Router();
const statsService = require('../services/stats.service');
//const { validateToken } = require('../middlewares/auth'); // Si vous avez une authentification
const { verifyToken } = require("../middlewares/auth");


router.get('/finance-summary',verifyToken, async (req, res) => {
    try {
      const { period } = req.query;
      const data = await statsService.getFinanceSummary(period);
      
      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
  

  router.get('/inventory-value',verifyToken, async (req, res) => {
    try {
      const value = await statsService.getInventoryValue();
      res.json({ success: true, data: value });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  
module.exports = router;