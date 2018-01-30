'use strict';

var pendingMessages = new Array();  // why not just send the whole 

module.exports = function (io) {
    // Default 'connection' event listerner
    io.on('connect', (socket) => {
        console.log("Connection client with Socket ID:", socket.id);

        // ============================================
        // Authentication Event Handlers
        // ============================================
        
        // Default 'disconnect' event listerner
        socket.on('disconnect', function () {
            console.log('User disconnected at Socket ID:', socket.id);
        });

        socket.on('newUserLoggedIn', (payload) => {
            console.log('\n-----');
            socketsHash[payload.from.email] = socket.id;
            console.log('\n---------\nSockets Hash: ', socketsHash);
            // Notify all clients that a new client logged in
            io.emit('newUserLoggedIn', {serverMessage: payload.from.firstName+' logged in', serverPayload: payload.from});
        });

        socket.on('someUserLoggedOut', (payload) => {
            console.log('\n-----');
            delete socketsHash[payload.from.email];
            console.log('\n---------\nSockets Hash: ', socketsHash);
            // Notify all clients that a client logged out
            io.emit('someUserLoggedOut', {serverMessage: payload.from.firstName+' logged out', serverPayload: payload.from});
        });

        // ============================================
        // Private Messaging Event Handlers - P2P
        // ============================================

        socket.on('sendPrivateMessage', (payload) => {
            console.log('\n-----\nPM received from socket: ', socket.id);

            // TODO: SAVE THE DATA TO DB
            pendingMessages.push(payload);
            console.log("\n----\nPending Messages: ", pendingMessages);
            io.emit('requestSocketIdForPM', {serverMessage: payload.to.firstName + ' ping me', serverPayload: payload.to});
            
        });

        // Send a request to every client asking for the PM recipient to pind server back 
        // with its socket ID. When it does, it sends it the PMs received.
        socket.on('requestSocketIdForPM', (receiverSocketID) => {           //TODO: can remove the need to send socketID at the client.
            console.log('SOCKET ID REQUEST RESPONSE: ', receiverSocketID);
            
            // SEND ALL THE DATA FROM DB TO RECEIVER
            console.log("\n----\nSending Messages: ", pendingMessages);
            // for(let message in pendingMessages) {
                socket.emit('sendPrivateMessage', pendingMessages);
            // } 
        });
    });
}