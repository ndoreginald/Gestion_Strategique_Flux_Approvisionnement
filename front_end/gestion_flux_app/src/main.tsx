import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import SignIn from "./auth/SignIn.tsx";
import SignUp from "./auth/SignUp.tsx";
import Dashboard from "./component/menuItems/Dashboard.tsx";
import AdminProtectedRoute from "./auth/AdminProtectedRoute.tsx";
import Users from "./component/menuItems/Users.tsx";
import Fournisseurs from "./component/menuItems/Fournisseurs.tsx";
import Client from "./component/menuItems/Client.tsx";
import EditProfile from "./user/EditProfile.tsx";
import ProfileView from "./user/ProfileView.tsx";
import AddClient from "./client/AddClient.tsx";
import FournisseurAdd from "./fournisseur/FournisseurAdd.tsx";
import AddCategorie from "./categorie/AddCategorie.tsx";
import Categorie from "./component/menuItems/Categorie.tsx";
import Produit from "./component/menuItems/Produit.tsx";
import AddProduit from "./produit/AddProduit.tsx";
import Achat from "./component/menuItems/Achat.tsx";
import AddAchat from "./achat/AddAchat.tsx";
import ReceptionPage from "./achat/ReceptionPage.tsx";
import ValidationPage from "./achat/ValidationPage.tsx";
import ValidationList from "./achat/ValidationList.tsx";
import AddVente from "./vente/AddVente.tsx";
import PurchaseOrders from "./component/menuItems/PurchaseOrders.tsx";
import Devis from "./component/menuItems/Devis.tsx";
import Stocks from "./component/menuItems/Stocks.tsx";
import Vente from "./component/menuItems/Vente.tsx";
import { StockFinanceDashboard } from "./stock/StockFinanceDashboard.tsx";
import Budget from "./component/menuItems/Budget.tsx";
import App from "./App.tsx";
import BudgetForm from "./budget/BudgetForm.tsx";
import QuoteStats from "./devis/QuoteStats.tsx";
import ListDevis from "./devis/ListDevis.tsx";
import AddDevis from "./devis/AddDevis.tsx";

function Main() {

  return (
    <BrowserRouter>
      <AuthProvider>
        
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fournisseurs" element={<Fournisseurs />} />
            <Route path="/fournisseurs/add-fournisseur" element={<FournisseurAdd />} />
            <Route path="/clients" element={<Client/>} />
            <Route path="/clients/add-client" element={<AddClient/>} />
            <Route path="/edit-user-profil" element={<EditProfile/>} />
            <Route path="/view-user-profil" element={<ProfileView/>} />
            <Route path="/categorie/add-categorie" element={<AddCategorie/>} />
            <Route path="/categorie/list-categorie" element={<Categorie />} />
            <Route path="/produit/list-produit" element={<Produit />} />
            <Route path="/produit/add-produit" element={<AddProduit />} />
            <Route path="/achats/list-achats" element={<Achat />} />
            <Route path="/achats/:achatId" element={<Achat />} />
            <Route path="/achats/add-achat" element={<AddAchat />} />
            <Route path="/reception/:achatId" element={<ReceptionPage />} />
            <Route path="/validation/list-validations" element={<ValidationList />} />
            <Route path="/validation/:achatId" element={<ValidationPage />} />
            <Route path="/vente/add-vente" element={<AddVente />} />
            <Route path="/vente/list-vente" element={<Vente />} />
            <Route path="/vente/:id" element={<Vente />} />
            <Route path="/PurchaseOrders/list-PurchaseOrders" element={<PurchaseOrders />} />
            <Route path="/PurchaseOrders/:id" element={<PurchaseOrders />} />
            <Route path="/devis/list-devis" element={<Devis />} />
            <Route path="/stocks/view-stock" element={<Stocks />} />
            <Route path="/stocks/finances" element={<StockFinanceDashboard />} />

            <Route path="/budget/view-budget" element={<Budget />} />
            <Route path="/budget/form" element={<BudgetForm />} />

            <Route path="/devis/stat" element={<ListDevis />} />
            <Route path="/devis/add-devis" element={<AddDevis />} />

            {/* Protected routes for admin */}
            <Route element={<AdminProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/users" element={<Users />} />
            </Route>
          </Routes>
        
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<Main />); 

export default Main;
