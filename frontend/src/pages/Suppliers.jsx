import { useState, useEffect } from 'react'
import api from '../api'

export default function Suppliers() {
  const [items, setItems] = useState([])
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', contact_email: '', phone: '', address: '' })

  const load = () => api.get('/suppliers').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/suppliers', form)
    setShow(false); setForm({ name: '', contact_email: '', phone: '', address: '' }); load()
  }

  const remove = async (id) => { await api.delete(`/suppliers/${id}`); load() }

  return (
    <div>
      <div className="page-header">
        <h1>Suppliers</h1>
        <button className="btn btn-primary" onClick={() => setShow(true)}>+ New Supplier</button>
      </div>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map(s => (
            <tr key={s.id}><td>{s.name}</td><td>{s.contact_email || '-'}</td><td>{s.phone || '-'}</td><td>{s.address || '-'}</td>
              <td><button className="btn btn-danger btn-sm" onClick={() => remove(s.id)}>Delete</button></td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={5}>No suppliers</td></tr>}
        </tbody>
      </table>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>New Supplier</h3>
            <form onSubmit={submit}>
              <div className="form-group"><label>Name</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-group"><label>Email</label><input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="form-group"><label>Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="actions"><button className="btn btn-primary" type="submit">Create</button><button className="btn" type="button" onClick={() => setShow(false)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
