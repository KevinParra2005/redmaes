const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No OpenAI API key in environment variables." })
      };
    }

    const { message } = JSON.parse(event.body || '{}');
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No message provided." })
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // O puedes usar "gpt-3.5-turbo" si solo tienes acceso a ese modelo.
        messages: [
          { role: "system", content: "Eres un mentor experimentado." },
          { role: "user", content: message }
        ],
        max_tokens: 200
      })
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error.message })
      };
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "Sin respuesta";
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al conectar con OpenAI" })
    };
  }
};
