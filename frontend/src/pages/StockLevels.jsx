import { useState, useEffect } from 'react'
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
          {items.map((s, i) => (
            <tr key={i}>
              <td>{s.product_name}</td><td>{s.product_sku}</td><td>{s.location_name}</td><td>{s.warehouse_name}</td>
              <td style={{ fontWeight: 600 }}>{s.quantity}</td><td>{s.unit}</td><td>{s.min_stock}</td>
              <td>{Number(s.quantity) < Number(s.min_stock) ? <span className="badge badge-cancelled">Low</span> : <span className="badge badge-done">OK</span>}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={8}>No stock data</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
