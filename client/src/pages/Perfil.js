// Perfil.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/Perfil.css";

function Perfil() {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false); // Estado para el modo de edición
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '', // Nuevo campo para el teléfono
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Estado para mensajes de éxito

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Función para obtener los datos del usuario
  const fetchUserData = () => {
    const token = localStorage.getItem('token');
    const matricula = localStorage.getItem('userMatricula') || '12345'; // Temporalmente fija la matrícula para pruebas

    axios.get(`${BACKEND_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { matricula }, // Enviar como parámetro de consulta
      })
      .then((response) => {
        setUserData(response.data);
        setFormData({
          Name: response.data.Name,
          Email: response.data.Email,
          Phone: response.data.Phone || '', // Asignar el teléfono si existe
        });
      })
      .catch((err) => {
        console.error('Error al obtener los datos del usuario:', err);
        setError('Error al obtener los datos del usuario');
      });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para actualizar los datos del usuario
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const matricula = localStorage.getItem('userMatricula') || '12345'; // Asegúrate de tener la matrícula correcta

    axios
      .put(`${BACKEND_URL}/api/users/profile`, { ...formData, matricula }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserData(response.data);
        setEditMode(false);
        setSuccess('Perfil actualizado correctamente');
        setError(null);
      })
      .catch((err) => {
        console.error('Error al actualizar el perfil del usuario:', err);
        setError('Error al actualizar el perfil del usuario');
        setSuccess(null);
      });
  };

  // Función para manejar la baja del usuario
  const handleDeactivateAccount = () => {
    const confirmDeactivate = window.confirm("¿Estás seguro de que deseas darte de baja? Esta acción no se puede deshacer.");
    if (!confirmDeactivate) return;

    const token = localStorage.getItem('token');
    const matricula = localStorage.getItem('userMatricula') || '12345'; // Asegúrate de tener la matrícula correcta

    axios
      .put(`${BACKEND_URL}/api/users/profile`, { Status: 'inactive', matricula }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserData(response.data);
        setSuccess('Tu cuenta ha sido desactivada correctamente');
        setError(null);
        // Opcional: cerrar sesión y redirigir al usuario
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userMatricula');
        window.location.href = '/login'; // Redirige al usuario a la página de inicio de sesión
      })
      .catch((err) => {
        console.error('Error al desactivar la cuenta del usuario:', err);
        setError('Error al desactivar la cuenta');
        setSuccess(null);
      });
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!userData) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="perfil-container">
      <h1>Perfil de Usuario</h1>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {editMode ? (
        <form onSubmit={handleUpdateProfile} className="perfil-form">
          <label>
            Nombre:
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Correo Electrónico:
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Teléfono:
            <input
              type="text"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              placeholder="Ejemplo: 1234567890"
            />
          </label>
          {/* Agrega más campos si es necesario */}
          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={() => setEditMode(false)}>
            Cancelar
          </button>
        </form>
      ) : (
        <div className="perfil-info">
          <p>
            <strong>Matrícula:</strong> {userData.Matricula}
          </p>
          <p>
            <strong>Nombre:</strong> {userData.Name}
          </p>
          <p>
            <strong>Correo Electrónico:</strong> {userData.Email}
          </p>
          <p>
            <strong>Teléfono:</strong> {userData.Phone || 'No proporcionado'}
          </p>
          <p>
            <strong>Estado:</strong> {userData.Status === 'activo' ? 'Activo' : 'Inactivo'}
          </p>
          {/* Agrega más campos si es necesario */}
          <button onClick={() => setEditMode(true)}>Editar Perfil</button>
          {userData.Status === 'activo' && (
            <button onClick={handleDeactivateAccount} className="deactivate-button">
              Darse de Baja
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Perfil;
