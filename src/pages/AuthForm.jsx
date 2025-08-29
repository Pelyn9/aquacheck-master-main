// src/pages/AuthForm.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient"; // ✅ Supabase client
import "../assets/login.css";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (forgotPassword && !email) {
      setError("❌ Please enter your email to reset password.");
      return;
    }

    try {
      if (forgotPassword) {
        // 🔹 Supabase password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: "http://localhost:5173/update-password", // ✅ must match your ChangePassword route
        });
        if (error) throw error;
        setSuccess("📧 Password reset link sent!");
        setEmail("");
        return;
      }

      if (isLogin) {
        // 🔹 Login with email + password
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setSuccess("✅ Login successful!");
      } else {
        // 🔹 Register new user
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setSuccess("✅ Account created! Please check your email to verify.");
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card" role="main" aria-label="Authentication form">
        <h1>AquaCheck</h1>
        <p className="subtitle">{isLogin ? "User Login" : "User Registration"}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="emailHelp"
            />
          </div>

          {!forgotPassword && (
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit">
            {forgotPassword
              ? "Send Reset Link"
              : isLogin
              ? "Login"
              : "Register"}
          </button>

          {error && (
            <p className="error-message" style={{ marginTop: "8px" }}>
              {error}
            </p>
          )}
          {success && (
            <p className="success" style={{ marginTop: "8px" }}>
              {success}
            </p>
          )}
        </form>

        <p>
          <span
            style={{ color: "#0077b6", cursor: "pointer" }}
            onClick={() => {
              setForgotPassword(!forgotPassword);
              setError("");
              setSuccess("");
            }}
            role="button"
          >
            {forgotPassword ? "Back to Login/Register" : "Forgot Password?"}
          </span>
        </p>

        {!forgotPassword && (
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span
              style={{ color: "#0077b6", cursor: "pointer" }}
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
              role="button"
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
