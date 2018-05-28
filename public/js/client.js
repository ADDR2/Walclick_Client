var socket = io();

socket.on('connect', function() {
    console.log("I'm connected");
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('arrived', function() {
    alert('arrived');
    serverSocket.disconnect();
});

function findPhotographer() {
    if (!("geolocation" in navigator)) {
        return alert('Geolocation not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            socket.emit(
                'looking',
                {
                    username: document.querySelector('input[type="email"]').value,
                    lat: position.coords.latitude,
                    long: position.coords.longitude,
                    alt: position.coords.altitude,
                    socketId: socket.id
                },
                console.log
            );
        },
        function(error) {
            alert('Unable to fetch location.');
        }
    );
}