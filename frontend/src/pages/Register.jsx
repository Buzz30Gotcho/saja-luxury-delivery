import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import dripSwiftLogo from "/dripswift.png";


const Register = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Calcul de la force du mot de passe
  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return 0;
    
    let strength = 0;
    
    // Longueur
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Complexité
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    return Math.min(strength, 3);
  };

  const passwordStrengthText = () => {
    switch (passwordStrength()) {
      case 0:
      case 1:
        return 'Faible - Utilisez plus de caractères';
      case 2:
        return 'Moyen - Ajoutez des caractères spéciaux';
      case 3:
        return 'Fort - Bon mot de passe !';
      default:
        return '';
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
    
    // Validation RGPD - OBLIGATOIRE
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter les conditions d'utilisation et la politique de confidentialité (RGPD obligatoire)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  
  // ✅ CORRECT - loading est géré dans le composant
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
      // ✅ Redirection immédiate vers login
      navigate('/login', { 
        state: { 
          registrationSuccess: true 
        } 
      });
    } else {
      setErrors({ submit: result.error?.message || "Erreur lors de l'inscription" });
    }
  } catch (error) {
    setErrors({ submit: error.message });
  } finally {
    // ✅ CORRECT - loading est géré dans le composant
    setLoading(false);
  }
};


  const handleGoogleRegister = async () => {
    // Vérification RGPD avant Google OAuth
    if (!formData.acceptTerms) {
      setErrors({ 
        acceptTerms: "Vous devez accepter les conditions avant de vous inscrire avec Google" 
      });
      return;
    }

    setGoogleLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        setErrors({ submit: error.message });
      }
    } catch (error) {
      setErrors({ submit: "Erreur lors de l'inscription avec Google" });
    } finally {
      setGoogleLoading(false);
    }
  };

  // ... (le reste du JSX reste inchangé)
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md md:max-w-2xl lg:max-w-3xl bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-10 md:p-16 relative overflow-hidden border border-border"
      >
        {/* Subtle Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="mb-10 flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="relative mb-4"
            >
              <img
                src={dripSwiftLogo}
                alt="Dripswift"
                className="w-64 h-auto transition-all duration-500"
              />
            </motion.div>

            <p className="text-text-medium text-xl md:text-2xl uppercase tracking-[0.4em] font-bold text-center">
              Créer votre compte d'élite
            </p>
          </div>        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-7 relative z-10">
          {/* Nom d'affichage */}
          <div className="space-y-2">
            <label className="block text-xl uppercase tracking-widest text-text-medium font-semibold">
              Nom d'affichage <span className="text-text-light lowercase font-normal italic">(optionnel)</span>
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Votre nom"
              className="w-full py-3 bg-transparent border-b border-border text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none focus:border-black transition-all duration-300"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xl uppercase tracking-widest text-text-medium font-semibold">
              Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-black transition-colors" size={24} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                className={`w-full pl-11 py-3 bg-transparent border-b text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.email 
                    ? "border-danger" 
                    : "border-border focus:border-black"
                }`}
                required
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-danger text-lg mt-1 italic">{errors.email}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <label className="block text-xl uppercase tracking-widest text-text-medium font-semibold">
              Mot de passe
            </label>
            <div className="relative group">
              <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-black transition-colors" size={24} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-11 py-3 bg-transparent border-b text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.password 
                    ? "border-danger" 
                    : "border-border focus:border-black"
                }`}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-text-light hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            
            {/* Password Strength - Minimalist */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-[2px] flex-1 transition-colors duration-500 ${
                      passwordStrength() >= s ? 'bg-black' : 'bg-border'
                    }`}></div>
                  ))}
                </div>
                <p className="text-sm uppercase tracking-wider text-text-light">
                  {passwordStrengthText()}
                </p>
              </div>
            )}
            
            {errors.password && (
              <p className="text-danger text-lg mt-1 italic">{errors.password}</p>
            )}
          </div>

          {/* Confirmation */}
          <div className="space-y-2">
            <label className="block text-xl uppercase tracking-widest text-text-medium font-semibold">
              Confirmer
            </label>
            <div className="relative group">
              <Lock className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-light group-focus-within:text-black transition-colors" size={24} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-11 py-3 bg-transparent border-b text-2xl text-text-dark placeholder:text-text-light/50 focus:outline-none transition-all duration-300 ${
                  errors.confirmPassword 
                    ? "border-danger" 
                    : "border-border focus:border-black"
                }`}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-text-light hover:text-black transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-danger text-lg mt-1 italic">{errors.confirmPassword}</p>
            )}
          </div>

          {/* RGPD & Newsletter - Refined */}
          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 border-border rounded-none focus:ring-0 checked:bg-black text-black"
                required
              />
              <span className="text-sm text-text-medium uppercase tracking-wider leading-relaxed group-hover:text-text-dark transition-colors">
                J'accepte les <Link to="/terms" className="underline font-bold">conditions</Link> et la <Link to="/privacy" className="underline font-bold">politique de confidentialité</Link>.
              </span>
            </label>
            
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="mt-1 w-4 h-4 border-border rounded-none focus:ring-0 checked:bg-black text-black"
              />
              <span className="text-sm text-text-medium uppercase tracking-wider leading-relaxed group-hover:text-text-dark transition-colors">
                S'abonner à la newsletter exclusive.
              </span>
            </label>
            
            {errors.acceptTerms && (
              <p className="text-danger text-lg italic">{errors.acceptTerms}</p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4">
            {errors.submit && (
              <div className="mb-4 text-danger text-base bg-danger/5 p-3 rounded-sm border border-danger/10 text-center italic">
                {errors.submit}
              </div>
            )}

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-lg font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-black-dark transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                "Créer mon compte"
              )}
            </motion.button>
          </div>

          {/* Separator */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-4 text-sm text-text-light uppercase tracking-widest">ou</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading}
            className="w-full py-3 border border-border rounded-sm flex items-center justify-center gap-3 text-sm text-text-medium uppercase tracking-widest hover:bg-muted transition-all duration-300 disabled:opacity-50"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              className="w-5 h-5 grayscale opacity-70"
            />
            Google
          </button>

          {/* Footer Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-text-light uppercase tracking-widest">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                className="text-black font-bold hover:text-black-dark transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;;