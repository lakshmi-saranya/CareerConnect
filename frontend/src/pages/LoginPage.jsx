import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Already logged in → go to dashboard
  useEffect(() => {
    if (user) navigate("/");
  }, [user]);

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:8000/auth/google", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();

      login({
        user_id:      data.user_id,
        email:        data.email,
        name:         data.name,
        picture:      data.picture,
        access_token: data.access_token,
      });

      navigate("/");
    } catch (err) {
      alert("Login failed. Make sure the backend is running.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #01428d, #4a90e2)",
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "48px 40px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        textAlign: "center",
        width: "360px",
      }}>
        {/* Logo / Brand */}
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontSize: "2.5rem" }}>💼</span>
        </div>
        <h1 style={{ color: "#01428d", marginBottom: "4px", fontSize: "1.6rem" }}>
          CareerConnect
        </h1>
        <p style={{ color: "#777", marginBottom: "32px", fontSize: "0.95rem" }}>
          Match your resume to the perfect job
        </p>

        <p style={{ color: "#444", marginBottom: "20px", fontWeight: 500 }}>
          Sign in to continue
        </p>

        {/* Google Sign In Button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => alert("Google login failed.")}
            useOneTap
            shape="rectangular"
            size="large"
            text="signin_with"
            theme="outline"
          />
        </div>

        <p style={{ color: "#aaa", marginTop: "24px", fontSize: "0.8rem" }}>
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
