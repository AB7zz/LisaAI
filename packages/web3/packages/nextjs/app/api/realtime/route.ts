import { WebSocket } from 'ws';

let wsConnection: WebSocket | null = null;

// Add a response handler map
const responseHandlers = new Map<string, (message: any) => void>();

async function initializeWebSocket() {
  if (wsConnection?.readyState === WebSocket.OPEN) {
    return wsConnection;
  }

  return new Promise((resolve, reject) => {
    const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
    const ws = new WebSocket(url, {
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    ws.on("open", function open() {
        console.log("Connected to OpenAI realtime server");
        ws.send(JSON.stringify({
          type: "response.create",
          response: {
                modalities: ["text"],
                instructions: "Please assist the user.",
            }
        }));
      wsConnection = ws;
      resolve(ws);
    });

    ws.on("error", (error: any) => {
      console.error("WebSocket error:", error);
      reject(error);
    });

    ws.on("message", function incoming(message: any) {
      const data = JSON.parse(message.toString());
    //   console.log("Received from OpenAI:", data);
      
      if (data.request_id && responseHandlers.has(data.request_id)) {
        const handler = responseHandlers.get(data.request_id);
        let textContent = '';
        console.log("Received from OpenAI:", data);
        
        if (data.type === 'response.content_part.done') {
          console.log("Received from OpenAI:", data.part?.text);
          textContent = data.part?.text || '';
        }
        
        if (textContent) {
          handler?.({ text: textContent });
        }
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      wsConnection = null;
    });

    // Add timeout
    setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket connection timeout'));
      }
    }, 10000); // 10 second timeout
  });
}

export async function POST(req: Request) {
  try {
    const ws = await initializeWebSocket(); // Wait for connection
    
    // Handle FormData
    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;
    if (!audioFile) {
      throw new Error('No audio file received');
    }

    // Convert blob to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Create a unique request ID
    const requestId = Math.random().toString(36).substring(7);

    // Set up Server-Sent Events response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Store the response handler for this request
        responseHandlers.set(requestId, (message) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
          if (message.type === 'response.end') {
            controller.close();
          }
        });

        // Send the audio data to OpenAI
        const event = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_audio',
                audio: base64Audio
              }
            ]
          }
        };

        try {
          ws.send(JSON.stringify(event));
          ws.send(JSON.stringify({type: 'response.create'}));
        } catch (error) {
          console.error("Error sending WebSocket message:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("Error in realtime route:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}