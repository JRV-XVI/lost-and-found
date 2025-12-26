// server.js

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const users = require('./routes/users');
const messageRoutes = require('./routes/messageRoutes');
const objectRoutes = require('./routes/objectRoutes'); // <--- Añadir esta línea
require('dotenv').config({ path: '../.env' }); // Cargar variables de entorno correctamente

const app = express();

// Configuración de CORS para permitir múltiples orígenes
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para analizar JSON
app.use(express.json());

// Verificar rutas importadas
try {
  // Rutas de autenticación
  app.use('/auth', authRoutes);
  console.log('Ruta /auth configurada correctamente.');

  // Rutas de productos
  app.use('/api', productRoutes);
  console.log('Ruta /api configurada correctamente.');

  // Rutas de usuarios
  app.use('/api/users', userRoutes);
  console.log('Ruta /api/users configurada correctamente.');



  // Rutas de mensajes
  app.use('/api/messages', messageRoutes);
  console.log('Ruta /api/messages configurada correctamente.');

  // Usar las rutas de objetos
  app.use('/api', objectRoutes); // <--- Usar objectRoutes aquí
  console.log('Ruta /api/objetos configurada correctamente.');

} catch (error) {
  console.error('Error al configurar las rutas:', error.message);
  process.exit(1); // Detener el servidor si ocurre un error
}

// Configuración del puerto
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
