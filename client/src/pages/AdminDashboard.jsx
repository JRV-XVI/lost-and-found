// AdminDashboard.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopPointsTable from './TopPointsTable';
import "../styles/AdminDashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

function AdminDashboard() {
  const [objects, setObjects] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, total: 0, enLocatec: 0 });
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la búsqueda
  const [loading, setLoading] = useState(true); // Estado para la carga

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const objectsPerPage = 10; // Puedes ajustar este valor según tus necesidades

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Obtener los objetos y estadísticas
        const objectsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/objects/all`, { headers });
        const statsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/objects/stats`, { headers });

        const objectsData = objectsResponse.data;
        const statsData = statsResponse.data;

        // Calcular la cantidad de objetos con estado 'en locatec'
        const enLocatecCount = objectsData.filter(obj => obj.Status.toLowerCase() === 'en locatec').length;

        // Calcular el total excluyendo 'inactivo'
        const totalActiveObjects = objectsData.filter(obj => obj.Status.toLowerCase() !== 'inactivo').length;

        setObjects(objectsData);
        setStats({ 
          ...statsData, 
          enLocatec: enLocatecCount, 
          total: totalActiveObjects // Actualizamos el total excluyendo 'inactivo'
        });

        setLoading(false); // Datos cargados
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error fetching admin data:', err);
        setLoading(false); // Termina la carga incluso si hay un error
      }
    };

    fetchData();
  }, []);

  // Filtrar los objetos basados en el término de búsqueda
  const filteredObjects = objects.filter(object =>
    object.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    object.Matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular los índices de los objetos a mostrar en la página actual
  const indexOfLastObject = currentPage * objectsPerPage;
  const indexOfFirstObject = indexOfLastObject - objectsPerPage;
  const currentObjects = filteredObjects.slice(indexOfFirstObject, indexOfLastObject);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredObjects.length / objectsPerPage);

  // Generar una matriz de números de página para renderizar los botones
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Funciones para manejar la navegación entre páginas
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Definir colores para las gráficas
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFE', '#FF6699'];

  // Datos para el gráfico de pastel
  const pieData = [
    { name: 'Dispositivo electrónico', value: objects.filter(obj => obj.Type === 'Dispositivo electrónico').length },
    { name: 'Mochila', value: objects.filter(obj => obj.Type === 'Mochila').length },
    { name: 'Recipiente de comida', value: objects.filter(obj => obj.Type === 'Recipiente de comida').length },
    { name: 'Recipiente de bebida', value: objects.filter(obj => obj.Type === 'Recipiente de bebida').length },
    { name: 'Objeto personal', value: objects.filter(obj => obj.Type === 'Objeto personal').length },
    { name: 'Otros', value: objects.filter(obj => obj.Type === 'Otros').length },
  ];

  // Datos para el gráfico de barras
  const barData = [
    { status: 'Perdido', count: objects.filter(obj => obj.Status.toLowerCase() === 'perdido').length },
    { status: 'Encontrado', count: objects.filter(obj => obj.Status.toLowerCase() === 'encontrado').length },
    { status: 'En Locatec', count: objects.filter(obj => obj.Status.toLowerCase() === 'en locatec').length },
  ];

  return (
    <div className="admin-dashboard-container">
      <h1 className="dashboard-title">Dashboard Administrador</h1>

      {loading ? (
        <div className="loader">Cargando...</div>
      ) : (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h2>Total Objetos Perdidos</h2>
              <p>{stats.lost}</p>
            </div>
            <div className="stat-card">
              <h2>Total Objetos Encontrados</h2>
              <p>{stats.found}</p>
            </div>
            <div className="stat-card">
              <h2>Total Objetos en Locatec</h2>
              <p>{stats.enLocatec}</p>
            </div>
            <div className="stat-card">
              <h2>Total Objetos</h2>
              <p>{stats.total}</p>
            </div>
          </div>

          {/* Barra de Búsqueda */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por Nombre o Matrícula"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="table-container">
            <h2 className="dashboard-subtitle">Todos los Objetos</h2>
            {error && <p className="error">{error}</p>}
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Dueño (Matrícula)</th>
                </tr>
              </thead>
              <tbody>
                {currentObjects.map((object) => (
                  <tr key={object.id}>
                    <td>{object.id}</td>
                    <td>{object.Name}</td>
                    <td>{object.Type}</td>
                    <td>{object.Status}</td>
                    <td>{object.Matricula}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="pagination-container">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Anterior
              </button>

              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => handlePageClick(number)}
                  className={currentPage === number ? 'active' : ''}
                >
                  {number}
                </button>
              ))}

              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Siguiente
              </button>
            </div>
          </div>

          {/* Gráficas con Estadísticas */}
          <div className="charts-container">
            {/* Gráfico de Pastel */}
            <div className="chart-card">
              <h2>Distribución por Tipo de Objeto</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Barras */}
            <div className="chart-card">
              <h2>Distribución por Estado de Objeto</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
      <TopPointsTable />
    </div>
  );
}

export default AdminDashboard;
