import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password, full_name: fullName })
        setIsRegister(false)
        alert('Registration successful! Please login.')
      } else {
        const res = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', res.data.access_token)
        const me = await api.get('/auth/me')
        localStorage.setItem('user', JSON.stringify(me.data))
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo"><span>CoreINV</span></div>
        <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="login-subtitle">{isRegister ? 'Register to get started' : 'Sign in to your account'}</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', marginTop: '4px' }} type="submit">
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a onClick={() => { setIsRegister(!isRegister); setError('') }} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            {isRegister ? 'Sign In' : 'Register'}
          </a>
        </p>
      </div>
    </div>
  )
}
