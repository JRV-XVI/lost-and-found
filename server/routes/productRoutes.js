const express = require('express');
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rutas para la gestión de productos
router.post('/product', productController.addProduct);
router.get('/products/:matricula', productController.getProductsByUser);
router.put('/product/:id', productController.updateProduct);
router.delete('/product/:id', productController.deleteProduct);

// Rutas para reportes y estadísticas
router.post('/report', productController.createReport);
router.get('/stats/:matricula', productController.getUserStats); // Ajustado para coincidir con el frontend
router.get('/object-reports/:matricula', productController.getObjectReports); // Ajustado para coincidir con el frontend

// Nueva ruta para obtener los objetos con estado "perdido"
router.get('/objects/lost', productController.getLostObjects);

// Endpoint para obtener todos los objetos
router.get('/objects/all', verifyAdmin, productController.getAllObjects);

// Endpoint para estadísticas
router.get('/objects/stats', verifyAdmin, productController.getObjectsStats);

router.get('/product/:id/last-report', productController.getLastReportByProduct);


module.exports = router;

