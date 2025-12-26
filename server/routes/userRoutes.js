// routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// Ruta para obtener los teléfonos de los usuarios
router.get('/phones', userController.getPhones);

// Ruta para enviar un mensaje
router.post("/send-message", userController.sendMessageToUser);

// Ruta para obtener el perfil del usuario
router.get('/profile', userController.getUserProfile);

// Ruta para actualizar el perfil del usuario
router.put('/profile', userController.updateUserProfile);

// Ruta para desactivar la cuenta del usuario
router.post('/deactivate', userController.deactivateUser);

// **Añadir las rutas para 'locatel'**

router.get('/locatel', userController.getLocatecUsers);

router.put('/locatel/:matricula/status', userController.updateUserStatus);
// **Nueva Ruta para crear un usuario locatel**
router.post('/locatel', userController.createLocatecUser);

router.get('/top-points', userController.getTopUsersByPoints);

module.exports = router;
