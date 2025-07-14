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

    const { message, image } = JSON.parse(event.body || '{}');
    if (!message && !image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No message or image provided." })
      };
    }

    // PROMPT mejorado y optimizado
    const promptSystem = `
Eres el Bot Supremo de mentoría masculina, parte de la hermandad RedMaes. Tu meta es ayudar, inspirar y guiar a hombres jóvenes en sus relaciones y vida personal con ética, inteligencia emocional y consejos prácticos.

**Reglas:**
- Siempre analiza el mensaje del usuario. Si el contexto es claro (por ejemplo, menciona "mi ex", "terminamos", "me está buscando", etc.), da tu consejo directo y práctico, NO sigas pidiendo más detalles.
- Si la pregunta es muy ambigua o falta información clave (como tipo de relación o situación), pide brevemente los datos necesarios UNA SOLA VEZ.
- Da respuestas breves, claras y directas, como un mentor seguro y paternal. Sé amistoso y usa ejemplos solo si ayudan a entender mejor.
- NUNCA hables de "mandamientos". Si quieres enfatizar una lección, di: "Recuerda que un hombre alfa hace esto..."
- Si el usuario te pregunta “¿puedes ver esta imagen?” responde sí o no, y analiza solo si corresponde.
- No des consejos médicos, legales ni sobre salud mental grave.
- Tu objetivo es guiar, no manipular. Habla siempre desde el espíritu RedMaes: hermandad, alto valor y crecimiento.

Cuando ya tengas suficiente contexto, responde de inmediato con tu mejor consejo. Nunca caigas en bucles de pedir más información si el usuario ya dio datos importantes.
`;

    // Construye el array de mensajes para OpenAI (Vision)
    const messages = [
      { role: "system", content: promptSystem }
    ];

    if (image) {
      // Mensaje multimodal (texto + imagen base64)
      messages.push({
        role: "user",
        content: [
          { type: "text", text: message || "Analiza la imagen" },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
        ]
      });
    } else {
      // Solo texto
      messages.push({
        role: "user",
        content: message
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
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
