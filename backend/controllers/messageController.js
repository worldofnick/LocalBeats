'use strict';

var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Message   = mongoose.model('Message');

// ====== MESSAGE ROUTES ======

exports.getAllMessages = function (req, res) {
    // console.log('(Not Yet Implemented (getAllMessages)');

    Message.find({}).populate('from').exec(function(err, messages){
        if (err) {
            console.log('Error getting all messages: ', err);
            return res.status(500).send(err);
        }
        console.log('Messages: ', messages);
        return res.status(200).send({"messages": messages});
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
    console.log('(Not Yet Implemented (saveMessage)');
};

exports.clearMessagesDB = function (req, res) {
    console.log('(Not Yet Implemented (clearMessagesDB)');
};

exports.removeAllConversationsWithAUser = function (req, res) {
    console.log('(Not Yet Implemented (removeAllConversationsWithAUser)');
};
