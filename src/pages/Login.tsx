import React, { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

const Login: React.FC = () => {
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  const handleSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
      } else {
        navigate("/home");
      }

      setLoading(false);
    },
    [email, password, signIn, navigate]
  );

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center"
      style={{ fontFamily: "'Product Sans', sans-serif" }}
    >
      {/* Background Orbs --cp */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Login Card --cp */}
      <div className="relative z-10 w-full max-w-md bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-100">
        
        {/* Header --cp */}
        <div className="flex flex-col items-center mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-1 tracking-tight">BrainDump</h1>
          <p className="text-xs text-gray-600">👋 Welcome back</p>
        </div>

        {/* Error Message --cp */}
        {error && (
          <div className="p-3 mb-4 rounded-xl flex items-center gap-2 text-xs font-medium bg-red-50 text-red-700 border border-red-200 shadow-lg">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSignIn}>
          {/* Email --cp */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-gray-700 text-xs font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
              required
            />
          </div>

          {/* Password --cp */}
          <div className="space-y-1 relative">
            <label htmlFor="password" className="block text-gray-700 text-xs font-medium">Password</label>
            <input
              id="password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-blue-600 hover:text-blue-700 transition-all duration-200"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Sign In Button --cp */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Google Sign In --cp */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272v95.3h147.3c-6.4 34.6-25.7 64-54.8 83.5v68h88.4c51.6-47.6 80.6-117.8 80.6-196.4z"/>
              <path fill="#34a853" d="M272 544.3c73.7 0 135.6-24.4 180.8-66.4l-88.4-68c-24.6 16.5-56.1 26.3-92.4 26.3-71 0-131.2-47.9-152.9-112.3H28.1v70.5C73.6 480.3 166.6 544.3 272 544.3z"/>
              <path fill="#fbbc04" d="M119.1 323.8c-10.3-30.6-10.3-63.5 0-94.1V159.2H28.1c-40.7 80-40.7 175.9 0 255.9l91-70.4z"/>
              <path fill="#ea4335" d="M272 107.7c39.9-.6 78.2 14 107.7 40.9l80.5-80.5C407.6 24.6 345.7 0 272 0 166.6 0 73.6 64 28.1 159.2l91 70.5C140.8 155.6 201 107.7 272 107.7z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="text-xs text-center pt-2">
            Don't have an account?{" "}
            <Link to="/signup" className="underline font-medium">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
