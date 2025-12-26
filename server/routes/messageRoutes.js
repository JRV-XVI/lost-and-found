// routes/messageRoutes.js

const express = require("express");
const { sendMessage, sendMessageToPhone } = require("../../whatsapp-api/sendMessageBot");
const router = express.Router();

// Ruta existente que acepta matrícula
router.post("/send-message", async (req, res) => {
  const { matricula } = req.body;

  if (!matricula) {
    return res.status(400).json({ message: "Matrícula es requerida" });
  }

  try {
    const result = await sendMessage(matricula);
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: "Error interno al enviar mensaje" });
  }
});

// Nueva ruta que acepta número de teléfono y mensaje personalizado
router.post("/send-message-phone", async (req, res) => {
  const { phone, messageBody } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Número de teléfono es requerido" });
  }

  try {
    const result = await sendMessageToPhone(phone, messageBody || "¡Hola! Este es un mensaje automático.");
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(500).json({ message: result.error });
    }
  } catch (error) {
    console.error('Error interno al enviar mensaje:', error.message);
    res.status(500).json({ message: "Error interno al enviar mensaje" });
  }
});

module.exports = router;
