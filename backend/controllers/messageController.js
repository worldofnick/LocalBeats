'use strict';

var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Message   = mongoose.model('Message');

// ====== MESSAGE ROUTES ======

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
