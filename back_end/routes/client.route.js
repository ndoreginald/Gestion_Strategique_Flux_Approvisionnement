const express = require("express");
const router = express.Router();
const Vente = require("../models/vente");
const client = require("../models/client");
const { verifyToken } = require("../middlewares/auth");


async function updateClientActivity(clientId) {
  // 1. Récupérer toutes les ventes du client
  const ventes = await Vente.find({ client_id: clientId });
  if (ventes.length === 0) return;

  // 2. Calculer les indicateurs clés
  const now = new Date();
  const last30Days = new Date(now.setDate(now.getDate() - 30));

  // Fréquence (30%)
  const ventesRecent = ventes.filter(v => v.date_vente >= last30Days);
  const freqScore = (ventesRecent.length / ventes.length) * 30;

  // Volume TTC (50%)
  const totalTtc = ventes.reduce((sum, v) => sum + v.total_ttc, 0);
  const volumeScore = (totalTtc / 10000) * 50; // 10 000 € = référence

  // Délai de paiement (0%)
  //const paiementScore = ventes.some(v => v.paymentTerms && !v.statut.includes("Validée")) 
  //  ? 0 : 20; // Pénalité si paiement en retard

  // Annulations (20%)
  const annulations = ventes.filter(v => v.statut === "Annulée" || v.statut === "Remboursée").length;
  const annulScore = 10 - (annulations / ventes.length) * 20;

  // 3. Score final [0, 100]
  const activity = Math.min(100, freqScore + volumeScore + annulScore);

  // 4. Mise à jour
  await client.updateOne(
    { _id: clientId },
    { activity: Math.round(activity) }
  );
}


// Afficher la liste des clients
router.get("/",verifyToken, async (req, res) => {
    try {
        const clients = await client.find({}, null, { sort: { nom: "asc" } });
        res.status(200).json(clients);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


// Afficher un client par ID
router.get("/:id",verifyToken, async (req, res) => {
    try {
        const { id } = req.params; // Récupère l'ID de l'URL
        const client = await client.findById(id); // Recherche le client par son ID

        if (!client) {
            return res.status(404).json({ message: "Client non trouvé" });
        }

        res.status(200).json(client); // Retourne les informations du client
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gère les erreurs
    }
});

  
// Route pour créer un client
router.post('/',verifyToken, async (req, res) => {
    try {
        const { nom, email, adresse, telephone, statut,joinDate,activity,} = req.body;
        const newClient = new client(req.body);
        await newClient.save();
        res.status(201).json(newClient);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Modifier un utilisateur
router.put('/:id',verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        const updatedClient = await client.findByIdAndUpdate(
            id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json(updatedClient);
    } catch (error) {
        res.status(404).json({ "message": error.message });
    }
});

// Supprimer un client
router.delete("/:id",verifyToken, async (req, res) => {
    const id = req.params.id;
    try {
        await client.findByIdAndDelete(id);
        res.status(200).json("Client deleted successfully");
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


module.exports = router;