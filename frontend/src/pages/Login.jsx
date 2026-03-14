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
        setError('')
      } else {
        const res = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', res.data.access_token)
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>{isRegister ? 'Register' : 'Login'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} type="submit">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13 }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a onClick={() => setIsRegister(!isRegister)} style={{ color: '#3b82f6', cursor: 'pointer' }}>
            {isRegister ? 'Login' : 'Register'}
          </a>
        </p>
      </div>
    </div>
  )
}
