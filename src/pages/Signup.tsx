import React, { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Signup: React.FC = () => {
  const { signUp, signInWithGoogle } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!accepted) {
        toast({
          title: "Terms Required",
          description: "You must accept the Terms & Conditions.",
          variant: "destructive",
        });
        return;
      }

      if (password !== confirm) {
        toast({
          title: "Password mismatch",
          description: "Both passwords must match.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({
          title: "Sign-up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Check your email to verify your account.",
        });
      }

      setLoading(false);
    },
    [email, password, confirm, displayName, accepted, signUp]
  );

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-4"
      style={{ fontFamily: "'Product Sans', sans-serif" }}
    >
      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-md bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-1 tracking-tight">Create Account</h1>
          <p className="text-xs text-gray-600">Join BrainDump and start organizing your thoughts</p>
        </div>

        <form className="space-y-4" onSubmit={handleSignUp}>
          {/* Display Name */}
          <div className="space-y-1">
            <label className="block text-gray-700 text-xs font-medium">Display Name</label>
            <input
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-gray-700 text-xs font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300"
            />
          </div>

          {/* Password */}
		<div className="relative space-y-1">
		  <label className="block text-gray-700 text-xs font-medium">Password</label>
		  <input
			type={showPass ? "text" : "password"}
			placeholder="Create password"
			value={password}
			onChange={(e) => setPassword(e.target.value)}
			required
			className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 pr-10"
		  />
		  <button
			type="button"
			className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-all duration-200"
			onClick={() => setShowPass(!showPass)}
		  >
			{showPass ? <EyeOff size={16} /> : <Eye size={16} />}
		  </button>
		</div>

		{/* Confirm Password */}
		<div className="relative space-y-1">
		  <label className="block text-gray-700 text-xs font-medium">Confirm Password</label>
		  <input
			type={showConfirm ? "text" : "password"}
			placeholder="Repeat password"
			value={confirm}
			onChange={(e) => setConfirm(e.target.value)}
			required
			className="w-full px-3 py-2 text-sm rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300 pr-10"
		  />
		  <button
			type="button"
			className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-all duration-200"
			onClick={() => setShowConfirm(!showConfirm)}
		  >
			{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
		  </button>
		</div>

          {/* Terms */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <p className="text-xs">
              I agree to the{" "}
              <span className="underline cursor-pointer" onClick={() => setShowTerms(true)}>
                Terms & Conditions
              </span>.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            {loading ? "Creating..." : <><UserPlus size={16} /> Create Account</>}
          </button>

          {/* Google Sign Up */}
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
            Sign up with Google
          </button>

          {/* Footer */}
          <p className="text-xs text-center pt-2">
            Already have an account?{" "}
            <Link to="/login" className="underline font-medium">Login</Link>
          </p>
        </form>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
            <p className="text-sm mb-4">Your terms & conditions go here...</p>
            <button
              onClick={() => setShowTerms(false)}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
