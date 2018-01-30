'use strict';

module.exports = function (io) {
    // Default 'connection' event listerner
    io.on('connect', (socket) => {
        console.log("Connection client with Socket ID:", socket.id);

        // Default 'disconnect' event listerner
        socket.on('disconnect', function () {
            console.log('User disconnected at Socket ID:', socket.id);
        });

        // TODO: Event for: if someone comes online (that is isOnline controller method executed successfully, 
        // notify the chat client to get new connectedUsers and refresh the UI nav bar.

        socket.on('message', (message) => {
            console.log('\n-----');
            if( message.action == 'newUserLoggedIn' ) {          //TODO: chaneg to action enum?
                // Notify all clients that a new client joined
                io.emit('newUserLoggedIn', {content: 'New User connected', user: message.from});
            }
            else if(message.action == 'someUserLoggedOut') {
                io.emit('someUserLoggedOut', {content: 'User disconnected', user: message.from});
            }
            else if(message.action == 'sendPrivateMessage') {
                let msg = message.content;
                message.content = 'PM Received: ' + msg;
                io.emit('sendPrivateMessage', {message});   // chnage to socket later
            }
            else {
                console.log('Message from Client: ', message);
            }  
        });

        // TODO: add JoinPM listerner which will make the socket join the sent rooms
        socket.on('joinChat', (messageRooms) => {

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


            // console.log('Message Rooms (on join): ', messageRooms);
            // socket.join((messageRooms.senderRoom + messageRooms.receiverRoom));
            // // socket.join(messageRooms.receiverRoom); // TODO: turn receiver room into an array and iterate over for joining (for group chat)
            // console.log('Sender:', messageRooms.senderName, ' at room: ', messageRooms.senderRoom);
            // console.log('Receiver:', messageRooms.receiverName, ' at room: ', messageRooms.receiverRoom);

            // // Emit acknowledgement ping
            // socket.emit('acknowledgeJoin', { 
            //     ping: 'You are now chatting with ' + messageRooms.receiverName
            // });
            // socket.to((messageRooms.senderRoom + messageRooms.receiverRoom)).emit('acknowledgeJoin', { 
            //     ping: 'You are now chatting with ' + messageRooms.senderName
            // });
        });

        // TODO: modularize the code into respective socket/*.js files
        // MessageObject {
        //      text            : string (message)
        //      senderName      : string
        //      receiverName    : string
        //      senderRoom      : string (socketID)
        //      receiverRoom    : string (socketID
        // }
        socket.on('chat-message-sent', (messageObject) => {
            console.log('\n=====\nReceived chat message:', messageObject.text);
            console.log('Sender:', messageObject.senderName);
            console.log('Sender Room:', messageObject.senderRoom);
            console.log('Receiver:', messageObject.receiverName);
            console.log('Receiver Room:', messageObject.receiverRoom);

            // Store the message in the DB
            // Redirect the message to the receiver. 
            io.to(messageObject.receiverRoom).emit('youGotMail', {
                text: messageObject.text,
                sender: messageObject.senderName,
                senderRoom: messageObject.senderRoom
            });
            socket.emit('acknowledge-chat-message', { type: 'acknowledge-chat-message', text: message });
        });
    });
}