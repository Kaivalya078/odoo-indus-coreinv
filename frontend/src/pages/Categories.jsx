import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import api from '../api'

export default function Categories() {
  const [items, setItems] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const load = () => api.get('/categories').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/categories', form)
    setShow(false); setForm({ name: '', description: '' }); load()
  }

  const remove = async (id) => { if (confirm('Delete this category?')) { await api.delete(`/categories/${id}`); load() } }

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={16} /> New Category</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(c => (
            <tr key={c.id}><td className="font-bold">{c.name}</td><td>{c.description || '—'}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Delete</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={3} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No categories</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Category</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Name</label><input required placeholder="Raw Materials" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea placeholder="Category description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="actions" style={{ marginTop: 8 }}>
                <button className="btn btn-primary" type="submit">Create Category</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShow(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
