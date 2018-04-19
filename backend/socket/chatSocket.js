'use strict';

// var pendingMessages = new Array();  // why not just send the whole 
let socketsHash = new Array();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Notifications = mongoose.model('Notification');
var Message = mongoose.model('Message');
let notificationController = require('../controllers/notificationController.js');
var profileButtonMsgPayload = new Object();
var pmSnackBarPayload = new Object();
let thisIo;

exports.broadcastResultToAllClientsViaSocket = function(auth, token, user, code, message) {
    if (thisIo !== undefined || thisIo !== null) {
        thisIo.emit('magicLoginResult', {serverPayload: {
            token: token, 
            user: user, 
            auth: auth,
            statusCode: code,
            message: message
        }});
    }
  }

exports.socketServer = function (io) {
    thisIo = io;
    // Default 'connection' event listerner
    io.on('connect', (socket) => {

        // ============================================
        // Authentication Event Handlers
        // ============================================

        // Default 'disconnect' event listerner
        socket.on('disconnect', function () {
        });

        socket.on('newUserLoggedIn', (payload) => {

            let socketArray = [socket.id];

            // Add user socket to hash table
            socketsHash[payload.from._id] = socketArray;

            // Notify all clients that a new client logged in
            io.emit('newUserLoggedIn', { serverMessage: payload.from.firstName + ' logged in', serverPayload: payload.from });
        });

        socket.on('persistedLogin', (payload) => {

            if (socketsHash[payload.from._id] === undefined) {
                let socketArray = [socket.id];
                socketsHash[payload.from._id] = socketArray;
            } else {
                let socketArrayForUser = socketsHash[payload.from._id];
                socketArrayForUser.push(socket.id);
                socketsHash[payload.from._id] = socketArrayForUser;
            }

            // Notify all clients that a new client logged in
            io.emit('newUserLoggedIn', { serverMessage: payload.from.firstName + ' logged in', serverPayload: payload.from });
        });

        socket.on('someUserLoggedOut', (payload) => {

            // Delete user socket from hash table
            if (socketsHash[payload.from._id] !== undefined) {
                let socketArrayOfUser = socketsHash[payload.from._id];

                // adams code to fix home page bug with suggestions when logging out.
                for(let i = 0; i < socketArrayOfUser.length; i++){
                    io.to(socketArrayOfUser[i]).emit('youLoggedOut', payload);
                }

                for (let i = 0; i < socketArrayOfUser.length; i++) {
                    if (socketArrayOfUser[i] === socket.id) {
                        socketArrayOfUser.splice(i, 1);
                    }
                }
                if (socketArrayOfUser.length === 0) {
                    delete socketsHash[payload.from._id];
                } else {
                    socketsHash[payload.from._id] = socketArrayOfUser;
                }
                // Notify all clients that a client logged out
                io.emit('someUserLoggedOut', { serverMessage: payload.from.firstName + ' logged out', serverPayload: payload.from });
                }
        });

        socket.on('addBeatBotToUserMessage', (payload) => {

            User.findOne({ email: 'beatbot@localbeats.com' }, function (err, user) {
                if (err || !user) {
                }
                let newMessage = new Message();
                newMessage.from = user;
                newMessage.to = payload.to;
                newMessage.content = 'Welcome to localBeats!';

                newMessage.save(function (err, message) {
                    if (err) {
                    }
                });
            });
        });


        //TODO look at this for sending live notifications
        socket.on('sendPrivateMessage', (payload) => {

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
                }
            });

            // Send the message to all the recipients (currently also the sender)
            let fromSocketsArray = socketsHash[payload.from._id];
            let toSocketsArray = socketsHash[payload.to._id];
            let allSocketsOfFromAndTo = fromSocketsArray.concat(toSocketsArray);

            if (allSocketsOfFromAndTo !== undefined && allSocketsOfFromAndTo !== null) {
                for (let i = 0; i < allSocketsOfFromAndTo.length; i++) {
                    io.to(allSocketsOfFromAndTo[i]).emit('sendPrivateMessage', payload);
                }
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

        // ============================================
        // Notifications Socket Controls
        // ============================================

        socket.on('notificationsCount', (userID) => {
            let number = notificationController.getNotificationsCount();

            let socketArray = socketsHash[userID];

            if (socketArray !== undefined && socketArray !== null) {
                for (let i = 0; i < socketArray.length; i++) {
                    io.to(socketArray[i]).emit('notificationCount', number);
                }
            }
            // TODO: remove later after testing. Non-iterable hash array
            // for(senderSocket of socketArray) {
            //     io.to(senderSocket).emit('notificationCount', number);
            // }
        });

        // TODO add parans for function
        socket.on('tellTopBar', numberOfNotifications => {
            let sendArray = new Array();
            for(let key in socketsHash) {
                let socketArray = socketsHash[key];
                // console.log('Array: ', socketArray);
                for(let currentSocket of socketArray) {
                    // console.log('CURRENT SOCKE: ', currentSocket);
                    if(currentSocket === socket.id) {
                        sendArray = socketArray;
                    }
                }
            }
            // console.log('TELL TOP BAR: ', sendArray);

            if (sendArray !== undefined && sendArray !== null) {
                for (let i = 0; i < sendArray.length; i++) {
                    io.to(sendArray[i]).emit('notificationCount', numberOfNotifications);
                }
            }
            // TODO: remove later after testing. Non-iterable hash array
            // for(let senderSocket of sendArray) {
            //     io.to(senderSocket).emit('notificationCount', numberOfNotifications);
            // }
        })

        socket.on('tellNotificationPanel', notifications => {
            let sendArray = new Array();
            for(let key in socketsHash) {
                let socketArray = socketsHash[key];
                // console.log('Array: ', socketArray);
                for(let currentSocket of socketArray) {
                    // console.log('CURRENT SOCKE: ', currentSocket);
                    if(currentSocket === socket.id) {
                        sendArray = socketArray;
                    }
                }
            }

            if (sendArray !== undefined && sendArray !== null) {
                for (let i = 0; i < sendArray.length; i++) {
                    io.to(sendArray[i]).emit('notifications', notifications)
                }
            }
        })

        socket.on('notificationsForUser', userID => {
            // var notifications = notificationController.getNotificationsForUser(userID)
            
            let socketArray = socketsHash[userID];

            if (socketArray !== undefined && socketArray !== null) {
                for (let i = 0; i < socketArray.length; i++) {
                    io.to(socketArray[i]).emit('notifications', 'test,test,test,test');
                }
            }
            // TODO: remove later after testing. Non-iterable hash array
            // for(senderSocket of socketArray) {
            //     io.to(senderSocket).emit('notifications', 'test,test,test,test');
            // }
        });

        socket.on('sendNotification', (payload) => {
            // console.log('\n-----\N Notification received from socket: ', socket.id);
            // console.log('\n-----\N Notif payload: ', payload);

            // Send the message to all the recipients (currently also the sender)
            let recipientSocketArray = socketsHash[payload.receiverID._id];
            // console.log('> Sending notification to', recipientSocketArray);


            // save notification to db
            let notification = new Notifications(); // build notification "someone has requested you to play blah"
            notification.senderID = payload.senderID;
            notification.message = payload.message;
            notification.icon = payload.icon;
            notification.receiverID = payload.receiverID;
            notification.eventID = payload.eventID;
            notification.route = payload.route;
            notification.save(function (err, notification) {
                if (err) {
                    return res.status(500).send("Failed to create booking notification");
                }
                // console.log('right here', notification);
                payload._id = notification._id;


                if (recipientSocketArray !== undefined && recipientSocketArray !== null) {
                    for (let i = 0; i < recipientSocketArray.length; i++) {
                        io.to(recipientSocketArray[i]).emit('sendNotification', payload);
                    }
                }
                // TODO: remove later after testing. Non-iterable hash array
                // for(let recipientSocket of recipientSocketArray) {
                //     io.to(recipientSocket).emit('sendNotification', payload);
                // }
            });

        });
        // ===========
        // Having profile reflect settings after updating - live.
        // ===========

        socket.on('updateProfile', (payload) => {
            let sendArray = new Array();
            for(let key in socketsHash) {
                let socketArray = socketsHash[key];
                // console.log('Array: ', socketArray);
                for(let currentSocket of socketArray) {
                    // console.log('CURRENT SOCKE: ', currentSocket);
                    if(currentSocket === socket.id) {
                        sendArray = socketArray;
                    }
                }
            }

            if (sendArray !== undefined && sendArray !== null) {
                for (let i = 0; i < sendArray.length; i++) {
                    io.to(sendArray[i]).emit('updateProfile', payload);
                }
            }
            // TODO: remove later after testing. Non-iterable hash array
            // for(let senderSocket of sendArray) {
            //     // console.log(notifications);
            //     io.to(senderSocket).emit('updateProfile', payload);
            // }
        })
    });
}