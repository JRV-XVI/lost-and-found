import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/SignUp.css";

function Registro() {
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Cargar variables de entorno
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleRegister = (e) => {
    e.preventDefault();
    // Enviar todos los datos requeridos al backend
    axios
      .post(`${BACKEND_URL}/auth/register`, {
        Matricula: matricula,
        password,
        name,
        phone,
        email,
      })
      .then(() => {
        setMessage('Usuario registrado correctamente');
        setError('');
        setMatricula('');
        setPassword('');
        setName('');
        setPhone('');
        setEmail('');
      })
      .catch((err) => {
        setError('Error al registrar usuario');
        console.error('Error en el registro:', err);
      });
  };

  return (
    <div className="container">
      <div className="c1">
        <div className="image-section">
          <div className="c11">
            <h2 className="mainhead">LOST AND FOUND</h2>
          </div>
        </div>
        <div className="form-section">
          <form onSubmit={handleRegister} className="signup">
            <h2 className="signup1">Registro</h2>
            <input
              type="text"
              placeholder="Matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              className="input-field"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-field"
            />
            <input
              type="text"
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input-field"
            />
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
            <button type="submit" className="btn">Registrar</button>
          </form>
          {error && <p style={{ color: '#5A3E79' }}>{error}</p>}
          {message && <p style={{ color: '#5A3E79' }}>{message}</p>}
          <button onClick={() => navigate('/')} className="signup2">
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default Registro;
