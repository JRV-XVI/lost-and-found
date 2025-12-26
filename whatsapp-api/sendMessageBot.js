// whatsapp-api/sendMessageBot.js

const twilio = require("twilio");
const db = require("../server/config/db");
require('dotenv').config({ path: '../.env' }); // Asegúrate de que la ruta es correcta

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Función original que acepta matrícula y envía un mensaje predeterminado
async function sendMessage(matricula) {
  try {
    const query = "SELECT Phone FROM Users WHERE Matricula = ?";
    const [rows] = await db.promise().query(query, [matricula]);

    if (rows.length === 0) {
      throw new Error("Matrícula no encontrada");
    }

    let phone = rows[0].Phone;
    let formattedPhone = phone;

    // Asegúrate de agregar +521 si el teléfono no tiene ese prefijo
    if (!formattedPhone.startsWith('+521')) {
      formattedPhone = `+521${formattedPhone}`;
    }

    console.log(`Número formateado: ${formattedPhone}`); // Verifica que el número sea correcto

    const messageBody = "¡Hola! Este es un mensaje automático.";

    const message = await client.messages.create({
      body: messageBody,
      from: "whatsapp:+14155238886", // Número Twilio
      to: `whatsapp:${formattedPhone}`, // Número con el formato adecuado
    });

    console.log(`Mensaje enviado a ${formattedPhone}: ${message.body}`);
    return { success: true, message: `Mensaje enviado a ${formattedPhone}` };
  } catch (error) {
    console.error("Error al enviar mensaje:", error.message);
    return { success: false, error: error.message };
  }
}

// Nueva función que acepta un número de teléfono y un mensaje personalizado
async function sendMessageToPhone(phone, messageBody) {
  try {
    let formattedPhone = phone;

    // Asegúrate de agregar +521 si el teléfono no tiene ese prefijo
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+521${formattedPhone}`;
    }

    console.log(`Número formateado: ${formattedPhone}`); // Verifica que el número sea correcto

    const message = await client.messages.create({
      body: messageBody,
      from: "whatsapp:+14155238886", // Número Twilio
      to: `whatsapp:${formattedPhone}`, // Número con el formato adecuado
    });

    console.log(`Mensaje enviado a ${formattedPhone}: ${message.body}`);
    return { success: true, message: `Mensaje enviado a ${formattedPhone}` };
  } catch (error) {
    console.error("Error al enviar mensaje:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendMessage, sendMessageToPhone };
