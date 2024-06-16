const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

// Gestion des connexions WebSocket
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const broadcastDeliveryUpdate = (event, delivery) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event: event, delivery }));
        }
    });
};


app.post('/events/location_changed', (req, res) => {
    const { delivery_id, location } = req.body;
    const delivery = { delivery_id, location };

    broadcastDeliveryUpdate("location_changed", delivery);

    res.json({ message: 'Location updated', delivery });
});

app.post('/events/status_changed', (req, res) => {
    const { delivery_id, status } = req.body;
    const delivery = { delivery_id, status };

    broadcastDeliveryUpdate("status_changed", delivery);

    res.json({ message: 'Status updated', delivery });
});

const PORT = process.env.PORT || 3011;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
