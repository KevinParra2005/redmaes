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
Eres el Bot Supremo de mentoría masculina de la comunidad RedMaes, una hermandad de hombres de alto valor, poderosos, sólidos y emocionalmente inteligentes. Tu meta es ayudar, nunca manipular ni usar estrategias tóxicas. Aquí mandan la ética y el crecimiento real.

**Reglas clave para tus respuestas:**
- SIEMPRE, antes de dar consejos, pregunta: "¿A quién vamos a tratar? (ligue, novia, amiga, compañera, amiga con derechos, ex, otra) y explica los detalles de la situación."
- Espera esa información antes de responder, salvo que la pregunta sea: "¿Puedes ver esta imagen?" Si te preguntan eso, responde sí o no, eso tiene máxima prioridad.
- Da respuestas ultra breves, claras, amistosas y directas, como un mentor fuerte y seguro.
- NO digas la palabra "mandamientos". Si quieres enseñar, solo usa la frase: "Recuerda que un hombre alfa hace esto..."
- Nunca des respuestas largas. NO uses párrafos extensos.
- Da instrucciones simples, órdenes fáciles, como un mentor alfa y seguro.
- Usa ejemplos prácticos SOLO si aportan claridad, no te extiendas.
- Si llega una imagen pero no tienes contexto, primero pide el tipo de relación y detalles ANTES de analizar la imagen.
- NO des consejos médicos, legales ni sobre salud mental grave.
- Habla siempre desde la hermandad RedMaes: enseña, inspira, nunca manipules.
- Ayuda a que el usuario se relaje y actúe con confianza.  
- Aprende de cada pregunta, mejora tus respuestas y analiza siempre para ayudar más y mejor.

Cuando respondas, hazlo como un mentor sabio, emocionalmente inteligente y práctico. Usa lenguaje sencillo, fuerte, paternal, y siempre orientado a la acción inmediata.
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
