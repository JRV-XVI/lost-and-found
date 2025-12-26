// productController.js

const db = require('../config/db');
const { sendMessageToPhone } = require('../../whatsapp-api/sendMessageBot'); // Importar la función para enviar mensajes

// Función para agregar un producto
exports.addProduct = (req, res) => {
  const { matricula, Name, Status, Type } = req.body;

  if (!matricula || !Name || !Type) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  db.query(
    'INSERT INTO Objects (Matricula, Name, Status, Type) VALUES (?, ?, ?, ?)',
    [matricula, Name, Status || 'encontrado', Type],
    (err) => {
      if (err) {
        console.error('Error al agregar el producto:', err);
        return res.status(500).send('Error al agregar el producto');
      }
      res.send('Producto agregado correctamente');
    }
  );
};

// Función para obtener productos de un usuario (excluyendo los inactivos)
exports.getProductsByUser = (req, res) => {
  const { matricula } = req.params;

  if (!matricula) {
    return res.status(400).send('La matrícula es requerida');
  }

  db.query(
    'SELECT * FROM Objects WHERE Matricula = ? AND Status != ?',
    [matricula, 'inactivo'],
    (err, results) => {
      if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).send('Error al obtener productos');
      }
      res.json(results);
    }
  );
};


// Función para actualizar el producto
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { Name, Type } = req.body;

  if (!Name || !Type) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  db.query(
    'UPDATE Objects SET Name = ?, Type = ? WHERE id = ?',
    [Name, Type, id],
    (err) => {
      if (err) {
        console.error('Error al actualizar el producto:', err);
        return res.status(500).send('Error al actualizar el producto');
      }
      res.send('Producto actualizado correctamente');
    }
  );
};

// Función para "eliminar" el producto (cambiar su estado a 'inactivo')
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('El ID del producto es requerido');
  }

  db.query(
    'UPDATE Objects SET Status = ? WHERE id = ?',
    ['inactivo', id],
    (err) => {
      if (err) {
        console.error('Error al desactivar el producto:', err);
        return res.status(500).send('Error al desactivar el producto');
      }
      res.send('Producto desactivado correctamente');
    }
  );
};


// Función para crear un reporte cuando un usuario escanea el código QR
exports.createReport = (req, res) => {
  const { ObjectID, ReporterMatricula, Location, NotifySecurity, ExtraMessage } = req.body;

  if (!ObjectID) {
    return res.status(400).send('ObjectID es requerido');
  }

  db.query(
    'INSERT INTO ObjectReports (ObjectID, ReporterMatricula, Location, NotifySecurity, LocationNote) VALUES (?, ?, ?, ?, ?)',
    [ObjectID, ReporterMatricula || null, Location || null, NotifySecurity || false, ExtraMessage || null],
    (err, result) => {
      if (err) {
        console.error('Error al crear el reporte:', err);
        return res.status(500).send('Error al crear el reporte');
      }

      // **Nuevo código para actualizar el estado del objeto a 'perdido'**
      db.query(
        'UPDATE Objects SET Status = ? WHERE id = ?',
        ['perdido', ObjectID],
        (err) => {
          if (err) {
            console.error('Error al actualizar el estado del objeto:', err);
          } else {
            console.log(`Estado del objeto con ID ${ObjectID} actualizado a 'perdido'`);
          }
        }
      );

      // Obtener el ID del reporte recién creado
      const reportId = result.insertId;

      // Obtener la matrícula y el nombre del dueño del objeto
      db.query('SELECT Matricula, Name FROM Objects WHERE id = ?', [ObjectID], (err, objectResults) => {
        if (err) {
          console.error('Error al obtener la matrícula del dueño:', err);
          return;
        }

        if (objectResults.length > 0) {
          const ownerMatricula = objectResults[0].Matricula;
          const objectName = objectResults[0].Name;

          // Obtener el número de teléfono del dueño
          db.query('SELECT Phone FROM Users WHERE Matricula = ?', [ownerMatricula], async (err, userResults) => {
            if (err) {
              console.error('Error al obtener el número de teléfono del dueño:', err);
              return;
            }

            if (userResults.length > 0) {
              const ownerPhone = userResults[0].Phone;

              // Obtener la ubicación y la nota adicional del reporte
              db.query('SELECT Location, LocationNote FROM ObjectReports WHERE id = ?', [reportId], async (err, reportResults) => {
                if (err) {
                  console.error('Error al obtener los detalles del reporte:', err);
                  return;
                }

                if (reportResults.length > 0) {
                  let location = reportResults[0].Location;
                  const extraMessage = reportResults[0].LocationNote;

                  // Formatear la ubicación si existe
                  if (location) {
                    const [latitude, longitude] = location.split(',');
                    location = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                  } else {
                    location = 'Ubicación no proporcionada';
                  }

                  // Construir el mensaje
                  let messageBody = `¡Hola! Alguien ha reportado haber encontrado tu objeto "${objectName}".\n\n`;

                  messageBody += `Ubicación: ${location}\n`;

                  if (extraMessage) {
                    messageBody += `\nNota: ${extraMessage}`;
                  }

                  messageBody += `\n\nPor favor, revisa la aplicación para más detalles.`;

                  // Enviar el mensaje de WhatsApp usando la función sendMessageToPhone
                  try {
                    const result = await sendMessageToPhone(ownerPhone, messageBody);
                    if (result.success) {
                      console.log(`Mensaje enviado al dueño: ${result.message}`);
                    } else {
                      console.error(`Error al enviar mensaje al dueño: ${result.error}`);
                    }
                  } catch (error) {
                    console.error('Error al enviar mensaje al dueño:', error.message);
                  }
                } else {
                  console.error('No se encontraron los detalles del reporte.');
                }
              });
            } else {
              console.error('No se encontró el número de teléfono del dueño.');
            }
          });
        } else {
          console.error('No se encontró el objeto con el ID proporcionado.');
        }
      });

      // Solo enviar notificación y otorgar puntos si hay ReporterMatricula
      if (ReporterMatricula) {
        sendNotification(ReporterMatricula, ObjectID);
        awardPoints(ReporterMatricula, !!ExtraMessage);
      }

      res.send('Reporte creado correctamente');
    }
  );
};

// Obtener estadísticas del usuario
exports.getUserStats = (req, res) => {
  const { matricula } = req.params;

  if (!matricula) {
    return res.status(400).send('La matrícula es requerida');
  }

  db.query(
    'SELECT Points FROM Users WHERE Matricula = ?',
    [matricula],
    (err, userResults) => {
      if (err) {
        console.error('Error al obtener estadísticas del usuario:', err);
        return res.status(500).send('Error al obtener estadísticas del usuario');
      }

      if (userResults.length === 0) {
        return res.status(404).send('Usuario no encontrado');
      }

      db.query(
        'SELECT COUNT(*) AS reportCount FROM ObjectReports WHERE ReporterMatricula = ?',
        [matricula],
        (err, reportResults) => {
          if (err) {
            console.error('Error al contar reportes:', err);
            return res.status(500).send('Error al contar reportes');
          }

          res.json({
            points: userResults[0]?.Points || 0,
            reportCount: reportResults[0]?.reportCount || 0,
          });
        }
      );
    }
  );
};

// Obtener reportes de los objetos del usuario
exports.getObjectReports = (req, res) => {
  const { matricula } = req.params;

  if (!matricula) {
    return res.status(400).send('La matrícula es requerida');
  }

  db.query(
    `SELECT r.id, o.Name, r.Location, r.ReportDate 
     FROM ObjectReports r
     JOIN Objects o ON r.ObjectID = o.id
     WHERE o.Matricula = ?`,
    [matricula],
    (err, results) => {
      if (err) {
        console.error('Error al obtener reportes:', err);
        return res.status(500).send('Error al obtener reportes');
      }
      res.json(results);
    }
  );
};

// Función auxiliar para enviar notificaciones
function sendNotification(ReporterMatricula, ObjectID) {
  if (!ReporterMatricula) {
    // Si no hay matrícula, no se envía la notificación
    return;
  }

  const message = `Tu reporte para el objeto con ID ${ObjectID} ha sido recibido. Gracias por tu ayuda.`;
  db.query(
    'INSERT INTO UserNotifications (UserMatricula, Message, Channel) VALUES (?, ?, ?)',
    [ReporterMatricula, message, 'app'],
    (err) => {
      if (err) {
        console.error('Error al enviar notificación:', err);
      } else {
        console.log('Notificación enviada exitosamente');
      }
    }
  );
}

// Función auxiliar para otorgar puntos
function awardPoints(ReporterMatricula, hasExtraMessage) {
  if (!ReporterMatricula) {
    // Si no hay matrícula, no se otorgan puntos
    return;
  }

  const points = hasExtraMessage ? 20 : 10;
  const description = hasExtraMessage
    ? 'Recompensa por reportar objeto perdido con mensaje adicional'
    : 'Recompensa por reportar objeto perdido';

  db.query(
    'INSERT INTO Rewards (Matricula, Points, Description) VALUES (?, ?, ?)',
    [ReporterMatricula, points, description],
    (err) => {
      if (err) {
        console.error('Error al otorgar puntos en Rewards:', err);
      }
    }
  );

  db.query(
    'UPDATE Users SET Points = Points + ? WHERE Matricula = ?',
    [points, ReporterMatricula],
    (err) => {
      if (err) {
        console.error('Error al actualizar puntos en Users:', err);
      }
    }
  );
}

// Obtener objetos con estado "perdido"
exports.getLostObjects = (req, res) => {
  db.query(
    `SELECT o.id, o.Name, o.Type, o.Status, u.Matricula 
     FROM Objects o
     JOIN Users u ON o.Matricula = u.Matricula
     WHERE o.Status = ?`,
    ['perdido'],
    (err, results) => {
      if (err) {
        console.error('Error al obtener objetos perdidos:', err);
        return res.status(500).send('Error al obtener objetos perdidos');
      }
      res.json(results);
    }
  );
};

// Obtener todos los objetos (excluyendo los inactivos)
exports.getAllObjects = (req, res) => {
  db.query(
    'SELECT * FROM Objects WHERE Status != ?',
    ['inactivo'],
    (err, results) => {
      if (err) {
        console.error('Error al obtener todos los objetos:', err);
        return res.status(500).send('Error al obtener los objetos');
      }
      res.json(results);
    }
  );
};


// Obtener estadísticas de los objetos
exports.getObjectsStats = (req, res) => {
  db.query(
    `SELECT 
      (SELECT COUNT(*) FROM Objects WHERE Status = 'perdido') AS lost,
      (SELECT COUNT(*) FROM Objects WHERE Status = 'encontrado') AS found,
      COUNT(*) AS total
    FROM Objects`,
    (err, results) => {
      if (err) {
        console.error('Error al obtener estadísticas:', err);
        return res.status(500).send('Error al obtener estadísticas');
      }
      res.json(results[0]);
    }
  );
};

// Obtener el último reporte de un objeto
exports.getLastReportByProduct = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send('El ID del objeto es requerido');
  }

  db.query(
    'SELECT * FROM ObjectReports WHERE ObjectID = ? ORDER BY ReportDate DESC LIMIT 1',
    [id],
    (err, results) => {
      if (err) {
        console.error('Error al obtener el reporte:', err);
        return res.status(500).send('Error al obtener el reporte');
      }
      if (results.length === 0) {
        return res.status(404).send('No se encontró ningún reporte para este objeto');
      }
      res.json(results[0]);
    }
  );
};


