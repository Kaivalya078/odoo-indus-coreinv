import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import api from '../api'

export default function StockLevels() {
  const [items, setItems] = useState([])

  useEffect(() => { api.get('/stock').then(r => setItems(r.data)) }, [])

  return (
    <div>
      <div className="page-header"><h1>Stock Levels</h1></div>
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Location</th><th>Warehouse</th><th>Quantity</th><th>Unit</th><th>Min Stock</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((s, i) => {
            const isLow = Number(s.quantity) < Number(s.min_stock)
            return (
              <tr key={i}>
                <td className="font-bold">{s.product_name}</td><td>{s.product_sku}</td><td>{s.location_name}</td><td>{s.warehouse_name}</td>
                <td style={{ fontWeight: 700, fontSize: 15 }}>{s.quantity}</td><td>{s.unit}</td><td>{s.min_stock}</td>
                <td>
                  {isLow
                    ? <span className="badge badge-cancelled" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> Low</span>
                    : <span className="badge badge-done" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> OK</span>
                  }
                </td>
              </tr>
            )
          })}
          {items.length === 0 && <tr><td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No stock data — receive inventory first</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
