import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import useWindowWidth from "../hooks/useWindowWidth";

const RegisterPage = () => {
  const width = useWindowWidth();
  const isMobile = width < 480;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')

  if (formData.password !== formData.confirmPassword) {
    return setError('Passwords do not match')
  }
  if (formData.password.length < 6) {
    return setError('Password must be at least 6 characters')
  }

  setLoading(true)
  try {
    await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      studentId: formData.studentId,
    })
    setSubmitted(true)
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed. Please try again.')
  } finally {
    setLoading(false)
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
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          ...styles.card,
          padding: isMobile ? '1.75rem 1.25rem' : '2.5rem',
          margin: isMobile ? '1rem' : '0',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h2 style={styles.title}>Check your email</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              We sent a verification link to{' '}
              <strong>{formData.email}</strong>.
              Click the link to activate your account before signing in.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
              Check your spam folder if you don't see it.
            </p>
            <Link to="/login" style={styles.link}>← Back to sign in</Link>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Create an account</h2>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {[
                { label: 'Full name', name: 'name', type: 'text', placeholder: 'John Doe' },
                { label: 'UNILAG email address', name: 'email', type: 'email', placeholder: 'matricno@live.unilag.edu.ng' },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'At least 6 characters' },
                { label: 'Confirm password', name: 'confirmPassword', type: 'password', placeholder: 'Repeat your password' },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name} style={styles.field}>
                  <label style={styles.label}>{label}</label>
                  <input
                    style={styles.input}
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    required={name !== 'studentId'}
                  />
                </div>
              ))}

              <button
                style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p style={styles.footer}>
              Already have an account?{' '}
              <Link to="/login" style={styles.link}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
    padding: '1rem',
    textAlign: 'left',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#0D1B2A',
    margin: '0 0 1rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  field: { marginBottom: '1.2rem' },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0D1B2A',
  },
  button: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#00786F',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  link: {
    color: '#0A7E8C',
    textDecoration: 'none',
    fontWeight: '500',
  },
}

export default RegisterPage