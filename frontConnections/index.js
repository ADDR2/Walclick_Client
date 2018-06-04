const fs = require('fs');

const folder = `${__dirname}/../frontConnections/`;

const handleServerEvents = (io, permanentConnection) => {
    permanentConnection.on('photographerFound', ({ clientSocketId, photographerInfo }, ack) => {
        try {
            if(clientSocketId in io.sockets.sockets) {
                io.to(clientSocketId).emit('photographerFound', photographerInfo);
                ack(true);
            } else
                ack(undefined, 'Client canceled');
        } catch(error) {
            console.log(error);
        }
    });
};

module.exports = (io, createMainConnection, permanentConnection) => {
    handleServerEvents(io, permanentConnection);

    io.on('connection', async socket => {
        console.log('New client connected');
        try {        
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });

            fs.readdir(folder, (err, files) => {
                if(err) throw new Error(err);

                for(file of files) {
                    file !== 'index.js' && socket.on(file.replace('.js', ''), (data, ack) => {
                        require(`./${file}`)(data, socket, {
                            createMainConnection,
                            ack
                        }).catch( error => {
                            console.log(error);
                            socket.disconnect();
                        });
                    });
                }
            });
        } catch(error) {
            console.log(error);
            socket.disconnect();
        }
    });
};