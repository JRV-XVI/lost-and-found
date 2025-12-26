import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import QRCode from 'qrcode-generator';
import ReactModal from 'react-modal';
import "../styles/Dashboard.css";

ReactModal.setAppElement('#root');

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [userStats, setUserStats] = useState({ points: 0, reportCount: 0 });
  const [objectReports, setObjectReports] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // Nuevo estado para el modal de reporte
  const [selectedReport, setSelectedReport] = useState(null); // Nuevo estado para el reporte seleccionado

  
  const navigate = useNavigate();
  

  // Cargar variables de entorno
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BACKEND_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserData(response.data);
        fetchUserProducts(response.data.Matricula);
        fetchUserStats(response.data.Matricula);
        fetchObjectReports(response.data.Matricula);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setError('Error al cargar los datos del usuario');
          console.error('Error al obtener los datos del usuario:', err);
        }
      });
    } else {
      setError('No se encontró el token de autenticación. Inicia sesión nuevamente.');
      navigate('/');
    }
  }, [navigate, BACKEND_URL]);

  const fetchUserProducts = (matricula) => {
    const token = localStorage.getItem('token');
    axios
      .get(`${BACKEND_URL}/api/products/${matricula}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((productResponse) => {
        setUserProducts(productResponse.data);
      })
      .catch((err) => {
        console.error('Error al obtener los objetos del usuario:', err);
        setError('Error al obtener los productos');
      });
  };

  const fetchUserStats = (matricula) => {
    const token = localStorage.getItem('token');
    axios
      .get(`${BACKEND_URL}/api/stats/${matricula}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('Estadísticas del usuario:', response.data); // Log para depuración
        setUserStats(response.data);
      })
      .catch((err) => {
        console.error('Error al obtener las estadísticas del usuario:', err);
        setError('Error al obtener las estadísticas del usuario');
      });
  };

  const fetchObjectReports = (matricula) => {
    const token = localStorage.getItem('token');
    axios
      .get(`${BACKEND_URL}/api/object-reports/${matricula}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const sortedReports = response.data.sort(
          (a, b) => new Date(b.ReportDate) - new Date(a.ReportDate)
        );
        setObjectReports(sortedReports);
      })
      .catch((err) => {
        console.error('Error al obtener los reportes de los objetos:', err);
        setError('Error al obtener los reportes de los objetos');
      });
  };

  const handleShowQR = (product) => {
    const qr = QRCode(0, 'L');
    qr.addData(`${FRONTEND_URL}/report/${product.id}`);
    qr.make();
    setSelectedQR(qr.createDataURL());
    setIsQRModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditName(product.Name);
    setEditType(product.Type);
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = () => {
    axios
      .put(`${BACKEND_URL}/api/product/${selectedProduct.id}`, {
        Name: editName,
        Type: editType,
      })
      .then(() => {
        setIsEditModalOpen(false);
        fetchUserProducts(userData.Matricula);
      })
      .catch((err) => {
        console.error('Error al actualizar el producto:', err);
        setError('Error al actualizar el producto');
      });
  };

  const handleDeleteProduct = () => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.');
    if (confirmDelete) {
      axios
        .delete(`${BACKEND_URL}/api/product/${selectedProduct.id}`)
        .then(() => {
          setIsEditModalOpen(false);
          fetchUserProducts(userData.Matricula);
        })
        .catch((err) => {
          console.error('Error al eliminar el producto:', err);
          setError('Error al eliminar el producto');
        });
    }
  };
  

  const closeModal = () => {
    setIsQRModalOpen(false);
    setSelectedQR(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  // Nueva función para mostrar el reporte
  const handleShowReport = (product) => {
    const token = localStorage.getItem('token');
    axios
      .get(`${BACKEND_URL}/api/product/${product.id}/last-report`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSelectedReport(response.data);
        setIsReportModalOpen(true);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          alert('No hay reportes disponibles para este objeto');
        } else {
          console.error('Error al obtener el reporte del objeto:', err);
          setError('Error al obtener el reporte del objeto');
        }
      });
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="dashboard-container">
      {userData ? (
        <div className="user-info">
          <h1>Bienvenido, {userData.Name}</h1>
          <h2 className="window-title">Tus objetos:</h2>
          <div className="product-cards-container">
            {/* Tarjeta para agregar nuevo producto */}
            <div className="product-card add-product-card">
              <Link to="/alta-producto" className="add-product-link">
                <div className="add-product-content">
                  <span className="add-product-icon">+</span>
                  <p>Agregar Nuevo Producto</p>
                </div>
              </Link>
            </div>

            {/* Mapeo de las tarjetas de productos existentes */}
            {userProducts.map((product) => (
              <div key={product.id} className="product-card">
                <h3 className="product-title">{product.Name}</h3>
                <p className="product-subtitle">{product.Type}</p>
                <p className="product-status">{product.Status}</p>
                {product.Status === 'perdido' ? (
                  <button className="red-btn" onClick={() => handleShowReport(product)}>Ver Reporte</button>
                ) : (
                  <button onClick={() => handleShowQR(product)}>Ver QR</button>
                )}
                <button onClick={() => handleEdit(product)}>Editar/Borrar</button>
              </div>
            ))}
          </div>

          <div className="stats-section">
            <h3>Tus estadísticas:</h3>
            <p>Puntos acumulados: {userStats.points}</p>
            <p>Reportes realizados: {userStats.reportCount}</p>
          </div>
          <div className="reports-section">
            <h3>Reportes sobre tus objetos:</h3>
            {objectReports.length > 0 ? (
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Objeto</th>
                    <th>Reporte</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {objectReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.Name}</td>
                      <td>{report.Location || 'No disponible'}</td>
                      <td>{new Date(report.ReportDate).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No hay reportes disponibles</p>
            )}
          </div>
        </div>
      ) : (
        <p>Cargando...</p>
      )}

      {/* Modales */}
      {/* QR Modal */}
      <ReactModal
        isOpen={isQRModalOpen}
        onRequestClose={closeModal}
        contentLabel="Código QR"
        className="qr-modal"
        overlayClassName="overlay"
      >
        <h3 className="window-title">Código QR para el objeto seleccionado:</h3>
        {selectedQR && <img src={selectedQR} alt="QR Code" className="qr-image" />}
        <button onClick={closeModal} className="modal-btn">Cerrar</button>
      </ReactModal>

      {/* Edit Modal */}
      <ReactModal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Editar/Borrar Producto"
        className="edit-modal"
        overlayClassName="overlay"
      >
        <h3 className="window-title">Editar Producto</h3>
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="Nombre del producto"
        />
        <select
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
        >
          <option value="">Seleccione el tipo de producto</option>
          <option value="Dispositivo electrónico">Dispositivo electrónico</option>
          <option value="Mochila">Mochila</option>
          <option value="Recipiente de comida">Recipiente de comida</option>
          <option value="Recipiente de bebida">Recipiente de bebida</option>
          <option value="Objeto personal">Objeto personal</option>
          <option value="Otros">Otros</option>
        </select>

        <button onClick={handleUpdateProduct} className="modal-btn">Actualizar</button>
        <button onClick={handleDeleteProduct} className="modal-btn delete-btn red-btn">Eliminar</button>
        <button onClick={closeEditModal} className="modal-btn cancel-btn">Cancelar</button>
      </ReactModal>

      {/* Report Modal */}
      <ReactModal
        isOpen={isReportModalOpen}
        onRequestClose={() => setIsReportModalOpen(false)}
        contentLabel="Detalles del Reporte"
        className="report-modal"
        overlayClassName="overlay"
      >
        <h3 className="window-title">Detalles del Reporte</h3>
        {selectedReport ? (
          <div>
            <p><strong>Fecha del reporte:</strong> {new Date(selectedReport.ReportDate).toLocaleString()}</p>
            {selectedReport.Location && selectedReport.Location.includes(',') ? (
              <p>
                <strong>Ubicación:</strong>{' '}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.Location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Google Maps
                </a>
              </p>
            ) : (
              <p><strong>Ubicación:</strong> {selectedReport.Location || 'No disponible'}</p>
            )}
            {selectedReport.LocationNote && (
              <p><strong>Nota adicional:</strong> {selectedReport.LocationNote}</p>
            )}
            <button onClick={() => setIsReportModalOpen(false)} className="modal-btn">Cerrar</button>
          </div>
        ) : (
          <p>Cargando detalles del reporte...</p>
        )}
      </ReactModal>

    </div>
  );
}

export default Dashboard;
