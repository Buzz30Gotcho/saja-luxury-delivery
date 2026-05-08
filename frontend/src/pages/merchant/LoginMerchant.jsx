import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";

// Import de l'image locale
import dripSwiftLogo from "/dripswift.png";

const LoginMerchant = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate("/merchant/dashboard");
      } else {
        setErrors({ submit: result.error });
      }
    } catch (err) {
      setErrors({ submit: "Identifiants incorrects." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-12 relative overflow-hidden border border-border"
      >
        {/* Subtle Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <motion.div whileHover={{ scale: 1.1, rotate: -5 }} className="relative mb-4">
            <img src={dripSwiftLogo} alt="Dripswift" className="w-64 h-auto drop-shadow-sm transition-all duration-500 mix-blend-multiply" />
          </motion.div>
          
          <p className="text-text-medium text-xl md:text-2xl uppercase tracking-[0.4em] font-bold">
            Gérer votre boutique
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xl uppercase tracking-widest text-text-medium font-semibold">Email Professionnel</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@boutique.com"
              className={`w-full py-3 bg-transparent border-b text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                errors.email 
                  ? "border-danger" 
                  : "border-border focus:border-black"
              }`}
            />
            {errors.email && (
              <p className="text-danger text-lg mt-1 italic">{errors.email}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block text-xl uppercase tracking-widest text-text-medium font-semibold">Mot de passe</label>
            </div>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full py-3 pr-10 bg-transparent border-b text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.password 
                    ? "border-danger" 
                    : "border-border focus:border-black"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-text-light hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-danger text-lg mt-1 italic">{errors.password}</p>
            )}
          </div>

          {/* Bouton de connexion */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-text-dark text-white text-lg font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-black transition-all duration-500 disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5 mx-auto" />
            ) : (
              "Accéder au Dashboard"
            )}
          </motion.button>

          {/* Lien vers l'inscription */}
          <div className="text-center pt-4">
            <p className="text-sm text-text-light uppercase tracking-widest">
              Pas encore partenaire ?{" "}
              <Link
                to="/merchant/register"
                className="text-text-dark font-bold hover:underline transition-colors"
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