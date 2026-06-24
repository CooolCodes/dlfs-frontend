import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../api/items";
import useWindowWidth from "../hooks/useWindowWidth";

const CATEGORIES = [
  "Electronics",
  "Documents",
  "Clothing",
  "Bags",
  "Books",
  "Accessories",
  "Keys",
  "Wallets",
  "Other",
];

const ReportItemPage = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 600;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "lost",
    category: "",
    title: "",
    location: "",
    dateOccurred: "",
    description: "",
    verificationNote: "",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      return setError("You can upload a maximum of 5 images.");
    }
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.category) return "Please select a category.";
    if (!formData.title.trim()) return "Please enter a title.";
    if (!formData.location.trim()) return "Please enter a location.";
    if (!formData.dateOccurred) return "Please select a date.";
    return null;
  };

  const validateStep2 = () => {
    if (
      !formData.description.trim() ||
      formData.description.trim().length < 20
    ) {
      return "Please provide a description of at least 20 characters.";
    }
    if (formData.type === "found" && !formData.verificationNote.trim()) {
      return "Please add a private verification note for found items.";
    }
    return null;
  };

  const handleNext = () => {
    setError("");
    const err = step === 1 ? validateStep1() : validateStep2();
    if (err) return setError(err);
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      images.forEach((img) => data.append("images", img));

      await createItem(data);
      setStep(4); // success screen
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report.");
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const StepIndicator = () => (
    <div style={styles.stepRow}>
      {["Details", "Description", "Review"].map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;
        return (
          <div key={label} style={styles.stepItem}>
            <div
              style={{
                ...styles.stepCircle,
                backgroundColor: done
                  ? "#0A7E8C"
                  : active
                    ? "#0D1B2A"
                    : "#e2e8f0",
                color: done || active ? "#ffffff" : "#94a3b8",
              }}
            >
              {done ? "✓" : num}
            </div>
            <span
              style={{
                ...styles.stepLabel,
                color: active ? "#0D1B2A" : "#94a3b8",
                fontWeight: active ? "600" : "400",
              }}
            >
              {label}
            </span>
            {i < 2 && <div style={styles.stepLine} />}
          </div>
        );
      })}
    </div>
  );

  // Success screen
  if (step === 4) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: "480px", textAlign: "center" }}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Report submitted</h2>
          <p style={styles.successText}>
            Your report has been submitted and is pending admin review. You will
            be notified by email once it is approved and if a match is found.
          </p>
          <div style={styles.successButtons}>
            <button style={styles.primaryBtn} onClick={() => navigate("/")}>
              Browse items
            </button>
            <button
              style={styles.secondaryBtn}
              onClick={() => {
                setStep(1);
                setFormData({
                  type: "lost",
                  category: "",
                  title: "",
                  location: "",
                  dateOccurred: "",
                  description: "",
                  verificationNote: "",
                });
                setImages([]);
                setPreviews([]);
              }}
            >
              Submit another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.card,
          padding: isMobile ? "1.5rem 1.25rem" : "2rem",
        }}
      >
        <h2 style={styles.pageTitle}>Report an item</h2>
        <StepIndicator />

        {error && <div style={styles.error}>{error}</div>}

        {/* Step 1: Basic details */}
        {step === 1 && (
          <div>
            {/* Lost or Found toggle */}
            <div style={styles.toggleRow}>
              {["lost", "found"].map((t) => (
                <button
                  key={t}
                  type="button"
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor:
                      formData.type === t ? "#0D1B2A" : "#f1f5f9",
                    color: formData.type === t ? "#ffffff" : "#64748b",
                  }}
                  onClick={() => setFormData({ ...formData, type: t })}
                >
                  {t === "lost"
                    ? "🔴 I lost something"
                    : "🟢 I found something"}
                </button>
              ))}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select
                name="category"
                style={styles.input}
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                type="text"
                name="title"
                placeholder="e.g. Black Samsung Galaxy phone"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Campus location</label>
              <input
                style={styles.input}
                type="text"
                name="location"
                placeholder="e.g. Main Library, Faculty of Engineering"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                {formData.type === "lost" ? "Date lost" : "Date found"}
              </label>
              <input
                style={styles.input}
                type="date"
                name="dateOccurred"
                value={formData.dateOccurred}
                max={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {/* Step 2: Description and photos */}
        {step === 2 && (
          <div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <p style={styles.hint}>
                Be specific — colour, brand, size, distinguishing marks. The
                more detail you provide the better the matching works.
              </p>
              <textarea
                style={{ ...styles.input, resize: "vertical" }}
                name="description"
                rows={5}
                placeholder="Describe the item in detail..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {formData.type === "found" && (
              <div style={styles.field}>
                <label style={styles.label}>Private verification note</label>
                <p style={styles.hint}>
                  Add a detail about this item that only the true owner would
                  know — this is never shown publicly and is used to verify
                  ownership claims. For example: "the phone wallpaper is a
                  golden retriever" or "there is a scratch on the bottom left
                  corner."
                </p>
                <textarea
                  style={{ ...styles.input, resize: "vertical" }}
                  name="verificationNote"
                  rows={3}
                  placeholder="Private note for ownership verification..."
                  value={formData.verificationNote}
                  onChange={handleChange}
                />
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Photos (optional, max 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                style={styles.fileInput}
              />
              {previews.length > 0 && (
                <div style={styles.previewRow}>
                  {previews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i + 1}`}
                      style={styles.previewImg}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h3 style={styles.reviewTitle}>Review your report</h3>
            <div style={styles.reviewGrid}>
              {[
                { label: "Type", value: formData.type },
                { label: "Category", value: formData.category },
                { label: "Title", value: formData.title },
                { label: "Location", value: formData.location },
                { label: "Date", value: formData.dateOccurred },
              ].map(({ label, value }) => (
                <div key={label} style={styles.reviewRow}>
                  <span style={styles.reviewLabel}>{label}</span>
                  <span style={styles.reviewValue}>{value}</span>
                </div>
              ))}
            </div>

            <div style={styles.reviewDescription}>
              <span style={styles.reviewLabel}>Description</span>
              <p style={styles.reviewDescText}>{formData.description}</p>
            </div>

            {previews.length > 0 && (
              <div style={styles.previewRow}>
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Preview ${i + 1}`}
                    style={styles.previewImg}
                  />
                ))}
              </div>
            )}

            <p style={styles.reviewNote}>
              Once submitted, your report will be reviewed by an administrator
              before it appears publicly.
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div
          style={{
            ...styles.navButtons,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {step > 1 && (
            <button
              style={styles.secondaryBtn}
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button style={styles.primaryBtn} onClick={handleNext}>
              Continue →
            </button>
          ) : (
            <button
              style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit report"}
            </button>
          )}
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
    display: "flex",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    width: "100%",
    maxWidth: "600px",
    alignSelf: "flex-start",
  },
  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: "0 0 1.5rem",
  },
  stepRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "1.75rem",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    flex: 1,
  },
  stepCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  stepLabel: {
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
  },
  stepLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e2e8f0",
    margin: "0 0.25rem",
  },
  toggleRow: {
    display: "flex",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  toggleBtn: {
    flex: 1,
    padding: "0.75rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    minWidth: "140px",
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
  hint: {
    fontSize: "0.82rem",
    color: "#64748b",
    marginBottom: "0.5rem",
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    color: "#374151",
    backgroundColor: "#ffffff",
  },
  fileInput: {
    width: "100%",
    fontSize: "0.9rem",
    color: "#374151",
  },
  previewRow: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.75rem",
    flexWrap: "wrap",
  },
  previewImg: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
  },
  reviewTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#0D1B2A",
    marginBottom: "1rem",
  },
  reviewGrid: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "1rem",
    border: "1px solid #e2e8f0",
  },
  reviewRow: {
    display: "flex",
    padding: "0.65rem 1rem",
    borderBottom: "1px solid #f1f5f9",
    gap: "1rem",
  },
  reviewLabel: {
    fontSize: "0.82rem",
    fontWeight: "600",
    color: "#64748b",
    minWidth: "90px",
    textTransform: "capitalize",
  },
  reviewValue: {
    fontSize: "0.9rem",
    color: "#374151",
    textTransform: "capitalize",
  },
  reviewDescription: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    border: "1px solid #e2e8f0",
  },
  reviewDescText: {
    fontSize: "0.9rem",
    color: "#374151",
    lineHeight: 1.6,
    margin: "0.4rem 0 0",
  },
  reviewNote: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: "0.5rem",
  },
  navButtons: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
  primaryBtn: {
    flex: 1,
    padding: "0.8rem",
    backgroundColor: "#0A7E8C",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryBtn: {
    flex: 1,
    padding: "0.8rem",
    backgroundColor: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    color: "#64748b",
    cursor: "pointer",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  successIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  successTitle: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#0D1B2A",
    margin: "0 0 0.75rem",
  },
  successText: {
    fontSize: "0.95rem",
    color: "#64748b",
    lineHeight: 1.7,
    marginBottom: "1.5rem",
  },
  successButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
};

export default ReportItemPage;
