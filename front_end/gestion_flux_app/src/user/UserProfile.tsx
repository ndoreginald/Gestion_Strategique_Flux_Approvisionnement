import { useState, useEffect } from "react";
import EditProfile from "./EditProfile";
import ProfileView from "./ProfileView";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    nom: "",
    role: "",
    email: "",
    telephone: "",
    password: "",
  });
  

  const [reload, setReload] = useState(false); // Nouvel état pour recharger

  // Fonction pour récupérer les données du profil
  const fetchProfile = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          console.log("❌ Token manquant. Redirection...");
          navigate('/');
          return;
        }
      const response = await axios.get("http://localhost:4001/gestionFluxDB/users/me/profile", {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      setProfile(response.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement du profil :", error);
    }
  };

  // Charger les données au montage et après chaque mise à jour
  useEffect(() => {
    fetchProfile();
  }, [reload]); // Dépendance à reload

  const handleSave = async (updatedProfile: typeof profile) => {
    try {
      await axios.put("http://localhost:4001/gestionFluxDB/users/me/profile", updatedProfile, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` },
      });
      
      setIsEditing(false);
      setReload((prev) => !prev); // Change reload pour re-déclencher useEffect
      
      navigate("/view-user-profil");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil :", error);
    }
  };

  return isEditing ? (
    <EditProfile profile={profile} onSave={handleSave} onCancel={() => setIsEditing(false)} />
  ) : (
    <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
  );
}

export default UserProfile;
