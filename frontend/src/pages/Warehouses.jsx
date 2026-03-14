import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import api from '../api'

export default function Warehouses() {
  const [items, setItems] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', address: '' })

  const load = () => api.get('/warehouses').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/warehouses', form)
    setShow(false); setForm({ name: '', address: '' }); load()
  }

  const remove = async (id) => { if (confirm('Delete this warehouse?')) { await api.delete(`/warehouses/${id}`); load() } }

  return (
    <div>
      <div className="page-header">
        <h1>Warehouses</h1>
        <button className="btn btn-primary" onClick={() => setShow(true)}><Plus size={16} /> New Warehouse</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(w => (
            <tr key={w.id}><td className="font-bold">{w.name}</td><td>{w.address || '—'}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => remove(w.id)}>Delete</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={3} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No warehouses</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Warehouse</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Name</label><input required placeholder="Main Warehouse" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Address</label><textarea placeholder="Warehouse address..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="actions" style={{ marginTop: 8 }}>
                <button className="btn btn-primary" type="submit">Create Warehouse</button>
                <button className="btn btn-ghost" type="button" onClick={() => setShow(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
