const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const utilisateur = require("../models/utilisateur");



// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Accès refusé. Token manquant ou mal formé." });
    }

    const token = authHeader.split(" ")[1].trim();

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
        console.log("Utilisateur connecté :", req.user);
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ error: "Token expiré. Veuillez vous reconnecter." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Token invalide." });
        }
        return res.status(500).json({ error: "Erreur interne lors de la vérification du token." });
    }
};

// Générer un Access token
const generateAccessToken = (userId, email, role) => {
    return jwt.sign({ userId, email , role}, process.env.TOKEN_KEY, {
        expiresIn: "1m", // Durée de validité du token
    });
};

// Générer un refresh token (valide pendant 1 jour)
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "1d" });
};

//Afficher la liste des utilisateurs
router.get("/users",verifyToken, async (req,res) => {
    try {
        const users = await utilisateur.find({},null,{sort:{nom:"asc"}});
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
} );

// Afficher un utilisateur par ID
router.get("/users/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params; // Récupère l'ID de l'URL
        const utilisateur = await utilisateur.findById(id); // Recherche l'utilisateur par son ID

        if (!utilisateur) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json(utilisateur); // Retourne les informations de l'utilisateur
    } catch (error) {
        res.status(500).json({ message: error.message }); // Gère les erreurs
    }
});


// Afficher  L'utilisateur connecté
router.get("/users/me",verifyToken, async (req, res) => {
    res.send(req.user);
});


// Route pour s'authentifier un utilisateur
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }
        const accessToken = generateAccessToken(user._id, user.email, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Stocker le refresh token dans la base de données
        user.refreshToken = refreshToken;
        await user.save();

        // Renvoyer le JWT et le refresh token au client
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, // Le cookie n'est accessible que par le serveur
            secure: process.env.NODE_ENV === "production", // HTTPS en production
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 jour
        });

        res.json({ user: { id: user._id, email: user.email, role: user.role }, accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });

// Inscription d'un utilisateur
router.post("/register", async (req, res) => {
    const { nom, email, password, telephone } = req.body;
    console.log("Données reçues:", req.body);
    try {
        const user = new User(req.body);
        await user.save();
        const accessToken = generateAccessToken(user._id, user.email, user.role);
        const refreshToken = generateRefreshToken(user._id)
        res.status(201).json({ user, accessToken, refreshToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  });

router.post("/refresh-token", async (req, res) => {
    // Récupérer le refreshToken depuis les headers (exemple : Authorization: Bearer <token>)
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Refresh token manquant ou mal formé." });
    }

    // Extraire uniquement le token
    const refreshToken = authHeader.split(" ")[1];

    try {
        // Vérifier le refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);

        // Vérifier si le refresh token est valide dans la base de données
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ error: "Refresh token invalide." });
        }

        // Générer un nouveau JWT
        const accessToken = generateAccessToken(user._id, user.email, user.role);

        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(401).json({ error: "Refresh token invalide ou expiré." });
    }
});

  
// Route pour créer un utilisateur
router.post('/users', async (req, res) => {
    try {
        const { nom, email, password, telephone } = req.body;
        const newUser = new utilisateur(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//modifier un utilisateur
router.put('/users/:id',verifyToken,async (req,res)=>{
    const id=req.params.id;
    try {
        // Vérifier si le champ password est modifié dans req.body
        if (req.body.password) {
            // Générer un salt pour le hachage
            const salt = await bcrypt.genSalt(10);
            // Hasher le nouveau mot de passe avec le salt
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        const user =  await utilisateur.findByIdAndUpdate(
            id, 
            { $set: req.body } , 
            { new : true }
        ) ;
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ "message": error.message });
    }
});

//Supprimer un utilisateur
router.delete("/users/:id",verifyToken, async (req, res) =>{
    const { id } = req.params; // ID de l'utilisateur à supprimer

    try {
        const user = await utilisateur.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }
        res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour se déconnecter
router.post("/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body; // Récupérer depuis la requête

        console.log("Token reçu pour déconnexion :", refreshToken);

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token manquant." });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
        } catch (err) {
            return res.status(401).json({ error: "Token invalide ou expiré." });
        }

        const user = await utilisateur.findById(decoded.userId);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.status(200).json({ message: "Déconnexion réussie." });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur lors de la déconnexion." });
    }
});


module.exports = router;