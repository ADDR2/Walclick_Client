var socket = io();

socket.on('connect', function() {
    console.log("I'm connected");
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('response', function(result) {
    console.log(result);
});

function findPhotographer() {
    if (!("geolocation" in navigator)) {
        return alert('Geolocation not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            socket.emit('looking', {
                username: document.querySelector('input[type="email"]').value,
                lat: position.coords.latitude,
                long: position.coords.longitude,
                alt: position.coords.altitude
            });
        },
        function(error) {
            alert('Unable to fetch location.');
        }
    );
}