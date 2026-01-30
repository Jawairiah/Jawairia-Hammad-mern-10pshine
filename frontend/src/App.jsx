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
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
  };

  return (
    <div className={`flex gap-3 p-4 border rounded-lg ${styles[type]}`}>
      {icons[type]}
      <div>{children}</div>
    </div>
  );
};

const Input = ({ icon: Icon, error, ...props }) => (
  <div className="space-y-1">
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        {...props}
        className={`w-full ${
          Icon ? "pl-10" : "pl-4"
        } pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      />
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const Button = ({ children, loading, onClick, variant = "primary" }) => {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full ${styles[variant]} disabled:bg-gray-400 py-3 rounded-lg flex justify-center gap-2 items-center`}
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
    <AuthLayout title="Create Account">
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <Input 
        icon={User} 
        placeholder="Username" 
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })} 
      />
      <Input 
        icon={Mail} 
        placeholder="Email" 
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="Password" 
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} 
      />
      <Button loading={loading} onClick={handleSubmit}>Sign Up</Button>
      <ToggleText onToggle={onToggle} text="Already have an account?" action="Log in" />
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
    <AuthLayout title="Welcome Back">
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <Input 
        icon={Mail} 
        placeholder="Email" 
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="Password" 
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} 
      />
      <button
        onClick={onForgotPassword}
        className="text-sm text-blue-600 hover:text-blue-700 text-right w-full"
      >
        Forgot password?
      </button>
      <Button loading={loading} onClick={handleSubmit}>Log In</Button>
      <ToggleText onToggle={onToggle} text="Don't have an account?" action="Sign up" />
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
    <AuthLayout title="Forgot Password">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
      >
        <ArrowLeft size={16} />
        Back to login
      </button>
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <p className="text-sm text-gray-600 mb-4">
        Enter your email address and we'll send you an OTP to reset your password.
      </p>
      <Input 
        icon={Mail} 
        placeholder="Email" 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} 
      />
      <Button loading={loading} onClick={handleSubmit}>Send OTP</Button>
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
    <AuthLayout title="Reset Password">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
      >
        <ArrowLeft size={16} />
        Back
      </button>
      {message && <Alert type={message.type}>{message.text}</Alert>}
      <p className="text-sm text-gray-600 mb-4">
        Enter the OTP sent to <strong>{email}</strong>
      </p>
      <Input 
        icon={Key} 
        placeholder="Enter 6-digit OTP" 
        maxLength={6}
        value={form.otp}
        onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="New Password" 
        value={form.newPassword}
        onChange={(e) => setForm({ ...form, newPassword: e.target.value })} 
      />
      <Input 
        icon={Lock} 
        type="password" 
        placeholder="Confirm New Password" 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="max-w-6xl mx-auto p-6 flex justify-between items-center bg-white shadow rounded-lg mt-6">
        <div className="flex items-center gap-3">
          <StickyNote className="text-blue-600" />
          <div>
            <h1 className="font-bold">Notes App</h1>
            <p className="text-sm">Welcome, {user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowProfile(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-blue-700 transition"
          >
            <UserCircle size={20} /> Profile
          </button>
          <button 
            onClick={onLogout} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-red-700 transition"
          >
            <LogOut size={16} /> Logout
          </button>
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
const AuthLayout = ({ title, children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-4">
      <h2 className="text-2xl font-bold text-center">{title}</h2>
      {children}
    </div>
  </div>
);

const ToggleText = ({ text, action, onToggle }) => (
  <p className="text-center text-sm">
    {text}{" "}
    <button onClick={onToggle} className="text-blue-600 font-medium hover:underline">
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
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