import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getItemById } from "../api/items";
import { submitClaim } from "../api/claims";
import { useAuth } from "../context/AuthContext";
import useWindowWidth from "../hooks/useWindowWidth";

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 768;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Claim form state
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimDetails, setClaimDetails] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState("");

  // Selected image for the main photo viewer
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await getItemById(id);
        setItem(res.data);
      } catch (err) {
        setError("Item not found or no longer available.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    setClaimError("");

    if (claimDetails.trim().length < 10) {
      return setClaimError("Please provide more detail to verify ownership.");
    }

    setClaimLoading(true);
    try {
      await submitClaim(id, { verificationDetails: claimDetails });
      setClaimSuccess(true);
    } catch (err) {
      setClaimError(err.response?.data?.message || "Failed to submit claim.");
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading item...</div>;
  if (error)
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>{error}</p>
        <Link to="/" style={styles.backLink}>
          ← Back to browse
        </Link>
      </div>
    );

  const canClaim =
    user &&
    item.type === "found" &&
    item.status === "approved" &&
    item.reportedBy?._id !== user.id;

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.container,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* Left column — images */}
        <div
          style={{
            ...styles.imageSection,
            width: isMobile ? "100%" : "45%",
          }}
        >
          {/* Main image */}
          <div style={styles.mainImageBox}>
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[selectedImage].url}
                alt={item.title}
                style={styles.mainImage}
              />
            ) : (
              <div style={styles.noImageLarge}>📦</div>
            )}
          </div>

          {/* Thumbnail row */}
          {item.images && item.images.length > 1 && (
            <div style={styles.thumbnails}>
              {item.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`View ${i + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border:
                      selectedImage === i
                        ? "2px solid #0A7E8C"
                        : "2px solid transparent",
                  }}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column — details */}
        <div
          style={{
            ...styles.detailSection,
            width: isMobile ? "100%" : "55%",
          }}
        >
          {/* Type badge and status */}
          <div style={styles.badgeRow}>
            <span
              style={{
                ...styles.typeBadge,
                backgroundColor: item.type === "lost" ? "#fee2e2" : "#dcfce7",
                color: item.type === "lost" ? "#b91c1c" : "#15803d",
              }}
            >
              {item.type === "lost" ? "🔴 Lost" : "🟢 Found"}
            </span>
            <span style={styles.statusBadge}>{item.status}</span>
          </div>

          <h1 style={styles.title}>{item.title}</h1>

          {/* Details grid */}
          <div style={styles.detailGrid}>
            {[
              { label: "Category", value: item.category },
              { label: "Location", value: item.location },
              {
                label: item.type === "lost" ? "Date lost" : "Date found",
                value: new Date(item.dateOccurred).toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              },
              {
                label: "Reported by",
                value: item.reportedBy?.name || "Anonymous",
              },
            ].map(({ label, value }) => (
              <div key={label} style={styles.detailRow}>
                <span style={styles.detailLabel}>{label}</span>
                <span style={styles.detailValue}>{value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div style={styles.descriptionBox}>
            <h3 style={styles.descriptionTitle}>Description</h3>
            <p style={styles.descriptionText}>{item.description}</p>
          </div>

          {/* Claim section */}
          {item.type === "found" && (
            <div style={styles.claimSection}>
              {!user ? (
                <p style={styles.loginPrompt}>
                  <Link to="/login" style={styles.loginLink}>
                    Sign in
                  </Link>{" "}
                  to claim this item if it belongs to you.
                </p>
              ) : claimSuccess ? (
                <div style={styles.successBox}>
                  <p style={styles.successText}>
                    ✅ Claim submitted successfully. An administrator will
                    review your claim and contact you by email.
                  </p>
                </div>
              ) : !canClaim ? (
                item.reportedBy?._id === user.id ? (
                  <p style={styles.ownItemNote}>You reported this item.</p>
                ) : (
                  <p style={styles.ownItemNote}>
                    This item is not available for claiming.
                  </p>
                )
              ) : !showClaimForm ? (
                <button
                  style={styles.claimBtn}
                  onClick={() => setShowClaimForm(true)}
                >
                  Claim this item
                </button>
              ) : (
                <form onSubmit={handleClaim} style={styles.claimForm}>
                  <h3 style={styles.claimTitle}>Verify your ownership</h3>
                  <p style={styles.claimInstructions}>
                    Provide specific details that only the true owner would know
                    — for example, what's inside the bag, a unique marking, a
                    device passcode, or the wallpaper description. Do not repeat
                    information already visible in the listing.
                  </p>

                  {claimError && (
                    <div style={styles.claimError}>{claimError}</div>
                  )}

                  <textarea
                    style={styles.textarea}
                    rows={5}
                    placeholder="Describe specific details that prove this item is yours..."
                    value={claimDetails}
                    onChange={(e) => setClaimDetails(e.target.value)}
                    required
                  />

                  <div style={styles.claimButtons}>
                    <button
                      type="button"
                      style={styles.cancelBtn}
                      onClick={() => setShowClaimForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        ...styles.submitClaimBtn,
                        opacity: claimLoading ? 0.7 : 1,
                      }}
                      disabled={claimLoading}
                    >
                      {claimLoading ? "Submitting..." : "Submit claim"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <Link to="/" style={styles.backLink}>
            ← Back to browse
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    padding: "1.5rem 1.25rem",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    gap: "2rem",
    alignItems: "flex-start",
  },
  imageSection: {
    flexShrink: 0,
  },
  mainImageBox: {
    width: "100%",
    aspectRatio: "4/3",
    backgroundColor: "#e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImageLarge: {
    fontSize: "4rem",
  },
  thumbnails: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
    flexWrap: "wrap",
  },
  thumbnail: {
    width: "64px",
    height: "64px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
  },
  detailSection: {
    flex: 1,
  },
  badgeRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.75rem",
    flexWrap: "wrap",
  },
  typeBadge: {
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: "600",
    backgroundColor: "#e2e8f0",
    color: "#475569",
    textTransform: "capitalize",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: "0 0 1.25rem",
    lineHeight: 1.3,
  },
  detailGrid: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1.25rem",
    border: "1px solid #e2e8f0",
  },
  detailRow: {
    display: "flex",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #f1f5f9",
    gap: "1rem",
    flexWrap: "wrap",
  },
  detailLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#64748b",
    minWidth: "100px",
  },
  detailValue: {
    fontSize: "0.9rem",
    color: "#0D1B2A",
    flex: 1,
  },
  descriptionBox: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1.25rem",
    marginBottom: "1.25rem",
    border: "1px solid #e2e8f0",
  },
  descriptionTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#64748b",
    margin: "0 0 0.6rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  descriptionText: {
    fontSize: "0.95rem",
    color: "#374151",
    lineHeight: 1.7,
    margin: 0,
  },
  claimSection: {
    marginBottom: "1.5rem",
  },
  loginPrompt: {
    fontSize: "0.95rem",
    color: "#64748b",
  },
  loginLink: {
    color: "#0A7E8C",
    fontWeight: "600",
    textDecoration: "none",
  },
  claimBtn: {
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    border: "none",
    padding: "0.85rem 2rem",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  claimForm: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "1.5rem",
  },
  claimTitle: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: "0 0 0.5rem",
  },
  claimInstructions: {
    fontSize: "0.875rem",
    color: "#64748b",
    lineHeight: 1.6,
    marginBottom: "1rem",
  },
  claimError: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "0.75rem",
    borderRadius: "6px",
    fontSize: "0.875rem",
    marginBottom: "1rem",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    color: "#374151",
    lineHeight: 1.6,
  },
  claimButtons: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
  cancelBtn: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    color: "#64748b",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  submitClaimBtn: {
    flex: 2,
    padding: "0.75rem",
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  successBox: {
    backgroundColor: "#dcfce7",
    border: "1px solid #86efac",
    borderRadius: "8px",
    padding: "1rem",
  },
  successText: {
    color: "#15803d",
    fontSize: "0.9rem",
    margin: 0,
    lineHeight: 1.6,
  },
  ownItemNote: {
    fontSize: "0.9rem",
    color: "#64748b",
    fontStyle: "italic",
  },
  center: {
    textAlign: "center",
    padding: "4rem 1rem",
    color: "#64748b",
  },
  errorText: {
    color: "#b91c1c",
    marginBottom: "1rem",
  },
  backLink: {
    color: "#0A7E8C",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    display: "inline-block",
    marginTop: "0.5rem",
  },
};

export default ItemDetailPage;
