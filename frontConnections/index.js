const fs = require('fs');

const folder = `${__dirname}/../frontConnections/`;

module.exports = (io, createMainConnection, createCoordsEvent) => {
    io.on('connection', async socket => {
        console.log('New client connected');
        try {        
            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });

            fs.readdir(folder, (err, files) => {
                if(err) throw new Error(err);

                for(file of files) {
                    file !== 'index.js' && socket.on(file.replace('.js', ''), data => {
                        require(`./${file}`)(data, socket, {
                            createMainConnection,
                            createCoordsEvent
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