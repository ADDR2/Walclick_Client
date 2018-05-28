module.exports = async (data, socket, { createMainConnection, ack }) => {
    const serverSocket = await createMainConnection();

    const createCoordsEvent = () => {
        socket.on('coords', (data, ack) => {
            serverSocket.emit('coords', data, (result, error) => {
                ack(!error && result, !!error && error);
            });
        });
    
        socket.on('arrived', (data, ack) => {
            serverSocket.emit('arrived', data, (result, error) => {
                ack(!error && result, !!error && error);
                serverSocket.disconnect();
            });
        });
    };

    serverSocket.emit('clientLooking', data, (result, error) => {
        if(error) ack(undefined, error);
        else {
            createCoordsEvent(socket, serverSocket);
            ack(result);
        }
    });
};