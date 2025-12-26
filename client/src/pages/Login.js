import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/SignIn.css";

function Login({ setIsLoggedIn, setUserType }) {
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cargar variables de entorno
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Verificar si el usuario ya está logueado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userType = localStorage.getItem('userType'); // Asegúrate de usar 'userType'
      // Redirigir según tipo
      if (userType === 'admin') {
        navigate('/admin-dashboard');
      } else if (userType === 'locatel') {
        navigate('/locatec-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  // Función para manejar el login
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(`${BACKEND_URL}/auth/login`, { Matricula: matricula, password })
      .then((response) => {
        const { token, matricula, userType } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userMatricula', matricula);
        localStorage.setItem('userType', userType);
        setIsLoggedIn(true);
        setUserType(userType); // Actualizar el estado de userType

        // Redirigir según el tipo de usuario
        if (userType === 'admin') {
          navigate('/admin-dashboard');
        } else if (userType === 'locatel') {
          navigate('/locatec-dashboard');
        } else {
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        setError('Matrícula o contraseña incorrectos');
        console.error('Error en el login:', err);
      });
  };

  return (
    <div className="container">
      <div className="c1">
        <div className="image-section">
          <div className="c11">
            <h1 className="mainhead">LOST AND FOUND</h1>
          </div>
        </div>
        <div className="form-section">
          <div className="c2">
            <form className="signin" onSubmit={handleLogin}>
              <h1 className="signin1">Iniciar sesión</h1>
              <input
                type="text"
                placeholder="Matrícula*"
                className="username"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña*"
                className="username"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn">Inicia aquí</button>
              {error && <p style={{ color: '#5A3E79' }}>{error}</p>}
              <button
                type="button"
                onClick={() => navigate('/registro')}
                className="signin2"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
