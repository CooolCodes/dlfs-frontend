import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import useWindowWidth from "../hooks/useWindowWidth";

const ForgotPasswordPage = () => {
  const width = useWindowWidth();
  const isMobile = width < 480;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.card,
          padding: isMobile ? "1.75rem 1.25rem" : "2.5rem",
        }}
      >
        {submitted ? (
          // Success state
          <div style={{ textAlign: "center" }}>
            <div style={styles.successIcon}>📧</div>
            <h2 style={styles.title}>Check your email</h2>
            <p style={styles.subtitle}>
              If that email address is registered with DLFS, you will receive a
              password reset link within a few minutes.
            </p>
            <p style={styles.hint}>
              Check your spam folder if you don't see it.
            </p>
            <Link to="/login" style={styles.backLink}>
              ← Back to sign in
            </Link>
          </div>
        ) : (
          // Form state
          <>
            <h2 style={styles.title}>Forgot your password?</h2>
            <p style={styles.subtitle}>
              Enter your UNILAG email address and we will send you a link to
              reset your password.
            </p>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Email address</label>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="matricno@live.unilag.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                }}
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p style={styles.footer}>
              Remembered it?{" "}
              <Link to="/login" style={styles.link}>
                Sign in
              </Link>
            </p>
          </>
        )}
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
    backgroundColor: "#f8fafc",
    padding: "1rem",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
  },
  successIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: "0 0 0.5rem",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    marginBottom: "1.5rem",
  },
  hint: {
    color: "#94a3b8",
    fontSize: "0.82rem",
    marginBottom: "1.5rem",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  field: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    marginBottom: "0.4rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    color: "#0D1B2A",
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
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
  backLink: {
    color: "#0A7E8C",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "0.9rem",
    display: "inline-block",
    marginTop: "0.5rem",
  },
};

export default ForgotPasswordPage;
