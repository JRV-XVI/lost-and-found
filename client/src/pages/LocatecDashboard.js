// LocatecDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/LocatecDashboard.css";

function LocatecDashboard() {
  const [lostObjects, setLostObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // Estado para mensajes de éxito
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'perdido', 'inactive'
  const [currentPage, setCurrentPage] = useState(1);
  const objectsPerPage = 10;
  const [loadingEntregar, setLoadingEntregar] = useState(null); // Estado para carga del botón "Entregar"

  useEffect(() => {
    const fetchLostObjects = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/objects/status-lost`);
        setLostObjects(response.data);
        console.log('Objetos recibidos:', response.data); // Asegúrate de que cada objeto tenga cardId
        setError(null);
      } catch (error) {
        console.error('Error fetching lost objects:', error);
        setError('Error al obtener los objetos perdidos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchLostObjects();
  }, []);
  

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000); // 5000 ms = 5 segundos

      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleEntregar = async (object) => {
    const { cardId, id } = object;
  
    // Validar cardId e id
    if (!cardId || !id) {
      setError('Datos incompletos: cardId o ID no definidos.');
      return;
    }
  
    console.log('Intentando entregar el objeto:', { cardId, id });
  
    try {
      // Enviar solicitud al backend para procesar
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/objects/entregar`, {
        cardId,
        objectId: id,
      });
  
      // Mostrar mensaje de éxito
      setSuccessMessage(response.data.message);
      setError(null);
    } catch (error) {
      console.error('Error al procesar la entrega:', error);
      setError(error.response?.data?.message || 'Error al procesar la entrega.');
      setSuccessMessage(null);
    }
  };
  
  

  const filteredLostObjects = lostObjects.filter((object) => {
    const matchesSearch = object.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          object.Matricula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || object.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Paginación
  const indexOfLastObject = currentPage * objectsPerPage;
  const indexOfFirstObject = indexOfLastObject - objectsPerPage;
  const currentObjects = filteredLostObjects.slice(indexOfFirstObject, indexOfLastObject);
  const totalPages = Math.ceil(filteredLostObjects.length / objectsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard Locatec</h1>
      <h2 className="dashboard-subtitle">Objetos Perdidos</h2>

      {/* Mensajes de Éxito y Error */}
      {/* successMessage && <p style={{ color: 'green' }}>{successMessage}</p> */}
      {/* error && <p style={{ color: 'red' }}>{error}</p> */}

      {/* Sección de Búsqueda y Filtrado */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Buscar por Nombre o Matrícula"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />

      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Matrícula del Dueño</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th> {/* Nueva columna para acciones */}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5">Cargando objetos perdidos...</td>
              </tr>
            ) : currentObjects.length > 0 ? (
              currentObjects.map((object) => (
                <tr key={object.id}>
                  <td>{object.Matricula}</td>
                  <td>{object.Name}</td>
                  <td>{object.Type}</td>
                  <td>{object.Status}</td>
                  <td>
                    <button
                      className="entregar-btn"
                      onClick={() => handleEntregar(object)}
                      disabled={object.Status !== 'perdido' || loadingEntregar === object.id} // Deshabilitar si no está 'perdido' o está cargando
                    >
                      {loadingEntregar === object.id ? 'Entregando...' : 'Entregar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No se encontraron objetos perdidos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageClick(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}

          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default LocatecDashboard;
