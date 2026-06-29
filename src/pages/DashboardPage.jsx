import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyItems } from "../api/items";
import { getMyClaims } from "../api/claims";
import { useAuth } from "../context/AuthContext";
import useWindowWidth from "../hooks/useWindowWidth";

const StatusBadge = ({ status }) => {
  const colors = {
    pending: { bg: "#fef9c3", text: "#854d0e" },
    approved: { bg: "#dcfce7", text: "#15803d" },
    matched: { bg: "#dbeafe", text: "#1d4ed8" },
    claimed: { bg: "#f3e8ff", text: "#7e22ce" },
    verified: { bg: "#ccfbf1", text: "#0f766e" },
    recovered: { bg: "#dcfce7", text: "#15803d" },
    archived: { bg: "#f1f5f9", text: "#64748b" },
    rejected: { bg: "#fee2e2", text: "#b91c1c" },
  };
  const c = colors[status] || colors.pending;
  return (
    <span
      style={{
        padding: "0.2rem 0.65rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: "600",
        backgroundColor: c.bg,
        color: c.text,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
};

const EmptyState = ({ message, linkTo, linkText }) => (
  <div style={styles.empty}>
    <p style={styles.emptyText}>{message}</p>
    {linkTo && (
      <Link to={linkTo} style={styles.emptyLink}>
        {linkText}
      </Link>
    )}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 600;

  const [tab, setTab] = useState("reports");
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getMyItems();
        setItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await getMyClaims();
        setClaims(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingClaims(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome back, {user?.name?.split(" ")[0]}
            </p>
          </div>
          <Link to="/report" style={styles.reportBtn}>
            + Report Item
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            ...styles.statsRow,
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          }}
        >
          {[
            { label: "Total reports", value: items.length },
            {
              label: "Pending review",
              value: items.filter((i) => i.status === "pending").length,
            },
            {
              label: "Active matches",
              value: items.filter((i) => i.status === "matched").length,
            },
            { label: "Claims submitted", value: claims.length },
          ].map(({ label, value }) => (
            <div key={label} style={styles.statCard}>
              <span style={styles.statValue}>{value}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["reports", "claims"].map((t) => (
            <button
              key={t}
              style={{
                ...styles.tab,
                borderBottom:
                  tab === t ? "2px solid #0A7E8C" : "2px solid transparent",
                color: tab === t ? "#0A7E8C" : "#64748b",
                fontWeight: tab === t ? "600" : "400",
              }}
              onClick={() => setTab(t)}
            >
              {t === "reports"
                ? `My Reports (${items.length})`
                : `My Claims (${claims.length})`}
            </button>
          ))}
        </div>

        {/* Reports tab */}
        {tab === "reports" && (
          <div>
            {loadingItems ? (
              <div style={styles.center}>Loading your reports...</div>
            ) : items.length === 0 ? (
              <EmptyState
                message="You haven't submitted any reports yet."
                linkTo="/report"
                linkText="Report a lost or found item →"
              />
            ) : (
              <div style={styles.list}>
                {items.map((item) => (
                  <Link
                    key={item._id}
                    to={`/items/${item._id}`}
                    style={styles.itemRow}
                  >
                    {/* Thumbnail */}
                    <div style={styles.thumb}>
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={`https://dlfs-backend.onrender.com/api${item.images[0].url}`}
                          alt={item.title}
                          style={styles.thumbImg}
                        />
                      ) : (
                        <div style={styles.thumbPlaceholder}>📦</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={styles.itemInfo}>
                      <div style={styles.itemTitleRow}>
                        <span style={styles.itemTitle}>{item.title}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div style={styles.itemMeta}>
                        <span
                          style={{
                            color: item.type === "lost" ? "#b91c1c" : "#15803d",
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.type}
                        </span>
                        <span style={styles.dot}>·</span>
                        <span>{item.category}</span>
                        <span style={styles.dot}>·</span>
                        <span>{item.location}</span>
                      </div>
                      <div style={styles.itemDate}>
                        Reported{" "}
                        {new Date(item.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Claims tab */}
        {tab === "claims" && (
          <div>
            {loadingClaims ? (
              <div style={styles.center}>Loading your claims...</div>
            ) : claims.length === 0 ? (
              <EmptyState
                message="You haven't submitted any claims yet."
                linkTo="/"
                linkText="Browse found items →"
              />
            ) : (
              <div style={styles.list}>
                {claims.map((claim) => (
                  <div key={claim._id} style={styles.claimRow}>
                    <div style={styles.claimInfo}>
                      <div style={styles.itemTitleRow}>
                        <span style={styles.itemTitle}>
                          {claim.item?.title || "Item no longer available"}
                        </span>
                        <StatusBadge status={claim.status} />
                      </div>
                      <div style={styles.itemMeta}>
                        <span>{claim.item?.category}</span>
                        <span style={styles.dot}>·</span>
                        <span>{claim.item?.location}</span>
                      </div>
                      <div style={styles.itemDate}>
                        Claimed{" "}
                        {new Date(claim.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>

                      {/* Show collection code if approved */}
                      {claim.status === "approved" && claim.collectionCode && (
                        <div style={styles.collectionBox}>
                          <p style={styles.collectionLabel}>
                            Your collection code
                          </p>
                          <p style={styles.collectionCode}>
                            {claim.collectionCode}
                          </p>
                          <p style={styles.collectionNote}>
                            Present this code along with your university ID at
                            the campus security checkpoint to collect your item.
                          </p>
                        </div>
                      )}

                      {/* Show rejection note */}
                      {claim.status === "rejected" && claim.adminNote && (
                        <div style={styles.rejectedBox}>
                          <p style={styles.rejectedNote}>
                            Reason: {claim.adminNote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: "0 0 0.25rem",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "0.9rem",
    margin: 0,
  },
  reportBtn: {
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    textDecoration: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  statsRow: {
    display: "grid",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  statValue: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#0D1B2A",
  },
  statLabel: {
    fontSize: "0.82rem",
    color: "#64748b",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: "1.25rem",
    gap: "0.25rem",
  },
  tab: {
    padding: "0.65rem 1.25rem",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.15s",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  itemRow: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1rem",
    display: "flex",
    gap: "1rem",
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    alignItems: "flex-start",
  },
  thumb: {
    width: "64px",
    height: "64px",
    borderRadius: "8px",
    overflow: "hidden",
    flexShrink: 0,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  thumbPlaceholder: {
    fontSize: "1.5rem",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.3rem",
    flexWrap: "wrap",
  },
  itemTitle: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#0D1B2A",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "300px",
  },
  itemMeta: {
    fontSize: "0.82rem",
    color: "#64748b",
    display: "flex",
    gap: "0.4rem",
    flexWrap: "wrap",
    marginBottom: "0.25rem",
  },
  dot: {
    color: "#cbd5e1",
  },
  itemDate: {
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
  claimRow: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  claimInfo: {
    flex: 1,
  },
  collectionBox: {
    backgroundColor: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "0.75rem",
  },
  collectionLabel: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#15803d",
    margin: "0 0 0.25rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  collectionCode: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#0D1B2A",
    letterSpacing: "0.1em",
    margin: "0 0 0.5rem",
    fontFamily: "monospace",
  },
  collectionNote: {
    fontSize: "0.82rem",
    color: "#15803d",
    margin: 0,
    lineHeight: 1.5,
  },
  rejectedBox: {
    backgroundColor: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "8px",
    padding: "0.75rem",
    marginTop: "0.75rem",
  },
  rejectedNote: {
    fontSize: "0.85rem",
    color: "#b91c1c",
    margin: 0,
  },
  empty: {
    textAlign: "center",
    padding: "3rem 1rem",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
  },
  emptyText: {
    color: "#64748b",
    marginBottom: "1rem",
  },
  emptyLink: {
    color: "#0A7E8C",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  center: {
    textAlign: "center",
    padding: "2rem",
    color: "#64748b",
  },
};

export default DashboardPage;
