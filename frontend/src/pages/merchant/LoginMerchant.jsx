import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";

// Import de l'image locale
import localStyleLogo from "/localstyle.png";

const LoginMerchant = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email invalide";
    if (!formData.password) newErrors.password = "Mot de passe requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setTimeout(() => {
      navigate("/merchant/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-card rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-12 relative overflow-hidden border border-border"
      >
        {/* Subtle Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green/20 to-transparent" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="mb-6 flex justify-center">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src={localStyleLogo} 
              alt="LocalStyle" 
              className="w-20 h-auto grayscale brightness-90 hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-text-dark mb-2">
            Espace Créateur
          </h1>
          <p className="text-text-light text-[10px] uppercase tracking-[0.3em] font-bold">
            Gérer votre boutique
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-text-medium font-semibold">Email Professionnel</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@boutique.com"
              className={`w-full py-3 bg-transparent border-b text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                errors.email 
                  ? "border-danger" 
                  : "border-border focus:border-green"
              }`}
            />
            {errors.email && (
              <p className="text-danger text-[10px] mt-1 italic">{errors.email}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block text-[11px] uppercase tracking-widest text-text-medium font-semibold">Mot de passe</label>
            </div>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full py-3 pr-10 bg-transparent border-b text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.password 
                    ? "border-danger" 
                    : "border-border focus:border-green"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-text-light hover:text-green transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-danger text-[10px] mt-1 italic">{errors.password}</p>
            )}
          </div>

          {/* Bouton de connexion */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-text-dark text-white text-[12px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-green transition-all duration-500 disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4 mx-auto" />
            ) : (
              "Accéder au Dashboard"
            )}
          </motion.button>

          {/* Lien vers l'inscription */}
          <div className="text-center pt-4">
            <p className="text-[11px] text-text-light uppercase tracking-widest">
              Pas encore partenaire ?{" "}
              <Link
                to="/merchant/register"
                className="text-green font-bold hover:text-green-dark transition-colors"
              >
                Rejoindre le réseau
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginMerchant;