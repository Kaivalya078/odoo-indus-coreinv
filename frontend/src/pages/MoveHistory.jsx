import { useState, useEffect } from 'react'
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
              <td>{m.reference}</td><td>{m.product_name}</td><td>{m.location_name}</td>
              <td style={{ color: Number(m.quantity) > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{Number(m.quantity) > 0 ? '+' : ''}{m.quantity}</td>
              <td>{m.move_type}</td><td>{new Date(m.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {moves.length === 0 && <tr><td colSpan={6}>No movements yet</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
