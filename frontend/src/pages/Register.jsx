import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { authService } from "../services/authService";
import sajaLogo from "/saja.png";
import heroLuxury from "/hero-luxury.jpg";

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
      newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation";
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
    <div className="min-h-screen flex bg-[#F9F9F9]">
      {/* Side Image - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroLuxury}
          alt="Luxury Experience"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-20 text-white w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-5xl font-light tracking-tighter mb-4 italic">L'excellence au quotidien.</h2>
            <p className="text-white/60 text-lg uppercase tracking-[0.3em] font-light">Rejoignez l'univers SAJA</p>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 relative">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex flex-col items-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Link to="/">
                <img
                  src={sajaLogo}
                  alt="SAJA"
                  className="w-32 md:w-40 h-auto"
                />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-3 italic">
                Bienvenue
              </h1>
              <p className="text-text-medium text-xs md:text-sm uppercase tracking-[0.5em] font-medium opacity-60">
                Créez votre accès personnel
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Nom d'affichage */}
              <div className="group relative">
                <div className="absolute left-0 bottom-3 text-text-light group-focus-within:text-black transition-colors duration-300">
                  <User size={20} strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="NOM D'AFFICHAGE"
                  className="w-full pl-8 pb-3 bg-transparent border-b border-black/10 text-sm uppercase tracking-widest placeholder:text-text-light/40 focus:outline-none focus:border-black transition-all duration-500"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="group relative">
                <div className="absolute left-0 bottom-3 text-text-light group-focus-within:text-black transition-colors duration-300">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ADRESSE EMAIL"
                  className={`w-full pl-8 pb-3 bg-transparent border-b text-sm uppercase tracking-widest placeholder:text-text-light/40 focus:outline-none transition-all duration-500 ${
                    errors.email ? "border-danger" : "border-black/10 focus:border-black"
                  }`}
                  required
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-danger text-[10px] mt-1 uppercase tracking-widest italic">{errors.email}</p>
                )}
              </div>

              {/* Mot de passe */}
              <div className="group relative">
                <div className="absolute left-0 bottom-3 text-text-light group-focus-within:text-black transition-colors duration-300">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="MOT DE PASSE"
                  className={`w-full pl-8 pr-10 pb-3 bg-transparent border-b text-sm uppercase tracking-widest placeholder:text-text-light/40 focus:outline-none transition-all duration-500 ${
                    errors.password ? "border-danger" : "border-black/10 focus:border-black"
                  }`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-3 text-text-light hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                
                {formData.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-[1px] flex-1 transition-colors duration-700 ${
                          passwordStrength() >= s ? 'bg-black' : 'bg-black/5'
                        }`}></div>
                      ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-tighter opacity-40">{passwordStrengthText()}</span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-danger text-[10px] mt-1 uppercase tracking-widest italic">{errors.password}</p>
                )}
              </div>

              {/* Confirmation */}
              <div className="group relative">
                <div className="absolute left-0 bottom-3 text-text-light group-focus-within:text-black transition-colors duration-300">
                  <Lock size={20} strokeWidth={1.5} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="CONFIRMER LE MOT DE PASSE"
                  className={`w-full pl-8 pr-10 pb-3 bg-transparent border-b text-sm uppercase tracking-widest placeholder:text-text-light/40 focus:outline-none transition-all duration-500 ${
                    errors.confirmPassword ? "border-danger" : "border-black/10 focus:border-black"
                  }`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 bottom-3 text-text-light hover:text-black transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-danger text-[10px] mt-1 uppercase tracking-widest italic">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms & Newsletter */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="peer appearance-none w-4 h-4 border border-black/20 rounded-none checked:bg-black transition-all"
                    required
                  />
                </div>
                <span className="text-[10px] text-text-medium uppercase tracking-widest group-hover:text-black transition-colors">
                  J'accepte les <Link to="/terms" className="font-bold border-b border-black/20">conditions</Link>
                </span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={handleChange}
                  className="peer appearance-none w-4 h-4 border border-black/20 rounded-none checked:bg-black transition-all"
                />
                <span className="text-[10px] text-text-medium uppercase tracking-widest group-hover:text-black transition-colors">
                  S'abonner à la newsletter exclusive
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-6">
              {errors.submit && (
                <div className="mb-6 text-danger text-[10px] uppercase tracking-widest bg-danger/5 p-4 text-center border border-danger/10 italic">
                  {errors.submit}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-black text-white text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-neutral-900 transition-all duration-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <>
                    CRÉER LE COMPTE
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </>
                )}
              </motion.button>
            </div>

            {/* Footer */}
            <div className="text-center pt-8">
              <p className="text-[10px] text-text-light uppercase tracking-widest">
                DÉJÀ MEMBRE ?{" "}
                <Link
                  to="/login"
                  className="text-black font-bold border-b border-black/40 hover:border-black transition-all ml-1"
                >
                  SE CONNECTER
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;