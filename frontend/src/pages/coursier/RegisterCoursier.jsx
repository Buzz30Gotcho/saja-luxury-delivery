import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, Truck, MapPin, Phone, UserCircle } from "lucide-react";
import dripSwiftLogo from "/dripswift.png";

const ALLOWED_CITIES = {
  "Bordeaux": { lat: 44.8378, lng: -0.5792 },
  "Paris": { lat: 48.8566, lng: 2.3522 },
  "Cannes": { lat: 43.5528, lng: 7.0174 }
};

const RegisterCoursier = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicleType: "bike", // bike, scooter, car
    city: "Bordeaux"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
    if (!formData.email.trim()) newErrors.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email invalide";
    
    if (!formData.password) newErrors.password = "Mot de passe requis";
    else if (formData.password.length < 6)
      newErrors.password = "6 caractères minimum";
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    
    if (!formData.city) newErrors.city = "Ville requise";
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const cityCoords = ALLOWED_CITIES[formData.city] || { lat: 48.8566, lng: 2.3522 };

      const result = await register(formData.email, formData.password, {
        role: 'delivery_person',
        firstName: formData.firstName,
        lastName: formData.lastName,
        display_name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        location: formData.city,
        city: formData.city,
        lat: cityCoords.lat,
        lng: cityCoords.lng,
        vehicleType: formData.vehicleType
      });

      if (result.success) {
        navigate("/coursier/login", { state: { message: "Inscription réussie ! Veuillez vous connecter." } });
      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setErrors({ submit: "Une erreur est survenue lors de l'inscription." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-card rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-12 relative overflow-hidden border border-border"
      >
        {/* Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="mb-6 flex justify-center">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src={dripSwiftLogo} 
              alt="Dripswift" 
              className="w-20 h-auto grayscale brightness-90 hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-text-dark mb-2">
            Devenir Coursier
          </h1>
          <p className="text-text-light text-[10px] uppercase tracking-[0.3em] font-bold">
            Livrez avec Dripswift
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="..."
                className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                  errors.firstName ? "border-danger" : "border-border focus:border-blue-500"
                }`}
              />
              {errors.firstName && <p className="text-danger text-[9px] mt-1 italic">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="..."
                className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                  errors.lastName ? "border-danger" : "border-border focus:border-blue-500"
                }`}
              />
              {errors.lastName && <p className="text-danger text-[9px] mt-1 italic">{errors.lastName}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="..."
                className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                  errors.email ? "border-danger" : "border-border focus:border-blue-500"
                }`}
              />
              {errors.email && <p className="text-danger text-[9px] mt-1 italic">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="..."
                className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                  errors.phone ? "border-danger" : "border-border focus:border-blue-500"
                }`}
              />
              {errors.phone && <p className="text-danger text-[9px] mt-1 italic">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Ville</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full py-2 bg-transparent border-b text-text-dark focus:outline-none transition-all duration-300 ${
                  errors.city ? "border-danger" : "border-border focus:border-blue-500"
                }`}
              >
                {Object.keys(ALLOWED_CITIES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="text-danger text-[9px] mt-1 italic">{errors.city}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Type de véhicule</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full py-2 bg-transparent border-b text-text-dark focus:outline-none border-border focus:border-blue-500"
              >
                <option value="bike">Vélo</option>
                <option value="scooter">Scooter</option>
                <option value="car">Voiture</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                  errors.password ? "border-danger" : "border-border focus:border-blue-500"
                }`}
              />
              {errors.password && <p className="text-danger text-[9px] mt-1 italic">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Confirmez</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                  errors.confirmPassword ? "border-danger" : "border-border focus:border-blue-500"
                }`}
              />
              {errors.confirmPassword && <p className="text-danger text-[9px] mt-1 italic">{errors.confirmPassword}</p>}
            </div>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-blue-600 transition-all duration-500 disabled:opacity-50 mt-8 shadow-sm"
          >
            {loading ? "Traitement..." : "Créer mon compte coursier"}
          </motion.button>

          <div className="text-center pt-6">
            <p className="text-[11px] text-text-light uppercase tracking-widest">
              Déjà coursier ?{" "}
              <Link to="/coursier/login" className="text-blue-500 font-bold hover:text-blue-700">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterCoursier;

