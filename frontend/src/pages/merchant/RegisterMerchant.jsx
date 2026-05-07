import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, ShoppingBag, Building, MapPin, Phone, User, UserCircle } from "lucide-react";
import dripSwiftLogo from "/dripswift.png";

const ALLOWED_CITIES = ["Bordeaux", "Paris", "Cannes"];

const RegisterMerchant = () => {
  const [accountType, setAccountType] = useState("independent"); // "independent" ou "professional"
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    creatorName: "",
    shopName: "",
    email: "",
    password: "",
    confirmPassword: "",
    siret: "",
    location: "",
    phone: "",
    description: ""
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
    
    // Validation des champs obligatoires pour tous
    if (!formData.firstName.trim()) newErrors.firstName = "Prénom requis";
    if (!formData.lastName.trim()) newErrors.lastName = "Nom requis";
    if (!formData.shopName.trim()) newErrors.shopName = "Nom de boutique requis";
    if (!formData.email.trim()) newErrors.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email invalide";
    
    if (!formData.password) newErrors.password = "Mot de passe requis";
    else if (formData.password.length < 6)
      newErrors.password = "6 caractères minimum";
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    
    if (!formData.location.trim()) newErrors.location = "Ville requise";
    else if (!ALLOWED_CITIES.includes(formData.location)) newErrors.location = "Ville non prise en charge";
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis";

    // Validation conditionnelle pour SIRET
    if (accountType === "professional") {
      if (!formData.siret.trim()) {
        newErrors.siret = "Numéro SIRET requis pour un compte professionnel";
      } else if (!/^\d{14}$/.test(formData.siret.replace(/\s/g, ''))) {
        newErrors.siret = "SIRET invalide (14 chiffres)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await register(formData.email, formData.password, {
        role: 'shop_owner',
        firstName: formData.firstName,
        lastName: formData.lastName,
        display_name: formData.shopName,
        shopName: formData.shopName,
        phone: formData.phone,
        location: formData.location,
        accountType: accountType,
        siret: formData.siret
      });

      if (result.success) {
        navigate("/merchant/login", { state: { message: "Inscription réussie ! Veuillez vous connecter." } });
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

  const commonFields = [
    {
      name: "firstName",
      type: "text",
      placeholder: "Prénom *",
      icon: UserCircle
    },
    {
      name: "lastName",
      type: "text",
      placeholder: "Nom *",
      icon: UserCircle
    },
    {
      name: "shopName",
      type: "text",
      placeholder: "Nom de votre boutique *",
      icon: ShoppingBag
    },
    {
      name: "email",
      type: "email",
      placeholder: "Adresse email *",
      icon: null
    },
    {
      name: "phone",
      type: "tel",
      placeholder: "Téléphone *",
      icon: Phone
    },
    {
      name: "location",
      type: "select",
      placeholder: "Ville *",
      icon: MapPin
    },
    {
      name: "description",
      type: "text",
      placeholder: "Description de votre activité",
      icon: null
    }
  ];

  const passwordFields = [
    {
      name: "password",
      type: "password",
      placeholder: "Mot de passe *",
      icon: null
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirmez le mot de passe *",
      icon: null
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-card rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-12 relative overflow-hidden border border-border"
      >
        {/* Subtle Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green/20 to-transparent" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="relative mb-4">
            <img src={dripSwiftLogo} alt="Dripswift" className="w-24 h-auto drop-shadow-xl transition-all duration-500" />
            <div className="absolute -inset-4 bg-green/10 rounded-full blur-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 -z-10" />
          </motion.div>
          <h1 className="text-4xl font-black italic tracking-tighter flex items-center leading-none mb-3">
            <span className="text-primary-dark dark:text-white">DRIP</span>
            <span className="text-green dark:text-green-light">SWIFT</span>
          </h1>
          <p className="text-text-light text-[10px] uppercase tracking-[0.4em] font-bold">
            Rejoignez notre réseau d'excellence
          </p>
        </motion.div>

        {/* Account Type Selector - Refined */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <button
            onClick={() => setAccountType("independent")}
            className={`pb-4 text-center transition-all border-b-2 ${
              accountType === "independent" ? "border-green text-green" : "border-transparent text-text-light hover:text-text-medium"
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Indépendant</span>
          </button>
          <button
            onClick={() => setAccountType("professional")}
            className={`pb-4 text-center transition-all border-b-2 ${
              accountType === "professional" ? "border-green text-green" : "border-transparent text-text-light hover:text-text-medium"
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Professionnel</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {commonFields.map((field) => (
              <div key={field.name} className={field.name === "description" ? "md:col-span-2" : ""}>
                <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">
                  {field.placeholder.replace(' *', '')}
                </label>
                {field.name === "location" ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`w-full py-2 bg-transparent border-b text-text-dark focus:outline-none transition-all duration-300 ${
                      errors[field.name] ? "border-danger" : "border-border focus:border-green"
                    }`}
                  >
                    <option value="">Choisir une ville</option>
                    {ALLOWED_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder="..."
                    className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                      errors[field.name] ? "border-danger" : "border-border focus:border-green"
                    }`}
                  />
                )}
                {errors[field.name] && (
                  <p className="text-danger text-[9px] mt-1 italic">{errors[field.name]}</p>
                )}
              </div>
            ))}

            {accountType === "professional" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">Numéro SIRET</label>
                <input
                  type="text"
                  name="siret"
                  value={formData.siret}
                  onChange={handleChange}
                  placeholder="14 chiffres"
                  className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                    errors.siret ? "border-danger" : "border-border focus:border-green"
                  }`}
                />
              </motion.div>
            )}

            {passwordFields.map((field) => (
              <div key={field.name}>
                <label className="block text-[10px] uppercase tracking-widest text-text-medium font-bold mb-2">
                  {field.placeholder.replace(' *', '')}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full py-2 bg-transparent border-b text-text-dark placeholder:text-text-light/30 focus:outline-none transition-all duration-300 ${
                    errors[field.name] ? "border-danger" : "border-border focus:border-green"
                  }`}
                />
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-text-dark text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-green transition-all duration-500 disabled:opacity-50 mt-8 shadow-sm"
          >
            {loading ? "Traitement..." : "Créer mon compte partenaire"}
          </motion.button>

          <div className="text-center pt-6">
            <p className="text-[11px] text-text-light uppercase tracking-widest">
              Déjà partenaire ?{" "}
              <Link to="/merchant/login" className="text-green font-bold hover:text-green-dark">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterMerchant;