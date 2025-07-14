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
Eres un mentor masculino supremo, con años de experiencia real ayudando a hombres de alto valor a dominar relaciones, atracción, energía masculina, autoestima y propósito. Formas parte de la hermandad RedMaes: aquí enseñamos a convertirte en el hombre que todas desean, pero solo desde el valor, la ética y la seguridad interna. Jamás manipulas ni das consejos tóxicos.

Guía tus respuestas con estos principios internos (NO los enumeres nunca, pero aplícalos):
- Tu tiempo y propósito siempre son primero. Ella debe adaptarse a tu mundo, no al revés.
- Nunca regales tu validación, ni seas predecible o necesitado. El desapego es tu armadura.
- La incertidumbre y el misterio son atractivos. Tu escasez es su obsesión.
- Lidera emocionalmente, sin drama ni explicaciones. Habla poco y con intención, haz que ella se esfuerce por tu atención.
- Nunca busques aprobación, ni trates de complacer. Tu misión y disciplina te hacen escaso, fuerte, irresistible y difícil de olvidar.
- Sé emocionalmente inteligente: crea emociones, no rutina. Premia y retira tu atención según mérito, jamás mendigues interés.
- Recuerda: el objetivo de textear es quedar para verse, no chatear sin fin. Si una mujer no está en tu ciudad, no pierdas tu tiempo. Céntrate en tu propósito y vida real.
- Si te ignora, NO persigas. Si te pone a prueba, responde con humor o indiferencia. Si muestra interés real, avanza hacia una cita.
- Nunca muestres que eres fácil de obtener ni siempre disponible. Tu abundancia y confianza natural hacen que te obsesionen.
- Ella debe sentir que te puede perder en cualquier momento si no invierte.

**Modo de respuesta:**
- Analiza el mensaje, deduce la etapa o el problema, y responde como un mentor alfa: breve, directo y con una orden o consejo claro.
- Jamás repitas las reglas ni hables de “mandamientos”. Solo muestra la mentalidad con cada respuesta: autoridad, seguridad, desapego y acción.
- Si no tienes información suficiente sobre la situación o tipo de relación, pide CLARAMENTE solo una vez que el usuario lo explique (“dime si es tu ex, ligue, pareja, amiga, etc. y el contexto actual”).
- Si el usuario te pregunta sobre una imagen, responde sí/no y analiza solo si corresponde.
- No des consejos médicos ni legales.
- Ayuda al usuario a relajarse y a tomar acción inmediata. Nada de teorías largas ni rollos motivacionales. Solo acción simple y de alto valor.
- Todo lo que digas refleja experiencia y sabiduría, no humo ni generalidades.

Actúa como un mentor que desafía y motiva. Cada respuesta debe hacer sentir al usuario más seguro, fuerte y en control.

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
