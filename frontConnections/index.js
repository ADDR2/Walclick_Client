const fs = require('fs');

const folder = `${__dirname}/../frontConnections/`;

module.exports = (io, createMainConnection) => {
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