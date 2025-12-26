import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AltaProducto from './pages/AltaProducto';
import LocatecDashboard from './pages/LocatecDashboard';
import UserMenu from './components/UserMenu';
import ReportObject from './pages/ReportObject';
import Perfil from './pages/Perfil';
import LocatecUserControl from './pages/LocatecUserControl';

import "./styles/App.css";

// Componente DashboardRedirect
function DashboardRedirect({ userType, isLoggedIn }) {
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  if (userType === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  } else if (userType === 'locatel') {
    return <Navigate to="/locatec-dashboard" />;
  } else {
    return <Dashboard />;
  }
}

// Componente ProtectedRoute
const ProtectedRoute = ({ children, allowedRoles, isLoggedIn, userType }) => {
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // Inicializado como null
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userTypeFromStorage = localStorage.getItem('userType');
    setIsLoggedIn(!!token);
    setUserType(userTypeFromStorage || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userMatricula');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setUserType('');
    navigate('/');
  };

  // No renderizar las rutas hasta que userType esté definido
  if (userType === null) {
    return null;
  }

  return (
    <div>
      {/* Mostrar el UserMenu solo si el usuario está logueado */}
      {isLoggedIn && <UserMenu onLogout={handleLogout} userType={userType} />}
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setUserType={setUserType}
            />
          }
        />

        <Route path="/registro" element={<Registro />} />

        {/* Ruta de dashboard con redirección según el tipo de usuario */}
        <Route
          path="/dashboard"
          element={<DashboardRedirect userType={userType} isLoggedIn={isLoggedIn} />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              isLoggedIn={isLoggedIn}
              userType={userType}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/locatec-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={['locatel']}
              isLoggedIn={isLoggedIn}
              userType={userType}
            >
              <LocatecDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alta-producto"
          element={
            <ProtectedRoute
              allowedRoles={['admin', 'regular']}
              isLoggedIn={isLoggedIn}
              userType={userType}
            >
              <AltaProducto />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report/:objectId"
          element={<ReportObject />}
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute
              allowedRoles={['regular', 'admin']}
              isLoggedIn={isLoggedIn}
              userType={userType}
            >
              <Perfil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/locatec-user-control"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
              isLoggedIn={isLoggedIn}
              userType={userType}
            >
              <LocatecUserControl />
            </ProtectedRoute>
          }
        />


      </Routes>
    </div>
  );
}

export default App;
