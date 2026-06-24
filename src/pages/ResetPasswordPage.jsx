import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";
import useWindowWidth from "../hooks/useWindowWidth";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 480;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await resetPassword(token, { password });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Reset link is invalid or has expired. Please request a new one.",
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
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.title}>Password reset</h2>
            <p style={styles.subtitle}>
              Your password has been updated successfully. Redirecting you to
              sign in...
            </p>
            <Link to="/login" style={styles.link}>
              Go to sign in →
            </Link>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Set a new password</h2>
            <p style={styles.subtitle}>
              Choose a strong password for your DLFS account.
            </p>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>New password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm new password</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>

            <p style={styles.footer}>
              <Link to="/forgot-password" style={styles.link}>
                Request a new link
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
};

export default ResetPasswordPage;
