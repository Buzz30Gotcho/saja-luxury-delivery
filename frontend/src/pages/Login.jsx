import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import dripSwiftLogo from "/dripswift.png";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = typeof location.state?.from === 'string' ? location.state.from : '/';

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
      // Utilisation de la fonction login du contexte qui gère tout (signIn + profil)
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        setErrors({ submit: result.error || "Erreur lors de la connexion" });
      } else {
        // Redirection vers la page d'origine (ou home par défaut)
        navigate(redirectTo);
      }
    } catch (error) {
      console.error("Login page error:", error);
      setErrors({ submit: "Une erreur inattendue est survenue" });
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
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] p-16 relative overflow-hidden border border-border"
      >
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="mb-12 flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative mb-8"
            >
              <img
                src={dripSwiftLogo}
                alt="Dripswift"
                className="w-48 md:w-64 h-auto transition-all duration-500 mix-blend-multiply brightness-[1.02] contrast-[1.02] dark:invert dark:mix-blend-screen"
              />
            </motion.div>
          </div>        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Email */}
          <div className="space-y-3">
            <label className="block text-xl uppercase tracking-widest text-text-medium font-bold">Email</label>
            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-black transition-colors" size={24} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`w-full pl-11 py-3 bg-transparent border-b text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.email || errors.password
                    ? "border-danger" 
                    : "border-border focus:border-black"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-danger text-lg mt-1 flex items-center italic">
                {errors.email}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="block text-xl uppercase tracking-widest text-text-medium font-bold">Mot de passe</label>
              <Link 
                to="/forgot-password" 
                className="text-lg text-text-light hover:text-green transition-colors uppercase tracking-widest"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-black transition-colors" size={24} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-11 py-3 bg-transparent border-b text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.email || errors.password
                    ? "border-danger" 
                    : "border-border focus:border-black"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-text-light hover:text-green transition-colors"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-danger text-lg mt-1 flex items-center italic">
                {errors.password}
              </p>
            )}
          </div>

          {/* Erreur de soumission */}
          {errors.submit && (
            <div className="text-danger text-base bg-danger/5 p-4 rounded-sm border border-danger/10 text-center italic">
              {errors.submit}
            </div>
          )}

          {/* Bouton de connexion */}
          <motion.button
            whileHover={{ y: -2, shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
            whileTap={{ y: 0 }}
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-green text-white text-base font-bold uppercase tracking-[0.25em] rounded-xl hover:bg-green-dark transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <Loader2 className="animate-spin w-6 h-6 mx-auto" />
            ) : (
              "Se connecter"
            )}
          </motion.button>

          {/* Séparateur */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-6 text-xs text-text-light uppercase tracking-[0.3em] font-bold">ou</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Bouton Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 border border-border rounded-xl flex items-center justify-center gap-4 text-sm text-text-medium uppercase tracking-widest hover:bg-muted transition-all duration-300 font-bold"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-5 h-5 grayscale opacity-70"
            />
            Se connecter avec Google
          </button>

          {/* Lien vers l'inscription */}
          <div className="text-center pt-6">
            <p className="text-sm text-text-light uppercase tracking-widest">
              Pas de compte ?{" "}
              <Link
                to="/register"
                className="text-black font-black hover:underline transition-all ml-2"
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

export default Login;;