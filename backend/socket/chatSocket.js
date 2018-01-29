'use strict';

module.exports = function (io) {
    // Default 'connection' event listerner
    io.on('connection', (socket) => {
        console.log("Connection from Socket ID:", socket.id);

        // Default 'disconnect' event listerner
        socket.on('disconnect', function () {
            console.log('User disconnected at Socket ID:', socket.id);
        });

        // TODO: add JoinPM listerner which will make the socket join the sent rooms

        // TODO: modularize the code into respective socket/*.js files
        socket.on('chat-message-sent', (message) => {
            console.log('\n=====\nReceived chat message:', message);
            socket.emit('acknowledge-chat-message', { type: 'acknowledge-chat-message', text: message });
        });
    });
}