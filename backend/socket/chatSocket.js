'use strict';

module.exports = function (io) {
    // Default 'connection' event listerner
    io.on('connect', (socket) => {
        console.log("Connection client with Socket ID:", socket.id);

        // Default 'disconnect' event listerner
        socket.on('disconnect', function () {
            console.log('User disconnected at Socket ID:', socket.id);
        });

        socket.on('newUserLoggedIn', (payload) => {
            console.log('\n-----');
            // Notify all clients that a new client logged in
            io.emit('newUserLoggedIn', {serverMessage: payload.from.firstName+' logged in', serverPayload: payload.from});
        });

        socket.on('someUserLoggedOut', (payload) => {
            console.log('\n-----');
            // Notify all clients that a client logged out
            io.emit('someUserLoggedOut', {serverMessage: payload.from.firstName+' logged out', serverPayload: payload.from});
        });

        socket.on('sendPrivateMessage', (payload) => {
            console.log('\n-----\nPM = ', payload);
            // Notify all clients that a client logged out
            io.emit('sendPrivateMessage', payload);
        });

        // -------------------
            // ALGORITHM:
            // -------------------
            // Check to see if recieverName is online?
            // If receiver isOnline (and sender by default is):
                    // Find receiver socket 
                    // create a receiver socekt?
                    // Add both socekts to a common chat room (name it uid + uid or email + email)
                    // Ping acknowledgement to sender and receiver
            // If receiver not online:
                    // save message to DB and 
                    // notify sender, receiver not online (but sender to update only its UI)
    });
}