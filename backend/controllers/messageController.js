'use strict';

var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Message   = mongoose.model('Message');

// ====== MESSAGE ROUTES ======

exports.getAllMessages = function (req, res) {
    // console.log('(Not Yet Implemented (getAllMessages)');

    Message.find({}).populate('from').populate('to').exec(function(err, messages){
        if (err) {
            console.log('Error getting all messages: ', err);
            return res.status(400).send({
                reason: "Unable to save the user...",
                error: err
            });
        }
        console.log('Messages: ', messages);
        return res.status(200).send({messages: messages});
    });

    // Message.find({}, { hashPassword: 0 }, function (err, users) {
    //     if (err)
    //       return res.send(err);
    //     users.hashPassword = undefined;
    //     // var usrs = [];
    //     // users.forEach(function(user) {
    //     //   usrs.push({"user": user});
    //     // });
    //     return res.status(200).send({"users": users});
    //   });
};

exports.getAllFromToMessages = function (req, res) {
  console.log('(Not Yet Implemented (getAllFromToMessages)');
};

exports.saveMessage = function (req, res) {
    // console.log('(Not Yet Implemented (saveMessage)');

    let newMessage = new Message();
    newMessage.from = req.body.from._id;
    newMessage.to = req.body.to._id;
    newMessage.isRead = req.body.isRead;
    newMessage.sentAt = req.body.sentAt;
    newMessage.messageType = req.body.messageType;
    newMessage.attachmentURL = req.body.attachmentURL;
    newMessage.content = req.body.content;
    
    newMessage.save(function (err, message) {
        if (err) {
            return res.status(400).send({
                message: "Unable to save the user...",
                error: err
            });
        } 
        return res.status(200).send({ response: "Save successful!", message: message});
    });
};

exports.clearMessagesDB = function (req, res) {
    console.log('(Not Yet Implemented (clearMessagesDB)');
};

exports.removeAllConversationsWithAUser = function (req, res) {
    console.log('(Not Yet Implemented (removeAllConversationsWithAUser)');
};
