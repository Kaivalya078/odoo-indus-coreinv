import { useState, useEffect } from 'react'
import api from '../api'

export default function Locations() {
  const [items, setItems] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', warehouse_id: '', zone: '' })

  const load = () => api.get('/locations').then(r => setItems(r.data))
  useEffect(() => { load(); api.get('/warehouses').then(r => setWarehouses(r.data)) }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/locations', { ...form, zone: form.zone || null })
    setShow(false); setForm({ name: '', warehouse_id: '', zone: '' }); load()
  }

  const remove = async (id) => { await api.delete(`/locations/${id}`); load() }

  return (
    <div>
      <div className="page-header">
        <h1>Locations</h1>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ New Location</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Warehouse</th><th>Zone</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(l => (
            <tr key={l.id}><td>{l.name}</td><td>{l.warehouse_name || '-'}</td><td>{l.zone || '-'}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => remove(l.id)}>Delete</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4}>No locations</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Location</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Warehouse</label>
                <select required value={form.warehouse_id} onChange={e => setForm({...form, warehouse_id: e.target.value})}>
                  <option value="">Select...</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Zone</label><input value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} /></div>
              <div className="actions"><button className="btn btn-primary" type="submit">Create</button><button className="btn" type="button" onClick={() => setShow(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
