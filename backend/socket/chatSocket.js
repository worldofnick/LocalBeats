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

            let socketArray = [socket.id];
            console.log('Socket array = ', socketArray);
            console.log('\n=======================\n', payload.from.firstName,
                'logged in.\nAdding', payload.from.firstName, ' UID to socket hashTable');

            // Add user socket to hash table
            socketsHash[payload.from._id] = socketArray;
            console.log('Added', payload.from.firstName, 'UID to hash table with SID:', socketsHash[payload.from._id]);
            console.log('Socket Hash Table:', socketsHash);

            console.log('=======================');

            // Notify all clients that a new client logged in
            io.emit('newUserLoggedIn', { serverMessage: payload.from.firstName + ' logged in', serverPayload: payload.from });
        });

        socket.on('persistedLogin', (payload) => {

            console.log('\n=======================\n', payload.from.firstName,
                'did a persist log in.\nReplaces', payload.from.firstName, ' UID to socket hashTable');

            if (socketsHash[payload.from._id] === undefined) {
                let socketArray = [socket.id];
                socketsHash[payload.from._id] = socketArray;
                console.log('Added', payload.from.firstName, 'UID to hash table with SID:', socketsHash[payload.from._id]);
                console.log('Socket Hash Table:', socketsHash);
                console.log('=======================');
            } else {
                let socketArrayForUser = socketsHash[payload.from._id];
                socketArrayForUser.push(socket.id);
                socketsHash[payload.from._id] = socketArrayForUser;
            }
            console.log('Persisted', payload.from.firstName, 'UID to hash table with SID:', socketsHash[payload.from._id]);
            console.log('Socket Hash Table:', socketsHash);

            console.log('=======================');

            // Notify all clients that a new client logged in
            io.emit('newUserLoggedIn', { serverMessage: payload.from.firstName + ' logged in', serverPayload: payload.from });
        });

        socket.on('someUserLoggedOut', (payload) => {
            console.log('\n=======================\n', payload.from.firstName,
                'logged out.\nRemoving', payload.from.firstName, 'from socket hashTable');

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

                console.log('Removed a socket for ', payload.from.firstName, ' from hash table:', socketsHash);
                console.log('=======================');
                // Notify all clients that a client logged out
                io.emit('someUserLoggedOut', { serverMessage: payload.from.firstName + ' logged out', serverPayload: payload.from });
                }
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

        // socket.on('requestNewMsgFromProfileButtonClick', (messagePayload) => {
        //     profileButtonMsgPayload = messagePayload;
        // });

        // socket.on('openPmSnackBarThread', (messagePayload) => {
        //     pmSnackBarPayload = messagePayload;
        // });

        // socket.on('chatComponentDoneLoading', (payload) => {
        //     // console.log('Conditional 1: ', Object.keys(profileButtonMsgPayload).length !== 0 && profileButtonMsgPayload.constructor !== Object);
        //     // console.log('Conditional 2: ', Object.keys(profileButtonMsgPayload).length !== 0 && profileButtonMsgPayload.constructor === Object);
        //     if (Object.keys(profileButtonMsgPayload).length !== 0 && profileButtonMsgPayload.constructor === Object) {
        //         socket.emit('requestNewMsgFromProfileButtonClick', profileButtonMsgPayload);
        //         profileButtonMsgPayload = new Object();
        //     }
        //     if (Object.keys(pmSnackBarPayload).length !== 0 && pmSnackBarPayload.constructor === Object) {
        //         console.log('\Emitting profile payload:', pmSnackBarPayload);
        //         socket.emit('openPmSnackBarThread', pmSnackBarPayload);
        //         pmSnackBarPayload = new Object();
        //     }
        // });


        //TODO look at this for sending live notifications
        socket.on('sendPrivateMessage', (payload) => {
            // console.log('\n-----\nPM received from socket: ', socket.id);
            // console.log('\n-----\nPM payload: ', payload);

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
            let fromSocketsArray = socketsHash[payload.from._id];
            let toSocketsArray = socketsHash[payload.to._id];
            let allSocketsOfFromAndTo = fromSocketsArray.concat(toSocketsArray);
            // console.log('>> All sockets: ', allSocketsOfFromAndTo);
            for (let i = 0; i < allSocketsOfFromAndTo.length; i++) {
                // console.log('> Sending message to', allSocketsOfFromAndTo[i]);
                io.to(allSocketsOfFromAndTo[i]).emit('sendPrivateMessage', payload);
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

            for (let i = 0; i < socketArray.length; i++) {
                io.to(socketArray[i]).emit('notificationCount', number);
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

            for (let i = 0; i < sendArray.length; i++) {
                io.to(sendArray[i]).emit('notificationCount', numberOfNotifications);
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

            console.log('TELL NOTIFICATION PANEL: ', sendArray);

            for (let i = 0; i < sendArray.length; i++) {
                io.to(sendArray[i]).emit('notifications', notifications)
            }
            // TODO: remove later after testing. Non-iterable hash array
            // for(let senderSocket of sendArray) {
            //     // console.log(notifications);
            //     io.to(senderSocket).emit('notifications', notifications)
            // }
        })

        socket.on('notificationsForUser', userID => {
            // var notifications = notificationController.getNotificationsForUser(userID)
            
            let socketArray = socketsHash[userID];

            for (let i = 0; i < socketArray.length; i++) {
                io.to(socketArray[i]).emit('notifications', 'test,test,test,test');
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


                if (recipientSocketArray !== undefined) {
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

            for (let i = 0; i < sendArray.length; i++) {
                io.to(sendArray[i]).emit('updateProfile', payload);
            }
            // TODO: remove later after testing. Non-iterable hash array
            // for(let senderSocket of sendArray) {
            //     // console.log(notifications);
            //     io.to(senderSocket).emit('updateProfile', payload);
            // }
        })
    });
}