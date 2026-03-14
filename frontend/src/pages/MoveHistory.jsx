import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import api from '../api'

export default function MoveHistory() {
  const [moves, setMoves] = useState([])

  useEffect(() => { api.get('/stock/moves').then(r => setMoves(r.data)) }, [])

  return (
    <div>
      <div className="page-header"><h1>Move History</h1></div>
      <table>
        <thead><tr><th>Reference</th><th>Product</th><th>Location</th><th>Quantity</th><th>Type</th><th>Date</th></tr></thead>
        <tbody>
          {moves.map(m => (
            <tr key={m.id}>
              <td className="font-bold">{m.reference}</td><td>{m.product_name}</td><td>{m.location_name}</td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: Number(m.quantity) > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                  {Number(m.quantity) > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Number(m.quantity) > 0 ? '+' : ''}{m.quantity}
                </span>
              </td>
              <td><span className="badge" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>{m.move_type}</span></td>
              <td>{new Date(m.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {moves.length === 0 && <tr><td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No movements yet</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
