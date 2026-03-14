import { NavLink, Outlet, useNavigate } from 'react-router-dom'

export default function Layout() {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  return (
    <div className="app">
      <nav className="sidebar">
        <h2>CoreINV</h2>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/suppliers">Suppliers</NavLink>
        <NavLink to="/warehouses">Warehouses</NavLink>
        <NavLink to="/locations">Locations</NavLink>
        <NavLink to="/receipts">Receipts</NavLink>
        <NavLink to="/deliveries">Deliveries</NavLink>
        <NavLink to="/transfers">Transfers</NavLink>
        <NavLink to="/adjustments">Adjustments</NavLink>
        <NavLink to="/stock">Stock Levels</NavLink>
        <NavLink to="/moves">Move History</NavLink>
        <a onClick={logout} style={{ cursor: 'pointer', marginTop: '20px', color: '#f87171' }}>Logout</a>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
