import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";

const DEFAULT_EMAIL = "admin@gmail.com";
const DEFAULT_PASSWORD = "admin123";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // simulate API
    setTimeout(() => {
      if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
        sessionStorage.setItem("loginTime", Date.now());
        navigate("/admin/dashboard");
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FaLock className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-500">
            Login with your admin credentials
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-2 text-sm text-center">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder="admin@gmail.com"
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                placeholder="admin123"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold
              bg-gradient-to-r from-indigo-500 to-purple-600
              hover:opacity-90 transition-all
              active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Login
              </>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-6 text-xs text-center text-gray-400">
          © {new Date().getFullYear()} Admin Panel
        </p>
      </div>
    </div>
  );
};

export default Login;
