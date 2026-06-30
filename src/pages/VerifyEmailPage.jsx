import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { verifyEmail } from '../api/auth'

const VerifyEmailPage = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const runVerification = async () => {
      try {
        const res = await verifyEmail(token)
        setMessage(res.data.message)
        setStatus('success')
      } catch (err) {
        setMessage(
          err.response?.data?.message || 'Verification failed. Please try again.'
        )
        setStatus('error')
      }
    }
    runVerification()
  }, [token])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <div style={styles.icon}>⏳</div>
            <h2 style={styles.title}>Verifying your email...</h2>
            <p style={styles.subtitle}>This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.icon}>✅</div>
            <h2 style={styles.title}>Email verified</h2>
            <p style={styles.subtitle}>{message}</p>
            <Link to="/login" style={styles.button}>
              Go to sign in
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>Verification failed</h2>
            <p style={styles.subtitle}>{message}</p>
            <Link to="/login" style={styles.link}>
              ← Back to sign in
            </Link>
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
    backgroundColor: '#f8fafc',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
    textAlign: 'center',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#0D1B2A',
    margin: '0 0 0.5rem',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.9rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#0A7E8C',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.7rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  link: {
    color: '#0A7E8C',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
}

export default VerifyEmailPage