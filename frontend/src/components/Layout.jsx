import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tags, Truck, Warehouse, MapPin,
  ClipboardList, Send, ArrowLeftRight, SlidersHorizontal,
  BarChart3, History, LogOut
} from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('token'); navigate('/login') }
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = (user.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <h4>{user.full_name || 'User'}</h4>
              <p>{user.email || ''}</p>
            </div>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Main</div>
            <NavLink to="/"><LayoutDashboard size={18} /> Dashboard</NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Master Data</div>
            <NavLink to="/products"><Package size={18} /> Products</NavLink>
            <NavLink to="/categories"><Tags size={18} /> Categories</NavLink>
            <NavLink to="/suppliers"><Truck size={18} /> Suppliers</NavLink>
            <NavLink to="/warehouses"><Warehouse size={18} /> Warehouses</NavLink>
            <NavLink to="/locations"><MapPin size={18} /> Locations</NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Operations</div>
            <NavLink to="/receipts"><ClipboardList size={18} /> Receipts</NavLink>
            <NavLink to="/deliveries"><Send size={18} /> Deliveries</NavLink>
            <NavLink to="/transfers"><ArrowLeftRight size={18} /> Transfers</NavLink>
            <NavLink to="/adjustments"><SlidersHorizontal size={18} /> Adjustments</NavLink>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Analytics</div>
            <NavLink to="/stock"><BarChart3 size={18} /> Stock Levels</NavLink>
            <NavLink to="/moves"><History size={18} /> Move History</NavLink>
          </div>
        </div>

        <div className="sidebar-footer">
          <a onClick={logout}><LogOut size={18} /> Logout</a>
        </div>
      </nav>

      <main className="main">
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
