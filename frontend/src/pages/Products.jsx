import { useState, useEffect } from 'react'
import api from '../api'

export default function Products() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ sku: '', name: '', description: '', category_id: '', unit: 'pcs', min_stock: 0 })
  const [search, setSearch] = useState('')

  const load = () => api.get(`/products?search=${search}`).then(r => setItems(r.data))
  useEffect(() => { load(); api.get('/categories').then(r => setCategories(r.data)) }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/products', { ...form, category_id: form.category_id || null, min_stock: Number(form.min_stock) })
    setShow(false); setForm({ sku: '', name: '', description: '', category_id: '', unit: 'pcs', min_stock: 0 }); load()
  }

  const remove = async (id) => { await api.delete(`/products/${id}`); load() }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <div className="actions">
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
          <button className="btn btn-primary" onClick={() => setShow(true)}>+ New Product</button>
        </div>
      </div>
      <table>
        <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Unit</th><th>Min Stock</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id}>
              <td>{p.sku}</td><td>{p.name}</td><td>{p.category_name || '-'}</td><td>{p.unit}</td><td>{p.min_stock}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>Delete</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={6}>No products found</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Product</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>SKU</label><input required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} /></div>
              <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Unit</label><input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} /></div>
              <div className="form-group"><label>Min Stock</label><input type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} /></div>
              <div className="actions"><button className="btn btn-primary" type="submit">Create</button><button className="btn" type="button" onClick={() => setShow(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
