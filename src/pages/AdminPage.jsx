import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getStats,
  getItemsByStatus,
  approveItem,
  rejectItem,
  getClaims,
  approveClaim,
  rejectClaim,
} from "../api/admin";
import useWindowWidth from "../hooks/useWindowWidth";

const StatusBadge = ({ status }) => {
  const colors = {
    pending: { bg: "#fef9c3", text: "#854d0e" },
    approved: { bg: "#dcfce7", text: "#15803d" },
    matched: { bg: "#dbeafe", text: "#1d4ed8" },
    claimed: { bg: "#f3e8ff", text: "#7e22ce" },
    recovered: { bg: "#ccfbf1", text: "#0f766e" },
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

const AdminPage = () => {
  const width = useWindowWidth();
  const isMobile = width < 600;

  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [allItemsStatus, setAllItemsStatus] = useState("approved");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [feedback, setFeedback] = useState("");

  // Load stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (tab === "reports") fetchPendingItems();
    if (tab === "claims") fetchPendingClaims();
    if (tab === "items") fetchAllItems(allItemsStatus);
  }, [tab]);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const res = await getItemsByStatus("pending");
      setPendingItems(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingClaims = async () => {
    setLoading(true);
    try {
      const res = await getClaims("pending");
      setPendingClaims(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = async (status) => {
    setLoading(true);
    try {
      const res = await getItemsByStatus(status);
      setAllItems(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleApproveItem = async (id) => {
    setActionLoading(id);
    try {
      await approveItem(id);
      setPendingItems((prev) => prev.filter((i) => i._id !== id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pendingItems: prev.pendingItems - 1,
              approvedItems: prev.approvedItems + 1,
            }
          : prev,
      );
      showFeedback("Item approved and published.");
    } catch (err) {
      showFeedback(err.response?.data?.message || "Failed to approve item.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRejectItem = async (id) => {
    setActionLoading(id);
    try {
      await rejectItem(id, "Does not meet submission standards.");
      setPendingItems((prev) => prev.filter((i) => i._id !== id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pendingItems: prev.pendingItems - 1,
            }
          : prev,
      );
      showFeedback("Item rejected.");
    } catch (err) {
      showFeedback(err.response?.data?.message || "Failed to reject item.");
    } finally {
      setActionLoading("");
    }
  };

  const handleApproveClaim = async (id) => {
    setActionLoading(id);
    try {
      const res = await approveClaim(id);
      setPendingClaims((prev) => prev.filter((c) => c._id !== id));
      showFeedback(
        `Claim approved. Collection code: ${res.data.collectionCode}`,
      );
    } catch (err) {
      showFeedback(err.response?.data?.message || "Failed to approve claim.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRejectClaim = async (id) => {
    setActionLoading(id);
    try {
      await rejectClaim(id, "Verification details did not match.");
      setPendingClaims((prev) => prev.filter((c) => c._id !== id));
      showFeedback("Claim rejected.");
    } catch (err) {
      showFeedback(err.response?.data?.message || "Failed to reject claim.");
    } finally {
      setActionLoading("");
    }
  };

  const TABS = [
    { key: "stats", label: "Overview" },
    {
      key: "reports",
      label: `Pending Reports${stats ? ` (${stats.pendingItems})` : ""}`,
    },
    {
      key: "claims",
      label: `Pending Claims${stats ? ` (${stats.pendingClaims})` : ""}`,
    },
    { key: "items", label: "All Items" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>University of Lagos — DLFS Management</p>
          </div>
        </div>

        {/* Feedback toast */}
        {feedback && <div style={styles.toast}>{feedback}</div>}

        {/* Tabs */}
        <div
          style={{
            ...styles.tabs,
            overflowX: isMobile ? "auto" : "visible",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              style={{
                ...styles.tab,
                borderBottom:
                  tab === t.key ? "2px solid #0A7E8C" : "2px solid transparent",
                color: tab === t.key ? "#0A7E8C" : "#64748b",
                fontWeight: tab === t.key ? "600" : "400",
                whiteSpace: "nowrap",
              }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === "stats" && (
          <div>
            {!stats ? (
              <div style={styles.center}>Loading stats...</div>
            ) : (
              <>
                <div
                  style={{
                    ...styles.statsGrid,
                    gridTemplateColumns: isMobile
                      ? "1fr 1fr"
                      : "repeat(4, 1fr)",
                  }}
                >
                  {[
                    {
                      label: "Total items",
                      value: stats.totalItems,
                      color: "#0D1B2A",
                    },
                    {
                      label: "Pending review",
                      value: stats.pendingItems,
                      color: "#d97706",
                    },
                    {
                      label: "Active (approved)",
                      value: stats.approvedItems,
                      color: "#0A7E8C",
                    },
                    {
                      label: "Claimed",
                      value: stats.claimedItems,
                      color: "#7c3aed",
                    },
                    {
                      label: "Recovered",
                      value: stats.recoveredItems,
                      color: "#15803d",
                    },
                    {
                      label: "Total users",
                      value: stats.totalUsers,
                      color: "#0D1B2A",
                    },
                    {
                      label: "Pending claims",
                      value: stats.pendingClaims,
                      color: "#b91c1c",
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={styles.statCard}>
                      <span style={{ ...styles.statValue, color }}>
                        {value}
                      </span>
                      <span style={styles.statLabel}>{label}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.quickActions}>
                  <h3 style={styles.sectionTitle}>Quick actions</h3>
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.actionBtn}
                      onClick={() => setTab("reports")}
                    >
                      Review pending reports →
                    </button>
                    <button
                      style={styles.actionBtn}
                      onClick={() => setTab("claims")}
                    >
                      Review pending claims →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Pending reports tab */}
        {tab === "reports" && (
          <div>
            {loading ? (
              <div style={styles.center}>Loading pending reports...</div>
            ) : pendingItems.length === 0 ? (
              <div style={styles.empty}>
                No pending reports. All caught up ✓
              </div>
            ) : (
              <div style={styles.list}>
                {pendingItems.map((item) => (
                  <div key={item._id} style={styles.reviewCard}>
                    <div style={styles.reviewCardHeader}>
                      {/* Thumbnail */}
                      <div style={styles.thumb}>
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0].url}
                            alt={item.title}
                            style={styles.thumbImg}
                          />
                        ) : (
                          <div style={styles.thumbPlaceholder}>📦</div>
                        )}
                      </div>

                      {/* Details */}
                      <div style={styles.reviewInfo}>
                        <div style={styles.reviewTitleRow}>
                          <span style={styles.reviewItemTitle}>
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: "600",
                              color:
                                item.type === "lost" ? "#b91c1c" : "#15803d",
                              textTransform: "uppercase",
                            }}
                          >
                            {item.type}
                          </span>
                        </div>
                        <div style={styles.reviewMeta}>
                          <span>{item.category}</span>
                          <span style={styles.dot}>·</span>
                          <span>{item.location}</span>
                          <span style={styles.dot}>·</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </span>
                        </div>
                        <p style={styles.reviewDescription}>
                          {item.description}
                        </p>
                        <div style={styles.reviewMeta}>
                          <span>Reported by: </span>
                          <strong>{item.reportedBy?.name}</strong>
                          <span style={styles.dot}>·</span>
                          <span>{item.reportedBy?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.reviewActions}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleApproveItem(item._id)}
                        disabled={actionLoading === item._id}
                      >
                        {actionLoading === item._id
                          ? "Processing..."
                          : "✓ Approve"}
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleRejectItem(item._id)}
                        disabled={actionLoading === item._id}
                      >
                        ✕ Reject
                      </button>
                      <Link
                        to={`/items/${item._id}`}
                        style={styles.viewBtn}
                        target="_blank"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending claims tab */}
        {tab === "claims" && (
          <div>
            {loading ? (
              <div style={styles.center}>Loading pending claims...</div>
            ) : pendingClaims.length === 0 ? (
              <div style={styles.empty}>No pending claims. All caught up ✓</div>
            ) : (
              <div style={styles.list}>
                {pendingClaims.map((claim) => (
                  <div key={claim._id} style={styles.reviewCard}>
                    <div style={styles.claimCardBody}>
                      {/* Item being claimed */}
                      <div style={styles.claimItemSection}>
                        <p style={styles.sectionLabel}>Item being claimed</p>
                        <p style={styles.claimItemTitle}>{claim.item?.title}</p>
                        <div style={styles.reviewMeta}>
                          <span>{claim.item?.category}</span>
                          <span style={styles.dot}>·</span>
                          <span>{claim.item?.location}</span>
                        </div>

                        {/* Finder's private note */}
                        {claim.item?.verificationNote && (
                          <div style={styles.verificationBox}>
                            <p style={styles.verificationLabel}>
                              Finder's private note
                            </p>
                            <p style={styles.verificationText}>
                              {claim.item.verificationNote}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Claimant's details */}
                      <div style={styles.claimantSection}>
                        <p style={styles.sectionLabel}>Claimant</p>
                        <p style={styles.claimItemTitle}>
                          {claim.claimant?.name}
                        </p>
                        <p style={styles.reviewMeta}>{claim.claimant?.email}</p>

                        {/* Claimant's verification details */}
                        <div style={styles.claimantDetailsBox}>
                          <p style={styles.verificationLabel}>
                            Their verification details
                          </p>
                          <p style={styles.verificationText}>
                            {claim.verificationDetails}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.reviewActions}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleApproveClaim(claim._id)}
                        disabled={actionLoading === claim._id}
                      >
                        {actionLoading === claim._id
                          ? "Processing..."
                          : "✓ Approve claim"}
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleRejectClaim(claim._id)}
                        disabled={actionLoading === claim._id}
                      >
                        ✕ Reject claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All items tab */}
        {tab === "items" && (
          <div>
            {/* Status filter */}
            <div style={styles.statusFilter}>
              {[
                "pending",
                "approved",
                "matched",
                "claimed",
                "recovered",
                "archived",
              ].map((s) => (
                <button
                  key={s}
                  style={{
                    ...styles.filterChip,
                    backgroundColor:
                      allItemsStatus === s ? "#0D1B2A" : "#ffffff",
                    color: allItemsStatus === s ? "#ffffff" : "#64748b",
                    border:
                      allItemsStatus === s
                        ? "1px solid #0D1B2A"
                        : "1px solid #e2e8f0",
                  }}
                  onClick={() => {
                    setAllItemsStatus(s);
                    fetchAllItems(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={styles.center}>Loading items...</div>
            ) : allItems.length === 0 ? (
              <div style={styles.empty}>
                No items with status: {allItemsStatus}
              </div>
            ) : (
              <div style={styles.list}>
                {allItems.map((item) => (
                  <Link
                    key={item._id}
                    to={`/items/${item._id}`}
                    style={styles.simpleRow}
                  >
                    <div style={styles.simpleInfo}>
                      <div style={styles.reviewTitleRow}>
                        <span style={styles.reviewItemTitle}>{item.title}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div style={styles.reviewMeta}>
                        <span
                          style={{
                            color: item.type === "lost" ? "#b91c1c" : "#15803d",
                            fontWeight: "600",
                            textTransform: "capitalize",
                            fontSize: "0.8rem",
                          }}
                        >
                          {item.type}
                        </span>
                        <span style={styles.dot}>·</span>
                        <span>{item.category}</span>
                        <span style={styles.dot}>·</span>
                        <span>{item.location}</span>
                        <span style={styles.dot}>·</span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                  </Link>
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
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "1.5rem",
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
  toast: {
    backgroundColor: "#0D1B2A",
    color: "#ffffff",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: "1.25rem",
    gap: "0.1rem",
  },
  tab: {
    padding: "0.65rem 1rem",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  statsGrid: {
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
    fontSize: "2rem",
    fontWeight: "700",
  },
  statLabel: {
    fontSize: "0.82rem",
    color: "#64748b",
  },
  quickActions: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 1rem",
  },
  actionButtons: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  actionBtn: {
    padding: "0.65rem 1.25rem",
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#0D1B2A",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "500",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1.25rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  reviewCardHeader: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  thumb: {
    width: "80px",
    height: "80px",
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
    fontSize: "1.8rem",
  },
  reviewInfo: {
    flex: 1,
    minWidth: 0,
  },
  reviewTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.3rem",
    flexWrap: "wrap",
  },
  reviewItemTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#0D1B2A",
  },
  reviewMeta: {
    fontSize: "0.82rem",
    color: "#64748b",
    display: "flex",
    gap: "0.4rem",
    flexWrap: "wrap",
    marginBottom: "0.4rem",
  },
  reviewDescription: {
    fontSize: "0.875rem",
    color: "#374151",
    lineHeight: 1.6,
    margin: "0.4rem 0",
  },
  reviewActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "1rem",
    marginTop: "0.5rem",
  },
  approveBtn: {
    padding: "0.55rem 1.25rem",
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  rejectBtn: {
    padding: "0.55rem 1.25rem",
    backgroundColor: "transparent",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: "600",
  },
  viewBtn: {
    padding: "0.55rem 1rem",
    backgroundColor: "#f1f5f9",
    color: "#374151",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.875rem",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
  },
  claimCardBody: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  claimItemSection: {
    flex: 1,
    minWidth: "200px",
  },
  claimantSection: {
    flex: 1,
    minWidth: "200px",
  },
  sectionLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 0.4rem",
  },
  claimItemTitle: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#0D1B2A",
    margin: "0 0 0.25rem",
  },
  verificationBox: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "8px",
    padding: "0.75rem",
    marginTop: "0.75rem",
  },
  claimantDetailsBox: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "0.75rem",
    marginTop: "0.75rem",
  },
  verificationLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    margin: "0 0 0.35rem",
  },
  verificationText: {
    fontSize: "0.875rem",
    color: "#374151",
    lineHeight: 1.6,
    margin: 0,
  },
  statusFilter: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginBottom: "1.25rem",
  },
  filterChip: {
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  simpleRow: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "1rem",
    textDecoration: "none",
    display: "block",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  simpleInfo: {
    flex: 1,
  },
  dot: {
    color: "#cbd5e1",
  },
  empty: {
    textAlign: "center",
    padding: "3rem",
    color: "#64748b",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
  },
  center: {
    textAlign: "center",
    padding: "2rem",
    color: "#64748b",
  },
};

export default AdminPage;
