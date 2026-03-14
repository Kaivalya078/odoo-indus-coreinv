import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import api from '../api'

export default function Transfers() {
  const [items, setItems] = useState([])
  const [show, setShow] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ source_warehouse_id: '', dest_warehouse_id: '', notes: '', items: [{ product_id: '', source_location_id: '', dest_location_id: '', quantity: '' }] })
  const [error, setError] = useState('')

  const load = () => api.get('/transfers').then(r => setItems(r.data))
  useEffect(() => {
    load()
    api.get('/warehouses').then(r => setWarehouses(r.data))
    api.get('/products').then(r => setProducts(r.data))
    api.get('/locations').then(r => setLocations(r.data))
  }, [])

  const addLine = () => setForm({ ...form, items: [...form.items, { product_id: '', source_location_id: '', dest_location_id: '', quantity: '' }] })
  const updateLine = (i, field, val) => { const items = [...form.items]; items[i][field] = val; setForm({ ...form, items }) }
  const removeLine = (i) => { if (form.items.length > 1) { const items = [...form.items]; items.splice(i, 1); setForm({ ...form, items }) } }

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/transfers', {
        source_warehouse_id: form.source_warehouse_id,
        dest_warehouse_id: form.dest_warehouse_id,
        notes: form.notes || null,
        items: form.items.map(i => ({ product_id: i.product_id, source_location_id: i.source_location_id, dest_location_id: i.dest_location_id, quantity: Number(i.quantity) })),
      })
      setShow(false); setForm({ source_warehouse_id: '', dest_warehouse_id: '', notes: '', items: [{ product_id: '', source_location_id: '', dest_location_id: '', quantity: '' }] }); load()
    } catch (err) { setError(err.response?.data?.detail || 'Error') }
  }

  const action = async (id, act) => {
    try { setError(''); await api.post(`/transfers/${id}/${act}`); load() }
    catch (err) { setError(err.response?.data?.detail || 'Error') }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Transfers</h1>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={16} /> New Transfer</button>
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Reference</th><th>From</th><th>To</th><th>Status</th><th>Items</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(t => (
            <tr key={t.id}>
              <td className="font-bold">{t.reference}</td><td>{t.source_warehouse_name}</td><td>{t.dest_warehouse_name}</td>
              <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
              <td>{t.items.length}</td><td>{new Date(t.created_at).toLocaleDateString()}</td>
              <td className="actions">
                {t.status === 'draft' && <button className="btn btn-warning btn-sm" onClick={() => action(t.id, 'validate')}>Validate</button>}
                {t.status === 'validated' && <button className="btn btn-success btn-sm" onClick={() => action(t.id, 'done')}>Confirm</button>}
                {t.status !== 'done' && t.status !== 'cancelled' && <button className="btn btn-danger btn-sm" onClick={() => action(t.id, 'cancel')}>Cancel</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={7} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No transfers</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Transfer</h3>
            <form onSubmit={submit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>Source Warehouse</label>
                  <select required value={form.source_warehouse_id} onChange={e => setForm({...form, source_warehouse_id: e.target.value})}>
                    <option value="">Select...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Destination Warehouse</label>
                  <select required value={form.dest_warehouse_id} onChange={e => setForm({...form, dest_warehouse_id: e.target.value})}>
                    <option value="">Select...</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Notes</label><textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 8, display: 'block' }}>Line Items</label>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <select required value={item.product_id} onChange={e => updateLine(i, 'product_id', e.target.value)} style={{ flex: '1 1 100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
                    <option value="">Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select required value={item.source_location_id} onChange={e => updateLine(i, 'source_location_id', e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
                    <option value="">From</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <select required value={item.dest_location_id} onChange={e => updateLine(i, 'dest_location_id', e.target.value)} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
                    <option value="">To</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <input required type="number" placeholder="Qty" value={item.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} style={{ width: 70, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                  {form.items.length > 1 && <button type="button" onClick={() => removeLine(i)} className="btn btn-danger btn-sm" style={{ padding: '6px 8px' }}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" onClick={addLine} style={{ marginBottom: 16 }}>+ Add Line</button>
              <div className="actions" style={{ marginTop: 8 }}>
                <button className="btn btn-primary" type="submit">Create Transfer</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShow(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
