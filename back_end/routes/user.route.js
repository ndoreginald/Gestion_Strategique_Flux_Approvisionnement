const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { verifyToken } = require("../middlewares/auth");
//const Redis = require("ioredis");
//const redis = new Redis(); // Par défaut, Redis tourne sur localhost:6379


// Générer un Access token
const generateAccessToken = async(userId, email, role, telephone, nom, password) => {
const token = jwt.sign(
        { userId, email , role, telephone, nom, password},process.env.ACCESS_TOKEN_SECRET,{ expiresIn: "30m" } 
    );

    console.log("Token généré:", jwt.decode(token)); 
    return token;
};


// Générer un refresh token (valide pendant 1 jour)
const generateRefreshToken = async(userId) => {
    return jwt.sign( {userId} , process.env.REFRESH_TOKEN_KEY, { expiresIn: "1d" });
};

//Afficher la liste des utilisateurs
router.get("/users",verifyToken, async (req,res) => {
    try {
        const users = await User.find({},null,{sort:{nom:"asc"}});
        res.status(200).json(users);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


router.get("/users/me/profile",verifyToken, async(req,res) => {
    try {
       return  res.status(200).json({data: req.user});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
  });


// Route pour s'authentifier un utilisateur
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }
        const refreshToken = await generateRefreshToken(user._id);
        const accessToken = await generateAccessToken(user._id, user.email, user.role, user.telephone, user.nom, user.password);

        // Gestion des tokens multiples
        user.refreshTokens = user.refreshTokens || [];
        // Limite à 2 tokens maximum
        if (user.refreshTokens.length >= 2) {
            user.refreshTokens.shift(); // Supprime le plus ancien token
        }
        user.refreshTokens.push(refreshToken);
        await user.save();

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
        const accessToken = await generateAccessToken( user._id, user.email, user.role , user.telephone, user.nom, user.password);
        const refreshToken = await generateRefreshToken(user._id);
        res.status(201).json({ user, accessToken, refreshToken });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
  });



// Rafraîchir l'Access Token
router.get("/refresh-tokens" , verifyToken, async (req, res) => {
    console.log("Clé secrète utilisée :", process.env.ACCESS_TOKEN_SECRET);
    console.log("📡 Requête reçue pour récupérer l'utilisateur :", req.user.id);
    try {
        const userId = req.user.id;
        const user = await User.findOne({ _id:userId });
        const refreshToken = await generateRefreshToken(user._id);
        const accessToken = await generateAccessToken(user._id, user.email, user.role, user.telephone, user.nom, user.password);

        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(401).json({ error: "Refresh token invalide ou expiré." });
    }
});

  
// Route pour créer un utilisateur
router.post('/users', async (req, res) => {
    try {
        const { nom, email, password, telephone } = req.body;
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//modifier un utilisateur par l'admin
router.put('/me/profile',verifyToken,async (req,res)=>{
    try {
        const userId = req.user.id; // Récupéré depuis le token JWT
        const { nom, email, telephone, adresse } = req.body;
    
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    
        // Mettre à jour les informations
        user.nom = nom || user.nom;
        user.email = email || user.email;
        user.telephone = telephone || user.telephone;
        user.password = password || user.password;
    
        // Sauvegarder dans la base de données
        await user.save();
    
        res.status(200).json({ message: "Profil mis à jour avec succès", user });
      } catch (error) {
        console.error("Erreur de mise à jour :", error);
        res.status(500).json({ message: "Erreur serveur" });
      }
});

router.put('/users/:id/update-role', verifyToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
  
      if (!["admin", "user"].includes(role)) {
        return res.status(400).json({ error: "Rôle invalide." });
      }
  
      const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      }
  
      res.status(200).json({ message: "Rôle mis à jour.", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

//modifier un utilisateur connecté
router.put('/users/me/profile', verifyToken, async (req, res) => {
    try {
        console.log("Utilisateur connecté :", req.user); 
        console.log("Requête reçue :", req.body);

        if (!req.user || !req.user.userId) {
            console.log("ID utilisateur dans le token :", req.user ? req.user.userId : "Aucun utilisateur trouvé");
            return res.status(400).json({ message: "Utilisateur non authentifié." });
        }

        // Mise à jour des champs autorisés
        if (req.body.password && req.body.password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }        

        // Mettre à jour et récupérer le document Mongoose
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,  // Correction ici
            { $set: req.body },
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            console.log("Aucun utilisateur trouvé avec cet ID :", req.user.userId);
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



//Supprimer un utilisateur
router.delete("/users/:id",verifyToken, async (req, res) =>{
    const { id } = req.params; // ID de l'utilisateur à supprimer

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }
        res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour se déconnecter
router.post("/logout" ,verifyToken, async (req, res) => {
    //const refreshToken = req.headers.authorization || req.query.token || req.body.token;
    const refreshToken = req.headers.authorization ;
    if (!refreshToken) {
        return res.status(400).json({ error: "Aucun refresh token fourni" });
    }
    // Supprime le Refresh Token de la base de données
  await User.updateOne({ refreshTokens: refreshToken }, { $pull: { refreshTokens: refreshToken } },{ new: true });

  res.json({ message: "Déconnexion réussie" });
});

// Afficher un utilisateur par ID
router.get("/users/:id", verifyToken, async (req, res) => {
    try {
        console.log("📡 Requête reçue pour récupérer l'utilisateur :", req.params.id);

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("❌ ID invalide :", id);
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        const utilisateur = await User.findById(id);
        if (!utilisateur) {
            console.log("❌ Utilisateur non trouvé pour l'ID :", id);
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        console.log("✅ Utilisateur trouvé :", utilisateur);
        res.status(200).json(utilisateur);
    } catch (error) {
        console.error("🔥 Erreur serveur :", error.message);
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;