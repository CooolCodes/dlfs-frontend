import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getItems } from "../api/items";
import useWindowWidth from "../hooks/useWindowWidth";

const ItemCard = ({ item }) => (
  <Link to={`/items/${item._id}`} style={styles.card}>
    <div style={styles.cardImage}>
      {item.images && item.images.length > 0 ? (
        <img
          src={`https://dlfs-backend.onrender.com/api${item.images[0].url}`}
          alt={item.title}
          style={styles.img}
        />
      ) : (
        <div style={styles.noImage}>📦</div>
      )}
    </div>
    <div style={styles.cardBody}>
      <span
        style={{
          ...styles.badge,
          backgroundColor: item.type === "lost" ? "#fee2e2" : "#dcfce7",
          color: item.type === "lost" ? "#b91c1c" : "#15803d",
        }}
      >
        {item.type === "lost" ? "Lost" : "Found"}
      </span>
      <h3 style={styles.cardTitle}>{item.title}</h3>
      <p style={styles.cardMeta}>📍 {item.location}</p>
      <p style={styles.cardMeta}>🗂 {item.category}</p>
      <p style={styles.cardDate}>
        {new Date(item.dateOccurred).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  </Link>
);

const HomePage = () => {
  const width = useWindowWidth();
  const isMobile = width < 600;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await getItems({ keyword, type, category, page });
        setItems(res.data.items);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        setError("Failed to load items. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [keyword, type, category, page]);

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div
        style={{
          ...styles.hero,
          backgroundImage: `
    linear-gradient(rgba(13, 27, 42, 0.72), rgba(13, 27, 42, 0.85)),
    url('https://res.cloudinary.com/dvydugv8v/image/upload/v1776794653/DLFS%20Unilag/20250915_150147_1_jumkxf.jpg')
  `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h1
          style={{
            ...styles.heroTitle,
            fontSize: isMobile ? "1.4rem" : "2rem",
          }}
        >
          Lost something on campus?
        </h1>
        <p style={styles.heroSub}>
          Search the UNILAG Digital Lost & Found database or report an item you found.
        </p>
        <div
          style={{
            ...styles.searchForm,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <input
            style={{
              ...styles.searchInput,
              borderRadius: isMobile ? "8px" : "8px 0 0 8px",
            }}
            type="text"
            placeholder="Search — phone, wallet, ID card..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
          <button
            style={{
              ...styles.searchBtn,
              borderRadius: isMobile ? "8px" : "0 8px 8px 0",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Type</label>
          <select
            style={styles.select}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category</label>
          <select
            style={styles.select}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {[
              "Electronics",
              "Documents",
              "Clothing",
              "Bags",
              "Books",
              "Accessories",
              "Keys",
              "Wallets",
              "Other",
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {(type || category || keyword) && (
          <button
            style={styles.clearBtn}
            onClick={() => {
              setType("");
              setCategory("");
              setKeyword("");
              setPage(1);
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.center}>Loading items...</div>
        ) : error ? (
          <div style={styles.center}>{error}</div>
        ) : items.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No items found.</p>
            <p style={styles.emptySubText}>
              Try a different search, or{" "}
              <Link to="/report" style={styles.emptyLink}>
                report a new item
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                ...styles.grid,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(240px, 1fr))",
              }}
            >
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={styles.pageBtn}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  style={styles.pageBtn}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
  },
  hero: {
    backgroundColor: "#f3de97",
    padding: "2.5rem 1.25rem",
    textAlign: "center",
  },
  heroTitle: {
    color: "#ffffff",
    fontWeight: "700",
    margin: "0 0 0.75rem",
  },
  heroSub: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    marginBottom: "1.5rem",
  },
  searchForm: {
    display: "flex",
    maxWidth: "560px",
    margin: "0 auto",
    gap: "0.5rem",
  },
  searchInput: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "none",
    fontSize: "0.95rem",
    outline: "none",
  },
  searchBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  filters: {
    display: "flex",
    alignItems: "flex-end",
    gap: "1rem",
    padding: "1.25rem",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  filterLabel: {
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "#64748b",
  },
  select: {
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.9rem",
    color: "#374151",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },
  clearBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "0.85rem",
    alignSelf: "flex-end",
  },
  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "2rem 1.25rem",
  },
  grid: {
    display: "grid",
    gap: "1.25rem",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflow: "hidden",
    textDecoration: "none",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "block",
  },
  cardImage: {
    height: "160px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    fontSize: "2.5rem",
  },
  cardBody: {
    padding: "1rem",
  },
  badge: {
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#0D1B2A",
    margin: "0 0 0.4rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardMeta: {
    fontSize: "0.82rem",
    color: "#64748b",
    margin: "0.15rem 0",
  },
  cardDate: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginTop: "0.4rem",
  },
  center: {
    textAlign: "center",
    padding: "3rem",
    color: "#64748b",
  },
  empty: {
    textAlign: "center",
    padding: "4rem 1rem",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#374151",
    fontWeight: "500",
  },
  emptySubText: {
    color: "#64748b",
    marginTop: "0.5rem",
  },
  emptyLink: {
    color: "#0A7E8C",
    textDecoration: "none",
    fontWeight: "500",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "2rem",
  },
  pageBtn: {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#374151",
  },
  pageInfo: {
    color: "#64748b",
    fontSize: "0.9rem",
  },
};

export default HomePage;
