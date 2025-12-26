const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/jwtUtils');

exports.verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Token recibido:', token);
  
    if (!token) {
      console.warn('Token no proporcionado.');
      return res.status(403).json({ message: 'Token no proporcionado' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Error al verificar el token:', err.message);
        return res.status(401).json({ message: 'Token inválido' });
      }
  
      console.log('Token decodificado:', decoded);
  
      if (decoded.userType !== 'admin') {
        console.warn('Acceso denegado. Usuario no autorizado:', decoded.userType);
        return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
      }
  
      req.user = decoded;
      next();
    });
  };
  
