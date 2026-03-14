import { useState, useEffect } from 'react'
import api from '../api'

export default function Adjustments() {
  const [items, setItems] = useState([])
  const [show, setShow] = useState(false)
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ product_id: '', location_id: '', quantity: '', reason: '' })
  const [error, setError] = useState('')

  const load = () => api.get('/adjustments').then(r => setItems(r.data))
  useEffect(() => {
    load()
    api.get('/products').then(r => setProducts(r.data))
    api.get('/locations').then(r => setLocations(r.data))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/adjustments', { ...form, quantity: Number(form.quantity) })
    setShow(false); setForm({ product_id: '', location_id: '', quantity: '', reason: '' }); load()
  }

  const action = async (id, act) => {
    try { setError(''); await api.post(`/adjustments/${id}/${act}`); load() }
    catch (err) { setError(err.response?.data?.detail || 'Error') }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Adjustments</h1>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ New Adjustment</button>
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Reference</th><th>Product</th><th>Location</th><th>Quantity</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(a => (
            <tr key={a.id}>
              <td>{a.reference}</td><td>{a.product_name}</td><td>{a.location_name}</td>
              <td style={{ color: a.quantity > 0 ? '#22c55e' : '#ef4444' }}>{Number(a.quantity) > 0 ? '+' : ''}{a.quantity}</td>
              <td>{a.reason}</td>
              <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
              <td className="actions">
                {a.status === 'draft' && <button className="btn btn-success btn-sm" onClick={() => action(a.id, 'done')}>Confirm</button>}
                {a.status === 'draft' && <button className="btn btn-danger btn-sm" onClick={() => action(a.id, 'cancel')}>Cancel</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={7}>No adjustments</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Adjustment</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Product</label>
                <select required value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})}>
                  <option value="">Select...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Location</label>
                <select required value={form.location_id} onChange={e => setForm({...form, location_id: e.target.value})}>
                  <option value="">Select...</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Quantity (negative to reduce)</label><input required type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
              <div className="form-group"><label>Reason</label><textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
              <div className="actions"><button className="btn btn-primary" type="submit">Create</button><button className="btn" type="button" onClick={() => setShow(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
