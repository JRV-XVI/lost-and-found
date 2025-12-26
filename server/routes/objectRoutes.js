const express = require('express');
const objectController = require('../controllers/objectController');
const router = express.Router();

// Log para verificar las funciones importadas
console.log('objectController en objectRoutes:', {
  getLostObjects: typeof objectController.getLostObjects,
  entregarObjeto: typeof objectController.entregarObjeto
});

// Ruta para obtener objetos perdidos
router.get('/objects/status-lost', objectController.getLostObjects);

// Ruta para la acción "Entregar"
router.post('/objects/entregar', objectController.entregarObjeto);

module.exports = router;
