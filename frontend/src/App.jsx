import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Lock,
  Mail,
  User,
  LogOut,
  StickyNote,
  ArrowLeft,
  Key,
  Leaf,
  Mountain,
  Trees,
  Sprout,
  UserCircle,
} from "lucide-react";

import NotesContainer from "./components/NotesContainer";
import ProfileModal from "./components/ProfileModal";

const API_URL = "http://localhost:5000/api/auth";

/* =========================
   AUTH UTILITIES
========================= */
const setAuthToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

const getAuthToken = () => localStorage.getItem("token");

const api = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

/* =========================
   REUSABLE COMPONENTS
========================= */
const Alert = ({ type, children }) => {
  const styles = {
    success: "bg-sage-50 border-sage-300 text-sage-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className={`flex gap-3 p-4 border-2 rounded-2xl ${styles[type]} fade-in`}>
      {icons[type]}
      <div className="text-sm">{children}</div>
    </div>
  );
};

const Input = ({ icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
      )}
      <input
        {...props}
        className={`w-full ${
          Icon ? "pl-12" : "pl-4"
        } pr-4 py-3.5 bg-warm-white border-2 rounded-2xl focus:ring-2 focus:ring-sage-300 focus:border-sage-500 outline-none text-base ${
          error ? "border-red-300" : "border-sage-200"
        } placeholder:text-sage-300`}
        style={{
          fontFamily: 'Inter, sans-serif',
        }}
      />
    </div>
    {error && <p className="text-sm text-red-600 px-2">{error}</p>}
  </div>
);

const Button = ({ children, loading, onClick, variant = "primary" }) => {
  const styles = {
    primary: "bg-sage-600 hover:bg-sage-700 text-white shadow-md hover:shadow-lg",
    secondary: "bg-sage-100 hover:bg-sage-200 text-sage-800",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full ${styles[variant]} disabled:bg-sage-300 disabled:cursor-not-allowed py-3.5 rounded-2xl flex justify-center gap-2 items-center font-medium text-base transition-all duration-200`}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

/* =========================
   SIGNUP
========================= */
const SignUp = ({ onSuccess, onToggle }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await api("/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setAuthToken(data.token);
      onSuccess(data.user);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Begin Your Journey" icon={<Sprout className="w-8 h-8 text-sage-600" />}>
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <Input 
        icon={User} 
        placeholder="Choose a username" 
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })} 
      />
      <Input 
        icon={Mail} 
        placeholder="Your email" 
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="Create a password" 
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} 
      />
      <Button loading={loading} onClick={handleSubmit}>Create Account</Button>
      <ToggleText onToggle={onToggle} text="Already have an account?" action="Sign in" />
    </AuthLayout>
  );
};

/* =========================
   LOGIN
========================= */
const Login = ({ onSuccess, onToggle, onForgotPassword }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await api("/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setAuthToken(data.token);
      onSuccess(data.user);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" icon={<Leaf className="w-8 h-8 text-sage-600" />}>
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <Input 
        icon={Mail} 
        placeholder="Your email" 
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="Your password" 
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} 
      />
      <button
        onClick={onForgotPassword}
        className="text-sm text-sage-600 hover:text-sage-800 text-right w-full font-medium"
      >
        Forgot password?
      </button>
      <Button loading={loading} onClick={handleSubmit}>Sign In</Button>
      <ToggleText onToggle={onToggle} text="New to the forest?" action="Create account" />
    </AuthLayout>
  );
};

/* =========================
   FORGOT PASSWORD
========================= */
const ForgotPassword = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await api("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage({ type: "success", text: data.message });
      setTimeout(() => onSuccess(email), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" icon={<Key className="w-7 h-7 text-sage-600" />}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-2 font-medium"
      >
        <ArrowLeft size={18} />
        Back to sign in
      </button>
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <p className="text-sm text-sage-600 mb-4 px-1">
        Enter your email address and we'll send you a code to reset your password.
      </p>
      <Input 
        icon={Mail} 
        placeholder="Your email" 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} 
      />
      <Button loading={loading} onClick={handleSubmit}>Send Reset Code</Button>
    </AuthLayout>
  );
};

/* =========================
   RESET PASSWORD
========================= */
const ResetPassword = ({ email, onBack, onSuccess }) => {
  const [form, setForm] = useState({ otp: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const data = await api("/reset-password", {
        method: "POST",
        body: JSON.stringify({ 
          email, 
          otp: form.otp, 
          newPassword: form.newPassword 
        }),
      });
      setMessage({ type: "success", text: data.message });
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create New Password" icon={<Lock className="w-7 h-7 text-sage-600" />}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sage-600 hover:text-sage-800 mb-2 font-medium"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <p className="text-sm text-sage-600 mb-4 px-1">
        Enter the code sent to <strong className="text-sage-800">{email}</strong>
      </p>
      <Input 
        icon={Key} 
        placeholder="Enter 6-digit code" 
        maxLength={6}
        value={form.otp}
        onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="New password" 
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="Confirm new password" 
        value={form.confirmPassword}
        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
      />
      <Button loading={loading} onClick={handleSubmit}>Reset Password</Button>
    </AuthLayout>
  );
};

/* =========================
   DASHBOARD
========================= */
const Dashboard = ({ user, onLogout, onUpdateUser }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f7f9f7 0%, #eef2ee 50%, #e8ede3 100%)' }}>
      {/* Soft Nature Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right mountain silhouette */}
        <div className="absolute -top-20 -right-20 opacity-[0.04]">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
            <path d="M0 300 L100 200 L150 250 L200 150 L300 250 L400 200 L400 400 L0 400 Z" fill="#527a59"/>
          </svg>
        </div>
        
        {/* Bottom left trees */}
        <div className="absolute -bottom-10 -left-10 opacity-[0.03]">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <path d="M50 250 L70 200 L90 250 Z" fill="#5a7a51"/>
            <rect x="65" y="250" width="10" height="40" fill="#3f5e45"/>
            <path d="M120 230 L145 170 L170 230 Z" fill="#5a7a51"/>
            <rect x="140" y="230" width="10" height="50" fill="#3f5e45"/>
            <path d="M200 240 L220 200 L240 240 Z" fill="#6b9370"/>
            <rect x="215" y="240" width="10" height="40" fill="#3f5e45"/>
          </svg>
        </div>
        
        {/* Floating leaves */}
        <div className="absolute top-1/4 right-1/4 opacity-[0.05]">
          <Leaf className="w-24 h-24 text-sage-600 transform rotate-12 float-animation" style={{ animationDelay: '0s' }} />
        </div>
        <div className="absolute top-1/2 left-1/3 opacity-[0.04]">
          <Leaf className="w-16 h-16 text-moss-600 transform -rotate-45 float-animation" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute bottom-1/3 right-1/3 opacity-[0.05]">
          <Leaf className="w-20 h-20 text-sage-500 transform rotate-90 float-animation" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Subtle grass at bottom */}
        <div className="absolute bottom-0 left-0 right-0 opacity-[0.03]">
          <svg width="100%" height="100" viewBox="0 0 1200 100" preserveAspectRatio="none" fill="none">
            <path d="M0 50 Q150 30 300 50 T600 50 T900 50 T1200 50 L1200 100 L0 100 Z" fill="#6b9370"/>
          </svg>
        </div>
      </div>

      <header className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="bg-warm-white/80 backdrop-blur-sm shadow-lg rounded-3xl p-6 border-2 border-sage-100 fade-in">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-sage-100 p-3 rounded-2xl">
                <Trees className="text-sage-700 w-7 h-7" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-sage-800" style={{ fontFamily: 'Crimson Pro, serif' }}>
                  Forest Notes
                </h1>
                <p className="text-sm text-sage-600">Welcome back, {user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowProfile(true)} 
                className="bg-sage-600 hover:bg-sage-700 text-white px-5 py-2.5 rounded-2xl flex gap-2 items-center font-medium transition-all shadow-md border-2 border-sage-100"
              >
                <UserCircle size={20} /> Profile
              </button>
              <button 
                onClick={onLogout} 
                className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-2xl flex gap-2 items-center font-medium transition-all border-2 border-red-100"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <NotesContainer />

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={onUpdateUser}
        />
      )}
    </div>
  );
};

/* =========================
   SHARED AUTH LAYOUT
========================= */
const AuthLayout = ({ title, icon, children }) => (
  <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" 
       style={{ background: 'linear-gradient(135deg, #f7f9f7 0%, #eef2ee 50%, #e8ede3 100%)' }}>
    {/* Soft Nature Background Decorations */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large mountain silhouette - top right */}
      <div className="absolute -top-32 -right-32 opacity-[0.05]">
        <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
          <path d="M0 350 L120 200 L180 270 L250 150 L350 280 L450 200 L500 250 L500 500 L0 500 Z" fill="#527a59"/>
        </svg>
      </div>
      
      {/* Forest silhouette - bottom left */}
      <div className="absolute -bottom-20 -left-20 opacity-[0.04]">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
          {/* Trees */}
          <path d="M50 320 L80 250 L110 320 Z" fill="#5a7a51"/>
          <rect x="72" y="320" width="16" height="60" fill="#3f5e45"/>
          
          <path d="M140 300 L175 220 L210 300 Z" fill="#6b9370"/>
          <rect x="167" y="300" width="16" height="70" fill="#3f5e45"/>
          
          <path d="M230 310 L260 250 L290 310 Z" fill="#5a7a51"/>
          <rect x="252" y="310" width="16" height="60" fill="#3f5e45"/>
          
          <path d="M310 290 L345 210 L380 290 Z" fill="#6b9370"/>
          <rect x="337" y="290" width="16" height="80" fill="#3f5e45"/>
          
          {/* Grass/bushes */}
          <ellipse cx="100" cy="350" rx="60" ry="20" fill="#6b9370" opacity="0.6"/>
          <ellipse cx="200" cy="360" rx="70" ry="25" fill="#5a7a51" opacity="0.6"/>
          <ellipse cx="320" cy="355" rx="65" ry="22" fill="#6b9370" opacity="0.6"/>
        </svg>
      </div>
      
      {/* Gentle hills - bottom */}
      <div className="absolute bottom-0 left-0 right-0 opacity-[0.04]">
        <svg width="100%" height="200" viewBox="0 0 1200 200" preserveAspectRatio="none" fill="none">
          <path d="M0 100 Q200 50 400 100 T800 100 T1200 100 L1200 200 L0 200 Z" fill="#6b9370"/>
          <path d="M0 130 Q300 90 600 130 T1200 130 L1200 200 L0 200 Z" fill="#5a7a51" opacity="0.5"/>
        </svg>
      </div>
      
      {/* Floating leaves */}
      <div className="absolute top-1/4 right-1/4 opacity-[0.06]">
        <Leaf className="w-20 h-20 text-sage-500 transform rotate-12 float-animation" style={{ animationDelay: '0s' }} />
      </div>
      <div className="absolute top-1/2 left-1/4 opacity-[0.05]">
        <Leaf className="w-16 h-16 text-moss-500 transform -rotate-30 float-animation" style={{ animationDelay: '2s' }} />
      </div>
      <div className="absolute bottom-1/3 right-1/3 opacity-[0.06]">
        <Leaf className="w-24 h-24 text-sage-400 transform rotate-45 float-animation" style={{ animationDelay: '4s' }} />
      </div>
      <div className="absolute top-2/3 left-1/2 opacity-[0.04]">
        <Leaf className="w-14 h-14 text-moss-600 transform -rotate-60 float-animation" style={{ animationDelay: '3s' }} />
      </div>
      
      {/* Small decorative clouds/mist */}
      <div className="absolute top-20 left-20 opacity-[0.03]">
        <div className="w-32 h-16 bg-sage-300 rounded-full blur-2xl"></div>
      </div>
      <div className="absolute top-40 right-32 opacity-[0.03]">
        <div className="w-40 h-20 bg-sky-300 rounded-full blur-2xl"></div>
      </div>
      <div className="absolute bottom-32 left-1/3 opacity-[0.02]">
        <div className="w-36 h-18 bg-sage-200 rounded-full blur-2xl"></div>
      </div>
    </div>
    
    <div className="bg-warm-white/95 backdrop-blur-sm p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 relative z-10 border-2 border-sage-100 fade-in">
      <div className="text-center space-y-3">
        <div className="inline-block p-3 bg-sage-50 rounded-2xl">
          {icon}
        </div>
        <h2 className="text-3xl font-bold text-sage-800" style={{ fontFamily: 'Crimson Pro, serif' }}>{title}</h2>
      </div>
      {children}
    </div>
  </div>
);

const ToggleText = ({ text, action, onToggle }) => (
  <p className="text-center text-sm text-sage-600">
    {text}{" "}
    <button onClick={onToggle} className="text-sage-700 font-semibold hover:text-sage-900 hover:underline">
      {action}
    </button>
  </p>
);

/* =========================
   MAIN APP
========================= */
export default function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api("/me");
        setUser(data.user);
        setView("dashboard");
      } catch {
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f7f9f7 0%, #eef2ee 50%, #e8ede3 100%)' }}>
        {/* Soft background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 opacity-[0.05]">
            <Leaf className="w-32 h-32 text-sage-400 transform rotate-12 float-animation" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 opacity-[0.04]">
            <Mountain className="w-40 h-40 text-sage-500" />
          </div>
        </div>
        <div className="relative z-10">
          <Leaf className="w-16 h-16 text-sage-400 gentle-pulse" />
        </div>
        <p className="text-sage-600 mt-4 font-medium relative z-10">Loading your space...</p>
      </div>
    );

  if (view === "login")
    return (
      <Login 
        onSuccess={(u) => { setUser(u); setView("dashboard"); }} 
        onToggle={() => setView("signup")} 
        onForgotPassword={() => setView("forgot-password")}
      />
    );

  if (view === "signup")
    return (
      <SignUp 
        onSuccess={(u) => { setUser(u); setView("dashboard"); }} 
        onToggle={() => setView("login")} 
      />
    );

  if (view === "forgot-password")
    return (
      <ForgotPassword
        onBack={() => setView("login")}
        onSuccess={(email) => { setResetEmail(email); setView("reset-password"); }}
      />
    );

  if (view === "reset-password")
    return (
      <ResetPassword
        email={resetEmail}
        onBack={() => setView("forgot-password")}
        onSuccess={() => setView("login")}
      />
    );

  return (
    <Dashboard 
      user={user} 
      onLogout={() => { setAuthToken(null); setUser(null); setView("login"); }}
      onUpdateUser={(updatedUser) => setUser(updatedUser)}
    />
  );
}