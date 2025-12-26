import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Navbar.css'; // Archivo CSS opcional para estilos"
function Navbar() {
  const navigate = useNavigate();

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/">Login</Link>
      <Link to="/registro">Registro</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/alta-producto">Alta de Producto</Link>
      <Link to="/send-message">Enviar Mensaje</Link>
      <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
    </nav>
  );
}

export default Navbar;
