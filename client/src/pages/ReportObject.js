// ReportObject.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../styles/ReportObject.css";

function ReportObject() {
  const { objectId } = useParams();
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [reporterMatricula, setReporterMatricula] = useState(null);
  const [location, setLocation] = useState('');
  
  // Cargar URL del backend desde variables de entorno
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const matricula = localStorage.getItem('userMatricula');
    setReporterMatricula(matricula || null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude},${longitude}`;
          setLocation(locationString);
          console.log("Ubicación obtenida:", locationString);
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
          setLocation("Ubicación no disponible");
        },
        {
          enableHighAccuracy: true, // Activar mayor precisión
          timeout: 10000, // 10 segundos de espera máxima
          maximumAge: 0 // Solicitar siempre nueva ubicación
        }
      );
    } else {
      setLocation("Geolocalización no soportada");
    }
  }, []);

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const reportData = {
        ObjectID: objectId,
        Location: location,
        ExtraMessage: message,
      };

      if (reporterMatricula) {
        reportData.ReporterMatricula = reporterMatricula;
      }

      console.log("Datos del reporte que se enviarán:", reportData);

      await axios.post(`${BACKEND_URL}/api/report`, reportData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStatusMessage('Reporte enviado exitosamente');
      setMessage('');
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      setStatusMessage('Error al enviar el reporte');
    }
  };

  return (
    <div className="report-container">
      <h2 className="report-title">Reportar objeto encontrado</h2>
      <p className="report-description">Gracias por reportar el objeto. Puedes añadir una nota adicional si lo deseas:</p>

      <form onSubmit={handleReportSubmit} className="report-form">
        <textarea
          placeholder="Agregar una nota (opcional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="4"
          className="report-textarea"
        />
        <button type="submit" className="report-btn">Enviar reporte</button>
      </form>

      {statusMessage && <p className="report-status">{statusMessage}</p>}
    </div>
  );
}

export default ReportObject;
