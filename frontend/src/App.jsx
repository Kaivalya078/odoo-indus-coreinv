import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Suppliers from './pages/Suppliers'
import Warehouses from './pages/Warehouses'
import Locations from './pages/Locations'
import Receipts from './pages/Receipts'
import Deliveries from './pages/Deliveries'
import Transfers from './pages/Transfers'
import Adjustments from './pages/Adjustments'
import StockLevels from './pages/StockLevels'
import MoveHistory from './pages/MoveHistory'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="locations" element={<Locations />} />
        <Route path="receipts" element={<Receipts />} />
        <Route path="deliveries" element={<Deliveries />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="adjustments" element={<Adjustments />} />
        <Route path="stock" element={<StockLevels />} />
        <Route path="moves" element={<MoveHistory />} />
      </Route>
    </Routes>
  )
}
