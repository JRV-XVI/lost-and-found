import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AltaProducto.css"



function AltaProducto() {
  const [name, setName] = useState(''); // Nombre del producto
  const [type, setType] = useState('Dispositivo electrónico'); // Tipo predeterminado
  const [matricula, setMatricula] = useState(''); // Matrícula dinámica
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // URL del backend desde el entorno
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Obtener la matrícula del token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el JWT
      setMatricula(payload.matricula); // Asigna la matrícula desde el payload
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Datos del producto con Status fijo en 'encontrado'
    const productData = {
      matricula: matricula,
      Name: name,
      Status: 'encontrado',
      Type: type
    };

    // Llamada al backend para almacenar el producto
    axios.post(`${BACKEND_URL}/api/product`, productData)
      .then(response => {
        setMessage('Producto registrado correctamente');
        setError('');
        setName('');
        setType('Dispositivo electrónico');
      })
      .catch(err => {
        setError('Error al registrar el producto');
        setMessage('');
        console.error('Error al registrar el producto:', err);
      });
  };

  return (
    <div className="container">
      <div className="c1">
        <div className="form-section">
          <h2 className="form-title">Alta de Producto</h2>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field1"
            />
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              required 
              className="input-field2"
            >
              <option value="Dispositivo electrónico">Dispositivo electrónico</option>
              <option value="Mochila">Mochila</option>
              <option value="Recipiente de comida">Recipiente de comida</option>
              <option value="Recipiente de bebida">Recipiente de bebida</option>
              <option value="Objeto personal">Objeto personal</option>
              <option value="Otros">Otros</option>
            </select>
            <button type="submit" className="btn">Registrar Producto</button>
          </form>
          {message && <p className="green">{message}</p>}
          {error && <p className="red">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default AltaProducto;
