// routes/users.js

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Asegúrate de tener una conexión a la base de datos

// Middleware para verificar si el usuario es admin
const verifyAdmin = (req, res, next) => {
  // Implementa tu lógica de autenticación y verificación de roles aquí
  // Por ejemplo, verifica el token y el userType
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado.' });
  }
};

// Obtener usuarios con UserType 'locatel'
router.get('/locatel', verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT Matricula, Name, Email, Phone, Points, Status FROM Users WHERE UserType = 'locatel'");
    res.json(rows);
  } catch (err) {
    console.error('Error fetching locatec users:', err);
    res.status(500).json({ message: 'Error al obtener los usuarios.' });
  }
});

// Actualizar el estado de un usuario
router.put('/:matricula/status', verifyAdmin, async (req, res) => {
  const { matricula } = req.params;
  const { Status } = req.body;

  if (!['activo', 'inactivo'].includes(Status)) {
    return res.status(400).json({ message: 'Estado inválido.' });
  }

  try {
    const [result] = await db.promise().query("UPDATE Users SET Status = ? WHERE Matricula = ?", [Status, matricula]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Estado del usuario actualizado correctamente.' });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ message: 'Error al actualizar el estado del usuario.' });
  }
});

module.exports = router;
