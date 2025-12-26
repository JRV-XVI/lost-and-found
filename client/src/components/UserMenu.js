import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/UserMenu.css";

function UserMenu({ onLogout, userType }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null); // Referencia al menú

  const handleViewProfile = () => {
    navigate('/perfil');
    setMenuOpen(false); // Cierra el menú después de seleccionar una opción
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
    setMenuOpen(false); // Cierra el menú después de seleccionar una opción
  };

  const handleUserControl = () => {
    navigate('/locatec-user-control');
    setMenuOpen(false); // Cierra el menú después de seleccionar una opción
  };

  // Función para detectar clics fuera del menú
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false); // Cierra el menú si el clic fue fuera de él
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="user-menu-button"
      >
        ☰ {/* Puedes cambiar este símbolo o usar un ícono */}
      </button>
      {menuOpen && (
        <div className="user-menu-dropdown">
          {/* Opciones para usuarios regulares y administradores */}
          {(userType === 'regular' || userType === 'admin') && (
            <button onClick={handleGoToDashboard} className="user-menu-option">
              Ir al Dashboard
            </button>
          )}
          {/* Opción específica para administradores */}
          {userType === 'admin' && (
            <button onClick={handleUserControl} className="user-menu-option">
              Control de Usuarios Locatec
            </button>
          )}
          {/* Opción específica para usuarios regulares */}
          {userType === 'regular' && (
            <button onClick={handleViewProfile} className="user-menu-option">
              Ver perfil
            </button>
          )}
          {/* Opción de cerrar sesión (visible para todos los tipos de usuario) */}
          <button onClick={onLogout} className="user-menu-option">
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
