// controllers/userController.js
const db = require('../config/db'); // Asegúrate de que esta ruta sea correcta
const sendMessage = require("../../whatsapp-api/sendMessageBot");

exports.getPhones = (req, res) => {
  db.query('SELECT * FROM Users', (err, results) => {
    if (err) {
      console.error('Error en la consulta SQL:', err); // Log para obtener detalles del error
      return res.status(500).json({ message: 'Error al obtener los teléfonos' });
    }
    const users = results.map(user => ({
      name: user.Name,
      phone: user.Phone
    }));
    res.json(users); // Devuelve solo los teléfonos
  });
};


exports.sendMessageToUser = async (req, res) => {
  const { matricula, message } = req.body; // Usamos Matricula en lugar de userId

  if (!matricula || !message) {
    return res.status(400).json({ message: "Matrícula y mensaje son requeridos" });
  }

  try {
    // Buscar el número de teléfono del usuario en la base de datos
    db.query("SELECT Phone FROM Users WHERE Matricula = ?", [matricula], async (err, results) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        return res.status(500).json({ message: "Error al buscar el usuario" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const phone = results[0].Phone;

      // Enviar mensaje usando Twilio
      try {
        const sentMessage = await sendMessage(phone, message);
        res.json({ message: "Mensaje enviado", sid: sentMessage.sid });
      } catch (error) {
        res.status(500).json({ message: "Error al enviar el mensaje", error });
      }
    });
  } catch (error) {
    console.error("Error en el controlador:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener el perfil del usuario
exports.getUserProfile = (req, res) => {
  console.log('Entrando a getUserProfile');

  // Obtener 'matricula' de los parámetros de consulta o del cuerpo de la solicitud
  const matricula = req.query.matricula || req.body.matricula;

  console.log('Matrícula recibida:', matricula);

  if (!matricula) {
    console.log('Matrícula no proporcionada');
    return res.status(400).send('Matrícula es requerida');
  }

  db.query(
    'SELECT Matricula, Name, Email, Phone, Status FROM Users WHERE Matricula = ?',
    [matricula],
    (err, results) => {
      if (err) {
        console.error('Error al obtener el perfil del usuario:', err);
        return res.status(500).send('Error al obtener el perfil del usuario');
      }
      if (results.length === 0) {
        return res.status(404).send('Usuario no encontrado');
      }
      console.log('Perfil del usuario obtenido:', results[0]);
      res.json(results[0]);
    }
  );
};

// Actualizar el perfil del usuario
exports.updateUserProfile = (req, res) => {
  console.log('Entrando a updateUserProfile');

  // Obtener 'matricula' de los parámetros de consulta o del cuerpo de la solicitud
  const matricula = req.query.matricula || req.body.matricula;
  const { Name, Email, Phone } = req.body;

  console.log('Matrícula recibida:', matricula);
  console.log('Datos recibidos para actualizar:', { Name, Email, Phone });

  // Validar los datos recibidos
  if (!matricula || !Name || !Email || !Phone) {
    console.log('Faltan campos requeridos');
    return res.status(400).send('Matrícula, Nombre, Correo Electrónico y Teléfono son obligatorios');
  }

  db.query(
    'UPDATE Users SET Name = ?, Email = ?, Phone = ? WHERE Matricula = ?',
    [Name, Email, Phone, matricula],
    (err) => {
      if (err) {
        console.error('Error al actualizar el perfil del usuario:', err);
        return res.status(500).send('Error al actualizar el perfil del usuario');
      }

      // Devolver los datos actualizados
      db.query(
        'SELECT Matricula, Name, Email, Phone, Status FROM Users WHERE Matricula = ?',
        [matricula],
        (err, results) => {
          if (err) {
            console.error('Error al obtener el perfil del usuario:', err);
            return res.status(500).send('Error al obtener el perfil del usuario');
          }
          console.log('Perfil del usuario actualizado:', results[0]);
          res.json(results[0]);
        }
      );
    }
  );
};

// Desactivar la cuenta del usuario
exports.deactivateUser = (req, res) => {
  console.log('Entrando a deactivateUser');

  // Obtener 'matricula' de los parámetros de consulta o del cuerpo de la solicitud
  const matricula = req.query.matricula || req.body.matricula;

  console.log('Matrícula recibida:', matricula);

  if (!matricula) {
    console.log('Matrícula no proporcionada');
    return res.status(400).send('Matrícula es requerida');
  }

  db.query(
    'UPDATE Users SET Status = "inactivo" WHERE Matricula = ?',
    [matricula],
    (err) => {
      if (err) {
        console.error('Error al desactivar el usuario:', err);
        return res.status(500).send('Error al desactivar el usuario');
      }

      console.log('Usuario desactivado:', matricula);
      res.json({ message: 'Usuario desactivado exitosamente' });
    }
  );
};

// Obtener usuarios con UserType 'locatel'
exports.getLocatecUsers = (req, res) => {
  db.query(
    "SELECT Matricula, Name, Email, Phone, Points, Status FROM Users WHERE UserType = 'locatel'",
    (err, results) => {
      if (err) {
        console.error('Error al obtener usuarios locatel:', err);
        return res.status(500).json({ message: 'Error al obtener los usuarios locatel' });
      }
      res.json(results);
    }
  );
};

// Actualizar el estado de un usuario locatel
exports.updateUserStatus = (req, res) => {
  const { matricula } = req.params;
  const { Status } = req.body;

  // Validar el nuevo estado
  if (!['activo', 'inactivo'].includes(Status)) {
    return res.status(400).json({ message: 'Estado inválido. Debe ser "activo" o "inactivo".' });
  }

  db.query(
    "UPDATE Users SET Status = ? WHERE Matricula = ?",
    [Status, matricula],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar el estado del usuario:', err);
        return res.status(500).json({ message: 'Error al actualizar el estado del usuario' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
      res.json({ message: 'Estado del usuario actualizado correctamente.' });
    }
  );
};  

exports.createLocatecUser = (req, res) => {
  const { Matricula, Name, Email, Phone } = req.body;

  // Validar los datos recibidos
  if (!Matricula || !Name || !Email || !Phone) {
    return res.status(400).json({ message: 'Matricula, Name, Email y Phone son requeridos.' });
  }

  // Insertar el nuevo usuario en la base de datos con UserType 'locatel' y Status 'activo'
  const query = 'INSERT INTO Users (Matricula, Name, Email, Phone, UserType, Status) VALUES (?, ?, ?, ?, "locatel", "activo")';
  db.query(query, [Matricula, Name, Email, Phone], (err, results) => {
    if (err) {
      console.error('Error al crear el usuario locatel:', err);
      return res.status(500).json({ message: 'Error al crear el usuario locatel.' });
    }

    res.status(201).json({ message: 'Usuario locatel creado exitosamente.' });
  });
};

exports.getTopUsersByPoints = (req, res) => {
  const query = `
    SELECT Matricula, Name, Email, Phone, Points 
    FROM Users 
    ORDER BY Points DESC 
    LIMIT 5
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener las 5 matrículas con más puntos:', err);
      return res.status(500).json({ message: 'Error al obtener los datos.' });
    }

    res.json(results);
  });
};
