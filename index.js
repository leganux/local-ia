const readline = require('readline');
const axios = require('axios');
const { log } = require('console');

// Crear la interfaz para leer entradas de la terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para hacer la solicitud de stream y manejar las respuestas
async function interact() {
    // Capturar la entrada del usuario desde la terminal
    rl.question('Escribe tu mensaje: ', async (userMessage) => {
        const raw = {
            "messages": [
                {
                    "content": "You are an expert on health",
                    "role": "system"
                },
                {
                    "content": userMessage, // Mensaje del usuario
                    "role": "user"
                }
            ],
            "model": "llama3.2-3b-instruct",
            "stream": true,
            "max_tokens": 2048,
            "stop": ["hello"],
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "temperature": 0.7,
            "top_p": 0.95
        };

        const requestOptions = {
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'stream'
        };

        try {
            const response = await axios.post("http://localhost:1337/v1/chat/completions", raw, requestOptions);

            // Procesar las respuestas a medida que llegan
            const stream = response.data;

            console.log('Respuesta:');

            stream.on('data', (chunk) => {

                try {
                    // Decodificar el chunk
                    const chunkString = chunk.toString();

                    let Json = JSON.parse(chunkString.replace('data:', ''))

                    process.stdout.write(Json.choices[0].delta.content);
                } catch (error) {
                    console.log('\n');
                }

            });

            stream.on('end', () => {
                console.log('\n'); // Nueva línea después de la respuesta completa
            });

        } catch (error) {
            console.error('Error:', error.message);
        }

        // Llamar a la función de nuevo para seguir interactuando
        interact();
    });
}

// Iniciar el bucle de interacción
interact();