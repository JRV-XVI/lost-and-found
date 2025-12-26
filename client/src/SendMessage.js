import React, { useState } from "react";
import axios from "axios";
import "./styles/SendMessage.css";

function SendMessage() {
  const [matricula, setMatricula] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    try {
      // Usar la variable de entorno REACT_APP_BACKEND_URL
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
      const result = await axios.post(`${backendUrl}/api/messages/send-message`, { matricula });
      setResponse(result.data.message);
    } catch (error) {
      setResponse(error.response?.data?.message || "Error al enviar mensaje");
    }
  };

  return (
    <div className="container-message">
      <div className="message-section">
        <h1 className="message-title">Enviar Mensaje de WhatsApp</h1>
        <input
          type="text"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          placeholder="Ingresa la matrícula"
          className="input-message"
        />
        <button onClick={sendMessage} className="btn-message">
          Enviar Mensaje
        </button>
        {response && <p className="response-message">{response}</p>}
      </div>
    </div>
  );
}

export default SendMessage;
