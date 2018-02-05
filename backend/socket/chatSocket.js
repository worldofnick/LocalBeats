'use strict';

// var pendingMessages = new Array();  // why not just send the whole 
let socketsHash = new Array();
var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Message   = mongoose.model('Message');

module.exports = function (io) {
    // Default 'connection' event listerner
    io.on('connect', (socket) => {
        console.log("\n=======================\nConnection client with Socket ID:", socket.id);
        console.log('=======================');

        // ============================================
        // Authentication Event Handlers
        // ============================================
        
        // Default 'disconnect' event listerner
        socket.on('disconnect', function () {
            console.log('\n=======================\nUser disconnected at Socket ID:', 
                            socket.id, '\nRemoving it from the socket hashTable');
            console.log('=======================');
        });

        socket.on('newUserLoggedIn', (payload) => {
            
            console.log('\n=======================\n',payload.from.firstName, 
                        'logged in.\nAdding', payload.from.firstName, ' UID to socket hashTable');

            // Add user socket to hash table
            socketsHash[payload.from._id] = socket.id;
            console.log('Added', payload.from.firstName, 'UID to hash table with SID:', socketsHash[payload.from._id]);
            console.log('Socket Hash Table:', socketsHash);

            console.log('=======================');

            // Notify all clients that a new client logged in
            io.emit('newUserLoggedIn', {serverMessage: payload.from.firstName+' logged in', serverPayload: payload.from});
        });

        socket.on('someUserLoggedOut', (payload) => {
            console.log('\n=======================\n',payload.from.firstName, 
                        'logged out.\nRemoving', payload.from.firstName, 'from socket hashTable');

            // Delete user socket from hash table
            delete socketsHash[payload.from._id];
            console.log('Removed', payload.from.firstName, 'from hash table:', socketsHash);
            console.log('=======================');
            // Notify all clients that a client logged out
            io.emit('someUserLoggedOut', {serverMessage: payload.from.firstName+' logged out', serverPayload: payload.from});
        });

        socket.on('addBeatBotToUserMessage', (payload) => {
            console.log('Adding beat bot to new user...');

            User.findOne({ email: 'beatbot@localbeats.com' }, function (err, user) {
                if (err || !user) {
                    console.log('>>> Beatbot user not found!!!');
                }
                let newMessage = new Message();
                newMessage.from = user;
                newMessage.to = payload.to;
                newMessage.content = 'Welcome to localBeats!';

                newMessage.save(function (err, message) {
                    if (err) {
                        console.log('Unable to save the message...');
                    }
                    console.log('Greeting bot added');
                });
            });
        });

        // ============================================
        // Private Messaging Event Handlers - P2P
        // ============================================
        
        socket.on('sendPrivateMessage', (payload) => {
            console.log('\n-----\nPM received from socket: ', socket.id);
            console.log('\n-----\nPM payload: ', payload);
            
            // Svae the message to DB
            let newMessage = new Message();
            newMessage.from = payload.from._id;
            newMessage.to = payload.to._id;
            newMessage.isRead = payload.isRead;
            newMessage.sentAt = payload.sentAt;
            newMessage.messageType = payload.messageType;
            newMessage.attachmentURL = payload.attachmentURL;
            newMessage.content = payload.content;
            // TODO: SAVE THE DATA TO DB
            newMessage.save(function (err, message) {
                if (err) {
                    console.log("Unable to save the message...");
                } 
                console.log("Save successful: ", message);
            });

            // Send the message to all the recipients (currently also the sender)
            let recipients = [socketsHash[payload.from._id], socketsHash[payload.to._id]];
            console.log('>> Receipeitns: ',recipients);
            for(let i = 0; i < recipients.length; i++) {
                console.log('> Sending message to', recipients[i]);
                io.to(recipients[i]).emit('sendPrivateMessage', payload);
            }
        });

        // Send a request to every client asking for the PM recipient to pind server back 
        // with its socket ID. When it does, it sends it the PMs received.
        // socket.on('requestSocketIdForPM', (messagePayload) => {           //TODO: can remove the need to send socketID at the client.
        //     console.log('PM forwarding to: ', socket.id);
            
        //     // SEND ALL THE DATA FROM DB TO RECEIVER
        //     console.log("\n----\nSending Messages: ", messagePayload.serverPayload);
        //     // for(let message in pendingMessages) {
        //         socket.emit('sendPrivateMessage', messagePayload.serverPayload);
        //     // } 
        // });
    });
}