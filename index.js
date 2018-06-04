const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const express = require('express');
const app = express();
const socketClient = require('socket.io-client');
const bodyParser = require('body-parser');

const publicPath = path.join(__dirname, './public');
const server = http.createServer(app);
const PORT = process.env.PORT || 8081;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(publicPath));

const createMainConnection = eventName => {
    return new Promise((resolve, reject) => {
        const serverSocket = socketClient.connect('http://localhost:5000');
        serverSocket.on('connect', () => serverSocket.emit(eventName || 'Client') && resolve(serverSocket));
        setTimeout(reject, 5000, 'Not able to connect to backend');
    });
};

createMainConnection('PermanentClient')
    .then( require('./frontConnections').bind(this, socketIO(server), createMainConnection) )
    .catch( error => (console.log(error), process.exit(1)) );

app.post('/create', async (req, res) => {
    try {
        const serverSocket = await createMainConnection();
        serverSocket.emit('createClient', req.body, (result, error) => {
            if(error) res.status(400).send(error);
            else res.status(201).send(result);
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