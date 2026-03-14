import { useState, useEffect } from 'react'
import api from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentMoves, setRecentMoves] = useState([])
  const [lowStock, setLowStock] = useState([])

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data))
    api.get('/dashboard/recent-moves').then(r => setRecentMoves(r.data))
    api.get('/dashboard/low-stock').then(r => setLowStock(r.data))
  }, [])

  if (!stats) return <p>Loading...</p>

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><div className="label">Products</div><div className="value">{stats.total_products}</div></div>
        <div className="stat-card"><div className="label">Warehouses</div><div className="value">{stats.total_warehouses}</div></div>
        <div className="stat-card"><div className="label">Suppliers</div><div className="value">{stats.total_suppliers}</div></div>
        <div className="stat-card"><div className="label">Pending Receipts</div><div className="value">{stats.pending_receipts}</div></div>
        <div className="stat-card"><div className="label">Pending Deliveries</div><div className="value">{stats.pending_deliveries}</div></div>
        <div className="stat-card"><div className="label">Pending Transfers</div><div className="value">{stats.pending_transfers}</div></div>
        <div className="stat-card"><div className="label">Low Stock Alerts</div><div className="value" style={{ color: stats.low_stock_count > 0 ? '#ef4444' : '#22c55e' }}>{stats.low_stock_count}</div></div>
      </div>

      <div className="card">
        <h3>Recent Stock Movements</h3>
        <table>
          <thead><tr><th>Reference</th><th>Product</th><th>Location</th><th>Qty</th><th>Type</th><th>Date</th></tr></thead>
          <tbody>
            {recentMoves.map(m => (
              <tr key={m.id}>
                <td>{m.reference}</td><td>{m.product_name}</td><td>{m.location_name}</td>
                <td style={{ color: m.quantity > 0 ? '#22c55e' : '#ef4444' }}>{Number(m.quantity) > 0 ? '+' : ''}{m.quantity}</td>
                <td>{m.move_type}</td><td>{new Date(m.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {recentMoves.length === 0 && <tr><td colSpan={6}>No movements yet</td></tr>}
          </tbody>
        </table>
      </div>

      {lowStock.length > 0 && (
        <div className="card">
          <h3>Low Stock Alerts</h3>
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Location</th><th>Current</th><th>Min Required</th></tr></thead>
            <tbody>
              {lowStock.map((item, i) => (
                <tr key={i}>
                  <td>{item.product_name}</td><td>{item.product_sku}</td><td>{item.location_name} ({item.warehouse_name})</td>
                  <td style={{ color: '#ef4444' }}>{item.current_stock}</td><td>{item.min_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
