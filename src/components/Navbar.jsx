import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWindowWidth from "../hooks/useWindowWidth";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo} onClick={() => setMenuOpen(false)}>
          <span>🔍</span>
          <span>DLFS</span>
          <span style={styles.logoSub}>Unilag</span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <div style={styles.links}>
            {/* <Link to="/" style={styles.link}>
              Browse
            </Link> */}
            {user && (
              <>
                <Link to="/report" style={styles.link}>
                  Report Item
                </Link>
                <Link to="/dashboard" style={styles.link}>
                  My Items
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" style={styles.adminLink}>
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
        )}

        {/* Desktop auth */}
        {!isMobile && (
          <div style={styles.auth}>
            {user ? (
              <div style={styles.userSection}>
                <span style={styles.userName}>
                  Hi, {user.name.split(" ")[0]}
                </span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Sign out
                </button>
              </div>
            ) : (
              <div style={styles.authButtons}>
                <Link to="/login" style={styles.loginBtn}>
                  Sign in
                </Link>
                <Link to="/register" style={styles.registerBtn}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={styles.mobileMenu}>
          {/* <Link
            to="/"
            style={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            Browse
          </Link> */}
          {user && (
            <>
              <Link
                to="/report"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                Report Item
              </Link>
              <Link
                to="/dashboard"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                My Items
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  style={styles.mobileLinkAdmin}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
          <div style={styles.mobileDivider} />
          {user ? (
            <>
              <span style={styles.mobileUserName}>
                Signed in as {user.name}
              </span>
              <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                style={styles.mobileRegisterBtn}
                onClick={() => setMenuOpen(false)}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: "#0D1B2A",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 1.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    textDecoration: "none",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  logoSub: {
    fontSize: "0.75rem",
    color: "#13B5C7",
    fontWeight: "500",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  link: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
  },
  adminLink: {
    color: "#13B5C7",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  auth: {
    display: "flex",
    alignItems: "center",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  userName: {
    color: "#cbd5e1",
    fontSize: "0.9rem",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid #475569",
    color: "#cbd5e1",
    padding: "0.4rem 0.9rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  authButtons: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  loginBtn: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  registerBtn: {
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    textDecoration: "none",
    padding: "0.45rem 1rem",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  hamburger: {
    background: "transparent",
    border: "none",
    color: "#ffffff",
    fontSize: "1.4rem",
    cursor: "pointer",
    padding: "0.25rem 0.5rem",
    lineHeight: 1,
  },
  mobileMenu: {
    backgroundColor: "#0D1B2A",
    borderTop: "1px solid #1e3a4a",
    padding: "1rem 1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  mobileLink: {
    color: "#cbd5e1",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "500",
    padding: "0.65rem 0",
    borderBottom: "1px solid #1e3a4a",
  },
  mobileLinkAdmin: {
    color: "#13B5C7",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "0.65rem 0",
    borderBottom: "1px solid #1e3a4a",
  },
  mobileDivider: {
    height: "1px",
    backgroundColor: "#1e3a4a",
    margin: "0.5rem 0",
  },
  mobileUserName: {
    color: "#94a3b8",
    fontSize: "0.85rem",
    padding: "0.4rem 0",
  },
  mobileLogoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid #475569",
    color: "#cbd5e1",
    padding: "0.65rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    marginTop: "0.5rem",
    textAlign: "center",
  },
  mobileRegisterBtn: {
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    textDecoration: "none",
    padding: "0.65rem",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontWeight: "600",
    marginTop: "0.25rem",
    textAlign: "center",
  },
};

export default Navbar;
