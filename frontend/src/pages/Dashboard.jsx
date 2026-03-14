import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Package, Warehouse, Truck, ClipboardList, Send, ArrowLeftRight, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentMoves, setRecentMoves] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [warehouseSummary, setWarehouseSummary] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data))
    api.get('/dashboard/recent-moves').then(r => setRecentMoves(r.data))
    api.get('/dashboard/low-stock').then(r => setLowStock(r.data))
    api.get('/dashboard/warehouse-summary').then(r => setWarehouseSummary(r.data))
  }, [])

  if (!stats) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard...</div>

  const totalStock = warehouseSummary.reduce((a, w) => a + Number(w.total_stock), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-header-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/receipts')}>+ New Receipt</button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="hero-card">
            <p className="hero-label">Total Stock Units</p>
            <p className="hero-value">{totalStock.toLocaleString()}</p>
            <p className="hero-sub">Across {stats.total_warehouses} warehouse{stats.total_warehouses !== 1 ? 's' : ''} · {stats.total_products} products tracked</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--accent-soft)' }}><Package size={20} color="var(--accent)" /></div>
              <div className="label">Products</div>
              <div className="value">{stats.total_products}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--info-bg)' }}><Warehouse size={20} color="var(--info)" /></div>
              <div className="label">Warehouses</div>
              <div className="value">{stats.total_warehouses}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--success-bg)' }}><Truck size={20} color="var(--success)" /></div>
              <div className="label">Suppliers</div>
              <div className="value">{stats.total_suppliers}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: stats.low_stock_count > 0 ? 'var(--danger-bg)' : 'var(--success-bg)' }}>
                <AlertTriangle size={20} color={stats.low_stock_count > 0 ? 'var(--danger)' : 'var(--success)'} />
              </div>
              <div className="label">Low Stock</div>
              <div className="value" style={{ color: stats.low_stock_count > 0 ? 'var(--danger)' : 'inherit' }}>{stats.low_stock_count}</div>
            </div>
          </div>

          <div className="category-grid">
            <div className="category-card" onClick={() => navigate('/receipts')}>
              <div className="category-icon" style={{ background: 'var(--accent-soft)' }}><ClipboardList size={22} color="#c4b130" /></div>
              <div><div className="cat-label">Pending Receipts</div><div className="cat-value">{stats.pending_receipts}</div></div>
            </div>
            <div className="category-card" onClick={() => navigate('/deliveries')}>
              <div className="category-icon" style={{ background: 'var(--info-bg)' }}><Send size={22} color="var(--info)" /></div>
              <div><div className="cat-label">Pending Deliveries</div><div className="cat-value">{stats.pending_deliveries}</div></div>
            </div>
            <div className="category-card" onClick={() => navigate('/transfers')}>
              <div className="category-icon" style={{ background: 'var(--warning-bg)' }}><ArrowLeftRight size={22} color="var(--warning)" /></div>
              <div><div className="cat-label">Pending Transfers</div><div className="cat-value">{stats.pending_transfers}</div></div>
            </div>
          </div>

          {warehouseSummary.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <h3>Stock by Warehouse</h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={warehouseSummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f4" />
                  <XAxis dataKey="warehouse_name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="total_stock" fill="#e8d44d" radius={[6, 6, 0, 0]} name="Total Stock" />
                  <Bar dataKey="total_products" fill="#1a1a2e" radius={[6, 6, 0, 0]} name="Products" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="dashboard-side">
          <div className="panel-card">
            <div className="panel-header">
              <h3>Recent Movements</h3>
              <a onClick={() => navigate('/moves')} style={{ cursor: 'pointer' }}>View all →</a>
            </div>
            <div className="panel-list">
              {recentMoves.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No movements yet</div>
              )}
              {recentMoves.map(m => (
                <div className="panel-item" key={m.id}>
                  <div className="panel-item-icon" style={{ background: Number(m.quantity) > 0 ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
                    {Number(m.quantity) > 0 ? <TrendingUp size={16} color="var(--success)" /> : <TrendingDown size={16} color="var(--danger)" />}
                  </div>
                  <div className="panel-item-info">
                    <div className="name">{m.product_name}</div>
                    <div className="sub">{m.reference} · {m.move_type}</div>
                  </div>
                  <div className="panel-item-amount" style={{ color: Number(m.quantity) > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {Number(m.quantity) > 0 ? '+' : ''}{m.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {lowStock.length > 0 && (
            <div className="panel-card">
              <div className="panel-header">
                <h3>Low Stock Alerts</h3>
                <a onClick={() => navigate('/stock')} style={{ cursor: 'pointer' }}>View all →</a>
              </div>
              <div className="panel-list">
                {lowStock.map((item, i) => (
                  <div className="panel-item" key={i}>
                    <div className="panel-item-icon" style={{ background: 'var(--danger-bg)' }}>
                      <AlertTriangle size={16} color="var(--danger)" />
                    </div>
                    <div className="panel-item-info">
                      <div className="name">{item.product_name}</div>
                      <div className="sub">{item.location_name} · {item.warehouse_name}</div>
                    </div>
                    <div className="panel-item-amount text-danger">
                      {item.current_stock}/{item.min_stock}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
