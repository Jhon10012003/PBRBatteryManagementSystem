import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Dashboard from './pages/Dashboard';
import BatteryList from './pages/batteries/BatteryList';
import BatteryDetail from './pages/batteries/BatteryDetail';
import BatteryEdit from './pages/batteries/BatteryEdit';
import ShipmentList from './pages/shipments/ShipmentList';
import ShipmentDetail from './pages/shipments/ShipmentDetail';
import ShipmentEdit from './pages/shipments/ShipmentEdit';
import UserList from './pages/users/UserList';
import UserEdit from './pages/users/UserEdit';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect based on auth status
  useEffect(() => {
    if (!loading) {
      if (!user && window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <span className="mt-2 text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />

        <Route path="batteries">
          <Route index element={<BatteryList />} />
          <Route path=":id" element={<BatteryDetail />} />
          <Route path=":id/edit" element={<BatteryEdit />} />
        </Route>

        <Route path="shipments">
          <Route index element={<ShipmentList />} />
          <Route path=":id" element={<ShipmentDetail />} />
          <Route path=":id/edit" element={<ShipmentEdit />} />
        </Route>

        <Route path="users" element={<AdminRoute />}>
          <Route index element={<UserList />} />
          <Route path=":id/edit" element={<UserEdit />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;