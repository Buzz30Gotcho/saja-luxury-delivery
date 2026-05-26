import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { authService } from "../services/authService";
import sajaLogo from "/saja.png";

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return Math.min(strength, 3);
  };

  const passwordStrengthText = () => {
    switch (passwordStrength()) {
      case 0:
      case 1: return 'Faible';
      case 2: return 'Moyen';
      case 3: return 'Fort';
      default: return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.password) {
      newErrors.password = "Mot de passe requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const result = await authService.signUp(
        formData.email,
        formData.password,
        {
          display_name: formData.displayName,
          role: 'customer'
        }
      );
      if (result.success) {
        navigate('/login', { state: { registrationSuccess: true } });
      } else {
        let errorMessage = result.error;
        if (result.error === "User already registered" || result.error?.includes("already registered")) {
          errorMessage = "Un compte existe déjà avec cet email.";
        }
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
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
              Créer un compte
            </h1>
            <p className="text-text-medium text-xs md:text-sm uppercase tracking-[0.6em] font-medium opacity-50">
              Bienvenue dans l'univers SAJA
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Nom d'affichage */}
            <div className="group relative col-span-1 md:col-span-2">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-text-medium mb-2 group-focus-within:text-primary transition-colors">
                Nom d'affichage
              </label>
              <div className="relative">
                <User className="absolute left-0 bottom-3 text-text-light group-focus-within:text-primary transition-colors duration-300" size={20} strokeWidth={1.2} />
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="VOTRE NOM"
                  className="w-full pl-9 pb-3 bg-transparent border-b border-border text-lg tracking-wide placeholder:text-text-light/30 focus:outline-none focus:border-primary transition-all duration-500 text-text-dark"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="group relative col-span-1 md:col-span-2">
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
                    errors.email ? "border-danger" : "border-border focus:border-primary"
                  }`}
                  required
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-danger text-[10px] mt-2 uppercase tracking-widest italic">{errors.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="group relative">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-text-medium mb-2 group-focus-within:text-primary transition-colors">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-0 bottom-3 text-text-light group-focus-within:text-primary transition-colors duration-300" size={20} strokeWidth={1.2} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 pb-3 bg-transparent border-b text-lg tracking-wide placeholder:text-text-light/30 focus:outline-none transition-all duration-500 text-text-dark ${
                    errors.password ? "border-danger" : "border-border focus:border-primary"
                  }`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-3 text-text-light hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              
              {formData.password && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className={`h-[1px] flex-1 transition-colors duration-700 ${
                        passwordStrength() >= s ? 'bg-primary' : 'bg-border'
                      }`}></div>
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-tighter opacity-40 font-bold">{passwordStrengthText()}</span>
                </div>
              )}
              {errors.password && (
                <p className="text-danger text-[10px] mt-2 uppercase tracking-widest italic">{errors.password}</p>
              )}
            </div>

            {/* Confirmation */}
            <div className="group relative">
              <label className="block text-[10px] uppercase tracking-[0.3em] text-text-medium mb-2 group-focus-within:text-primary transition-colors">
                Confirmation
              </label>
              <div className="relative">
                <Lock className="absolute left-0 bottom-3 text-text-light group-focus-within:text-primary transition-colors duration-300" size={20} strokeWidth={1.2} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 pb-3 bg-transparent border-b text-lg tracking-wide placeholder:text-text-light/30 focus:outline-none transition-all duration-500 text-text-dark ${
                    errors.confirmPassword ? "border-danger" : "border-border focus:border-primary"
                  }`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 bottom-3 text-text-light hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-danger text-[10px] mt-2 uppercase tracking-widest italic">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* RGPD & Newsletter */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <label className="flex items-center gap-4 cursor-pointer group">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="peer appearance-none w-5 h-5 border border-border rounded-none checked:bg-primary checked:border-primary transition-all cursor-pointer"
                required
              />
              <span className="text-[11px] text-text-medium uppercase tracking-widest group-hover:text-primary transition-colors leading-relaxed">
                J'accepte les <Link to="/terms" className="font-bold border-b border-text-medium/30 hover:border-primary transition-all">conditions d'utilisation</Link>
              </span>
            </label>
            
            <label className="flex items-center gap-4 cursor-pointer group">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="peer appearance-none w-5 h-5 border border-border rounded-none checked:bg-primary checked:border-primary transition-all cursor-pointer"
              />
              <span className="text-[11px] text-text-medium uppercase tracking-widest group-hover:text-primary transition-colors leading-relaxed">
                S'abonner à la newsletter exclusive
              </span>
            </label>
          </div>

          {/* Submit & Error */}
          <div className="pt-8 space-y-8">
            {errors.submit && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
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
                  Créer le compte
                  <ArrowRight size={18} strokeWidth={1.5} />
                </>
              )}
            </motion.button>

            {/* Footer Link */}
            <div className="text-center">
              <p className="text-[11px] text-text-light uppercase tracking-[0.3em]">
                Déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="text-primary font-bold border-b border-primary/30 hover:border-primary transition-all ml-2"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;