const db = require('../config/db'); // Importa la conexión a la base de datos
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Función para obtener objetos perdidos con `cardId`
exports.getLostObjects = (req, res) => {
    db.query(
      `SELECT o.id, o.Name, o.Type, o.Status, u.Matricula, u.cardId AS cardId
       FROM Objects o
       JOIN Users u ON o.Matricula = u.Matricula
       WHERE o.Status = ?`,
      ['perdido'], // Parámetros para la consulta
      (err, results) => {
        if (err) {
          console.error('Error al obtener objetos perdidos:', err);
          return res.status(500).json({ message: 'Error al obtener objetos perdidos.' });
        }
        console.log('Objetos perdidos obtenidos:', results);
        res.json(results); // Devuelve los resultados al frontend
      }
    );
  };

  

// Función para manejar la acción "Entregar"
exports.entregarObjeto = async (req, res) => {
    const { cardId, objectId } = req.body;
  
    console.log('Datos recibidos para entregar el objeto:', { cardId, objectId });
  
    // Validar cardId y objectId
    if (!cardId || !objectId) {
      return res.status(400).json({ message: 'cardId y objectId son requeridos.' });
    }
  
    try {
      // Escribir en data.txt
      const dataFilePath = path.join(__dirname, '../data.txt');
      const dataContent = `${cardId}\n${objectId}`;
      await fs.promises.writeFile(dataFilePath, dataContent, 'utf8');
      console.log('Archivo data.txt actualizado correctamente.');
  
      // Ruta al script de Python y entorno virtual
      const envActivatePath = path.join(__dirname, '../env/bin/activate');
      const checkScriptPath = path.join(__dirname, '../check.py');
  
      // Comando para activar el entorno virtual y ejecutar el script de Python
      const command = `source ${envActivatePath} && python3 ${checkScriptPath}`;
  
      exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al ejecutar check.py: ${error.message}`);
          return res.status(500).json({ message: 'Error al ejecutar el script de verificación.' });
        }
  
        if (stderr) {
          console.warn(`Advertencias de check.py: ${stderr}`);
        }
  
        console.log(`Salida de check.py: ${stdout}`);
        res.status(200).json({ message: 'Objeto entregado y script ejecutado correctamente.' });
      });
    } catch (error) {
      console.error('Error al procesar la entrega:', error);
      res.status(500).json({ message: 'Error al procesar la entrega.' });
    }
  };