const User = require("../models/user");
const jwt = require("jsonwebtoken");


// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Accès refusé. Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        req.user = decoded;//await User.findById(decoded._id).select("-password"); // Exclut le mot de passe

        if (!req.user) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide." });
    }
};

module.exports = { verifyToken };
