// LocatecUserControl.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/LocatecUserControl.css";

function LocatecUserControl() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null); // Para manejar el estado de actualización

  useEffect(() => {
    const fetchLocatecUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Obtener usuarios con UserType 'locatel'
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/locatel`, { headers });

        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los usuarios.');
        console.error('Error fetching locatec users:', err);
        setLoading(false);
      }
    };

    fetchLocatecUsers();
  }, []);

  const handleStatusChange = async (matricula, newStatus) => {
    try {
      setUpdatingUserId(matricula);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Actualizar el estado del usuario
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/${matricula}/status`, { Status: newStatus }, { headers });

      // Actualizar el estado localmente
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.Matricula === matricula ? { ...user, Status: newStatus } : user
        )
      );

      setUpdatingUserId(null);
    } catch (err) {
      setError('Error al actualizar el estado del usuario.');
      console.error('Error updating user status:', err);
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="locatec-user-control-container">
      <h2>Control de Usuarios Locatec</h2>

      {loading ? (
        <div className="loader">Cargando usuarios...</div>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table className="locatec-user-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>

              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7">No hay usuarios Locatec registrados.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.Matricula}>
                  <td>{user.Matricula}</td>
                  <td>{user.Name}</td>
                  <td>{user.Email}</td>
                  <td>{user.Phone}</td>

                  <td>{user.Status}</td>
                  <td>
                    {user.Status === 'activo' ? (
                      <button
                        onClick={() => handleStatusChange(user.Matricula, 'inactivo')}
                        disabled={updatingUserId === user.Matricula}
                        className="deactivate-button"
                      >
                        {updatingUserId === user.Matricula ? 'Actualizando...' : 'Desactivar'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.Matricula, 'activo')}
                        disabled={updatingUserId === user.Matricula}
                        className="activate-button"
                      >
                        {updatingUserId === user.Matricula ? 'Actualizando...' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LocatecUserControl;
