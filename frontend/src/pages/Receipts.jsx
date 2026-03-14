import { useState, useEffect } from 'react'
import api from '../api'

export default function Receipts() {
  const [items, setItems] = useState([])
  const [show, setShow] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState({ warehouse_id: '', supplier_id: '', notes: '', items: [{ product_id: '', location_id: '', quantity: '' }] })

  const load = () => api.get('/receipts').then(r => setItems(r.data))
  useEffect(() => {
    load()
    api.get('/warehouses').then(r => setWarehouses(r.data))
    api.get('/products').then(r => setProducts(r.data))
    api.get('/locations').then(r => setLocations(r.data))
    api.get('/suppliers').then(r => setSuppliers(r.data))
  }, [])

  const addLine = () => setForm({ ...form, items: [...form.items, { product_id: '', location_id: '', quantity: '' }] })
  const updateLine = (i, field, val) => { const items = [...form.items]; items[i][field] = val; setForm({ ...form, items }) }

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/receipts', {
      warehouse_id: form.warehouse_id,
      supplier_id: form.supplier_id || null,
      notes: form.notes || null,
      items: form.items.map(i => ({ product_id: i.product_id, location_id: i.location_id, quantity: Number(i.quantity) })),
    })
    setShow(false); setForm({ warehouse_id: '', supplier_id: '', notes: '', items: [{ product_id: '', location_id: '', quantity: '' }] }); load()
  }

  const action = async (id, act) => { await api.post(`/receipts/${id}/${act}`); load() }

  return (
    <div>
      <div className="page-header">
        <h1>Receipts</h1>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ New Receipt</button>
      </div>
      <table>
        <thead><tr><th>Reference</th><th>Supplier</th><th>Warehouse</th><th>Status</th><th>Items</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id}>
              <td>{r.reference}</td><td>{r.supplier_name || '-'}</td><td>{r.warehouse_name}</td>
              <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
              <td>{r.items.length}</td><td>{new Date(r.created_at).toLocaleDateString()}</td>
              <td className="actions">
                {r.status === 'draft' && <button className="btn btn-warning btn-sm" onClick={() => action(r.id, 'validate')}>Validate</button>}
                {r.status === 'validated' && <button className="btn btn-success btn-sm" onClick={() => action(r.id, 'done')}>Confirm</button>}
                {r.status !== 'done' && r.status !== 'cancelled' && <button className="btn btn-danger btn-sm" onClick={() => action(r.id, 'cancel')}>Cancel</button>}
              </td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={7}>No receipts</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Receipt</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Warehouse</label>
                <select required value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: e.target.value})}>
                  <option value="">Select...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Supplier</label>
                <select value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}>
                  <option value="">None</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <h4 style={{ marginBottom: 8 }}>Items</h4>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <select required value={item.product_id} onChange={e => updateLine(i, 'product_id', e.target.value)} style={{ flex: 2 }}>
                    <option value="">Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select required value={item.location_id} onChange={e => updateLine(i, 'location_id', e.target.value)} style={{ flex: 2 }}>
                    <option value="">Location</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <input required type="number" placeholder="Qty" value={item.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} style={{ flex: 1 }} />
                </div>
              ))}
              <button type="button" className="btn btn-sm" onClick={addLine} style={{ marginBottom: 14 }}>+ Add Line</button>
              <div className="actions"><button className="btn btn-primary" type="submit">Create</button><button className="btn" type="button" onClick={() => setShow(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
