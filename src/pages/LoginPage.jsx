import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import useWindowWidth from "../hooks/useWindowWidth";
import { resendVerification } from '../api/auth'


const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 480;

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false)
const [resending, setResending] = useState(false)
const [resent, setResent] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setUnverified(false)
  setLoading(true)

  try {
    const res = await loginUser(formData)
    login(res.data.user, res.data.token)
    if (res.data.user.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
  } catch (err) {
    if (err.response?.data?.unverified) {
      setUnverified(true)
      setError(err.response.data.message)
    } else {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    }
  } finally {
    setLoading(false)
  }
}

const handleResend = async () => {
  setResending(true)
  try {
    await resendVerification({ email: formData.email })
    setResent(true)
  } catch (err) {
    // resend always responds generically, so this rarely fires
  } finally {
    setResending(false)
  }
}

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `
    linear-gradient(rgba(13, 27, 42, 0.72), rgba(13, 27, 42, 0.85)),
    url('https://res.cloudinary.com/dvydugv8v/image/upload/v1776794653/DLFS%20Unilag/20250915_150147_1_jumkxf.jpg')
  `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          ...styles.card,
          padding: isMobile ? "1.75rem 1.25rem" : "2.5rem",
          margin: isMobile ? "1rem" : "0",
        }}
      >
        <h2 style={styles.title}>Login</h2>
        {/* <p style={styles.subtitle}>
          UNILAG Digital Lost & Found: Reconnecting You with Your Belongings. In
          Deed and In Truth.
        </p> */}

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="matricno@live.unilag.edu.ng"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>

            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Link
              to="/forgot-password"
              style={{
                fontSize: "0.82rem",
                color: "#0A7E8C",
                textDecoration: "none",
              }}
            >
              Forgot password?
            </Link>
          </div>
          <button
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4f8",
    padding: "1rem",
    textAlign: "left",
  },
  card: {
    backgroundColor: "#ffff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#000",
    margin: "0 0 0.85rem",
  },
  subtitle: {
    color: "#0000",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  field: { marginBottom: "1.2rem" },
  label: {
    display: "block",
    marginBottom: "0.4rem",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "8px",
    backgroundColor: "#ffff",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    color: "#0D1B2A",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    backgroundColor: "#00786F",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.9rem",
    color: "#64748b",
  },
  link: {
    color: "#0A7E8C",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default LoginPage;
