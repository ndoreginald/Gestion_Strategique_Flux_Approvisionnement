const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
//const session = require('express-session');
//const cookieParser = require("cookie-parser");

const utilisateurRouter = require("./routes/user.route");
const clientRouter = require("./routes/client.route");
const produitRouter = require("./routes/produit.route");
const categorieRouter = require("./routes/categorie.route");
const fournisseurRouter = require("./routes/fournisseur.route");
const achatRouter = require("./routes/achat.route");
const receptionRouter = require("./routes/reception.route");
const venteRouter = require("./routes/vente.route");
const stockRouter = require("./routes/stock.route");
const budgetRouter = require("./routes/budget.route");
const devisRouter = require("./routes/devis.route");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173'}));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.get("/",(req,res)=> {
    res.send({"message":"Welcome to Server of gestionDB"});
} );


// Connect to MongoDB database
mongoose.connect(process.env.DATABASE)
  .then(() => {
    console.log("DataBase Successfully Connected");
  })
  .catch((err) => {
    console.log("Unable to connect to database", err);
    process.exit();
  });

app.use("/gestionFluxDB/",utilisateurRouter); 
app.use("/gestionFluxDB/client/",clientRouter);  
app.use("/gestionFluxDB/produit/",produitRouter); 
app.use("/gestionFluxDB/categorie/",categorieRouter );
app.use("/gestionFluxDB/fournisseur/",fournisseurRouter );
app.use("/gestionFluxDB/achat/",achatRouter);
app.use("/gestionFluxDB/reception/",receptionRouter); 
app.use("/gestionFluxDB/vente/",venteRouter); 
app.use("/gestionFluxDB/stock/",stockRouter);
app.use("/gestionFluxDB/budget/",budgetRouter);
app.use("/gestionFluxDB/devis/",devisRouter); 

app.listen(process.env.PORT, () => {
    console.log("Server listen to "+process.env.PORT);
} )

module.exports = app;