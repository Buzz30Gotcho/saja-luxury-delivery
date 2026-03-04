import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import localStyleLogo from "/localstyle.png";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
      // Utilisation du service d'authentification
      const { data, error } = await authService.signIn(formData.email, formData.password);

      if (error) {
        setErrors({ submit: error.message });
      } else if (data.user) {
        // Récupération du profil complet si nécessaire
        const profile = await authService.getUserProfile(data.user.id);
        
        login({
          email: data.user.email,
          id: data.user.id,
          user_metadata: data.user.user_metadata || {},
          profile: profile.data || {}
        });
        
        // Redirection vers la home page
        navigate("/");
      }
    } catch (error) {
      setErrors({ submit: "Erreur lors de la connexion" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await authService.signInWithGoogle();
      
      if (error) {
        setErrors({ submit: error.message });
      }
      // La redirection est gérée par Supabase OAuth (vers l'URL définie dans authService)
    } catch (error) {
      setErrors({ submit: "Erreur lors de la connexion avec Google" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-card rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-12 relative overflow-hidden border border-border"
      >
        {/* Subtle Decorative Elements */}
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
            Localstyle
          </h1>
          <p className="text-text-light text-sm uppercase tracking-widest font-medium">
            Bienvenue
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-text-medium font-semibold">Email</label>
            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-green transition-colors" size={16} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`w-full pl-7 py-3 bg-transparent border-b text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.email 
                    ? "border-danger" 
                    : "border-border focus:border-green"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-danger text-[10px] mt-1 flex items-center italic">
                {errors.email}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block text-[11px] uppercase tracking-widest text-text-medium font-semibold">Mot de passe</label>
              <Link 
                to="/forgot-password" 
                className="text-[10px] text-text-light hover:text-green transition-colors uppercase tracking-wider"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-green transition-colors" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-7 py-3 bg-transparent border-b text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
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
              <p className="text-danger text-[10px] mt-1 flex items-center italic">
                {errors.password}
              </p>
            )}
          </div>

          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="text-danger text-[11px] bg-danger/5 p-3 rounded-sm border border-danger/10 text-center italic">
              {errors.submit}
            </div>
          )}

          {/* Bouton de connexion */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green text-white text-[12px] font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-green-dark transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? (
              <Loader2 className="animate-spin w-4 h-4 mx-auto" />
            ) : (
              "Se connecter"
            )}
          </motion.button>

          {/* Séparateur */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-4 text-[10px] text-text-light uppercase tracking-widest">ou</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Bouton Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 border border-border rounded-sm flex items-center justify-center gap-3 text-[11px] text-text-medium uppercase tracking-widest hover:bg-muted transition-all duration-300"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-4 h-4 grayscale opacity-70"
            />
            Google
          </button>

          {/* Lien vers l'inscription */}
          <div className="text-center pt-4">
            <p className="text-[11px] text-text-light uppercase tracking-widest">
              Pas de compte ?{" "}
              <Link
                to="/register"
                className="text-green font-bold hover:text-green-dark transition-colors"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;