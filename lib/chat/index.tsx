"use client";

import { useState } from "react";

export default function ChatComponent() {
  const [message, setMessage] = useState(""); // Input do usuário
  const [response, setResponse] = useState(""); // Resposta gerada
  const [isStreaming, setIsStreaming] = useState(false); // Estado do streaming

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResponse(""); // Limpa a resposta anterior
    setIsStreaming(true); // Inicia o estado de streaming

    const response = await fetch("/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const reader = response.body?.getReader();
    if (!reader) {
      setIsStreaming(false);
      return;
    }
    const decoder = new TextDecoder("utf-8");

    let result = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      setResponse((prev) => prev + chunk); // Atualiza a resposta no estado
    }

    setIsStreaming(false); // Finaliza o estado de streaming
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1>Chat com Streaming</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Digite sua mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button
          type="submit"
          disabled={isStreaming}
          style={{
            padding: "10px 20px",
            cursor: isStreaming ? "not-allowed" : "pointer",
          }}
        >
          {isStreaming ? "Gerando..." : "Enviar"}
        </button>
      </form>
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2>Resposta:</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {response || "Aguardando resposta..."}
        </p>
      </div>
    </div>
  );
}
