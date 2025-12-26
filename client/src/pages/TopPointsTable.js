// src/components/TopPointsTable.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/TopPointsTable.css"; // Asegúrate de crear este archivo

function TopPointsTable() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users/top-points`, { headers });

        setTopUsers(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response) {
          setError(`Error: ${err.response.data.message}`);
        } else if (err.request) {
          setError('Error: No se recibió respuesta del servidor.');
        } else {
          setError(`Error: ${err.message}`);
        }
        console.error('Error fetching top users:', err);
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  return (
    <div className="top-points-table-container">
      <h2>Top 5 Matrículas con Más Puntos</h2>
      {loading ? (
        <div className="loader">Cargando datos...</div>
      ) : (
        <>
          {error && <p className="error">{error}</p>}
          <table className="table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.length === 0 ? (
                <tr>
                  <td colSpan="5">No hay usuarios registrados.</td>
                </tr>
              ) : (
                topUsers.map(user => (
                  <tr key={user.Matricula}>
                    <td>{user.Matricula}</td>
                    <td>{user.Name}</td>
                    <td>{user.Email}</td>
                    <td>{user.Phone}</td>
                    <td>{user.Points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default TopPointsTable;
