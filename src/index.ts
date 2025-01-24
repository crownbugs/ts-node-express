import express, { Express, Request, Response } from 'express';
import http from 'http';
import WebSocket from 'ws';

// Initialize express app
const app: Express = express();
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route for root path "/"
app.get('/', (req: Request, res: Response) => {
  res.sendFile('index.html', { root: 'public' });
});

// A simple API endpoint
app.use('/api', (req: Request, res: Response) => {
  res.send('This is the API endpoint');
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;

  if (pathname === '/api') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);

    // Broadcast message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Get the port from the environment (if provided by the hosting service)
const port = process.env.PORT || 80; // Default to 80 if not specified

// Start the server
server.listen(port, () => {
  console.log(`[server]: Server is running`);
  console.log(`[ws]: WebSocket server is running at ws://localhost/api`);
});
