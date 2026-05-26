import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import sajaLogo from "/saja.png";

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
  const [tempMessage, setTempMessage] = useState(location.state?.registrationSuccess ? "Compte créé avec succès !" : "");

  React.useEffect(() => {
    if (tempMessage) {
      const timer = setTimeout(() => setTempMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [tempMessage]);

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
      if (!result.success) {
        setErrors({ submit: result.error || "Erreur lors de la connexion" });
      } else {
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
      if (error) setErrors({ submit: error.message });
    } catch (error) {
      setErrors({ submit: "Erreur lors de la connexion avec Google" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl bg-white shadow-[0_20px_80px_rgba(0,0,0,0.03)] border border-border p-10 md:p-20 relative overflow-hidden"
      >
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10" />

        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-14"
          >
            <Link to="/">
              <img src={sajaLogo} alt="SAJA" className="w-40 md:w-52 h-auto" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif italic text-text-dark mb-4">
              Se connecter
            </h1>
            <p className="text-text-medium text-xs md:text-sm uppercase tracking-[0.6em] font-medium opacity-50">
              Heureux de vous revoir
            </p>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Message de succès temporaire */}
          <AnimatePresence>
            {tempMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="text-primary text-[11px] bg-primary/5 p-5 border border-primary/10 text-center font-bold uppercase tracking-[0.3em]"
              >
                {tempMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-10">
            {/* Email */}
            <div className="group relative">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-text-medium mb-2 group-focus-within:text-primary transition-colors">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-0 bottom-3 text-text-light group-focus-within:text-primary transition-colors duration-300" size={20} strokeWidth={1.2} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="VOTRE@EMAIL.COM"
                  className={`w-full pl-9 pb-3 bg-transparent border-b text-lg tracking-wide placeholder:text-text-light/30 focus:outline-none transition-all duration-500 text-text-dark ${
                    errors.email || errors.password
                      ? "border-danger" 
                      : "border-border focus:border-primary"
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-danger text-[10px] mt-2 uppercase tracking-widest italic">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="group relative">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-text-medium group-focus-within:text-primary transition-colors">
                  Mot de passe
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-[10px] text-text-light hover:text-primary transition-colors uppercase tracking-[0.2em]"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-0 bottom-3 text-text-light group-focus-within:text-primary transition-colors duration-300" size={20} strokeWidth={1.2} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 pb-3 bg-transparent border-b text-lg tracking-wide placeholder:text-text-light/30 focus:outline-none transition-all duration-500 text-text-dark ${
                    errors.email || errors.password
                      ? "border-danger" 
                      : "border-border focus:border-primary"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-3 text-text-light hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-danger text-[10px] mt-2 uppercase tracking-widest italic">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Submit & Error */}
          <div className="pt-8 space-y-8">
            {errors.submit && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-danger text-[11px] uppercase tracking-widest bg-danger/5 p-5 text-center border border-danger/10 italic"
              >
                {errors.submit}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01, backgroundColor: "var(--primary-dark)" }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-primary text-white text-[13px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-xl transition-all duration-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} strokeWidth={1.5} />
                </>
              )}
            </motion.button>

            {/* Séparateur */}
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="mx-6 text-[10px] text-text-light uppercase tracking-[0.4em] font-bold opacity-40">ou</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Bouton Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-5 border border-border flex items-center justify-center gap-4 text-[11px] text-text-medium uppercase tracking-[0.3em] hover:bg-background transition-all duration-300 font-bold"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                className="w-5 h-5 grayscale opacity-50 group-hover:opacity-100 transition-opacity"
              />
              Continuer avec Google
            </button>

            {/* Footer Link */}
            <div className="text-center pt-4">
              <p className="text-[11px] text-text-light uppercase tracking-[0.3em]">
                Pas de compte ?{" "}
                <Link
                  to="/register"
                  className="text-primary font-bold border-b border-primary/30 hover:border-primary transition-all ml-2"
                >
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;