const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const socketClient = require('socket.io-client');
const bodyParser = require('body-parser');

const publicPath = path.join(__dirname, './public');
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(publicPath));

const createMainConnection = () => {
    return new Promise((resolve, reject) => {
        const serverSocket = socketClient.connect('http://192.168.0.8:5000');
        serverSocket.on('connect', () => serverSocket.emit('Client') && resolve(serverSocket));
        setTimeout(() => reject('Not able to connect to backend'), 5000);
    });
};

const createCoordsEvent = (socket,  serverSocket) => {
    socket.on('coords', data => {
        serverSocket.emit('coords', data);
    });

    socket.on('arrived', data => {
        serverSocket.emit('arrived', data);

        serverSocket.disconnect();
        socket.disconnect();
    });
};

require('./frontConnections')(socketIO(server), createMainConnection, createCoordsEvent);

app.post('/create', async (req, res) => {
    try {
        const serverSocket = await createMainConnection();
        serverSocket.emit('createClient', req.body);

        serverSocket.on('response', result => {
            res.status(201).send(result);
            serverSocket.disconnect();
        });

        serverSocket.on('actionError', error => {
            res.status(500).send(error);
            serverSocket.disconnect();
        });
    } catch(error) {
        res.status(500).send(error.message);
        serverSocket.disconnect();
    }
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});