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

    // ¡Ahora recibimos message y opcionalmente image!
    const { message, image } = JSON.parse(event.body || '{}');

    if (!message && !image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No message or image provided." })
      };
    }

    // Tu prompt system igual...
    const promptSystem = `
PROMPT PARA CHATGPT
... (tu prompt largo, igual que antes)
    `;

    // Si hay imagen, mandamos a GPT-4o Vision (con imagen); si no, solo texto
    let apiMessages;
    if (image) {
      apiMessages = [
        { role: "system", content: promptSystem },
        {
          role: "user",
          content: [
            { type: "text", text: message || "Analiza la imagen enviada." },
            {
              type: "image_url",
              image_url: { "url": `data:image/png;base64,${image}` }
            }
          ]
        }
      ];
    } else {
      apiMessages = [
        { role: "system", content: promptSystem },
        { role: "user", content: message }
      ];
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // o "gpt-4-vision-preview"
        messages: apiMessages,
        max_tokens: 600
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
