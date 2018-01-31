'use strict';

var mongoose  = require('mongoose');
var User      = mongoose.model('User');
var Message   = mongoose.model('Message');

// ====== MESSAGE ROUTES ======

exports.getAllMessages = function (req, res) {
    // console.log('(Not Yet Implemented (getAllMessages)');

    Message.find({}).populate('from to').exec(function(err, messages){
        if (err) {
            console.log('Error getting all messages: ', err);
            return res.status(400).send({
                reason: "Unable to get all the messages...",
                error: err
            });
        }
        // console.log('Messages: ', messages);
        for( let i = 0; i < messages.length; i++ ) {
            messages[i].from.hashPassword = undefined;
            messages[i].to.hashPassword = undefined;
        }
        return res.status(200).send({messages: messages});
    });
};

exports.getAllFromToMessages = function (req, res) {
//   console.log('(Not Yet Implemented (getAllFromToMessages)');

  let ids = [req.params.fromUID, req.params.toUID];
  Message.find({}).where('from').in(ids).where('to').in(ids)
  .populate('from to')
  .exec(function(err, messages) {
      if (err) {
        console.log('Error getting messages (from , to): ', err);
        return res.status(400).send({
            reason: "Unable to get (from, to) messages...",
            error: err
        });
      } 
      // hide hashPassword
      for( let i = 0; i < messages.length; i++ ) {
        messages[i].from.hashPassword = undefined;
        messages[i].to.hashPassword = undefined;
    }
      return res.status(200).send({messages: messages});
  });
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
                message: "Unable to save the message...",
                error: err
            });
        } 
        return res.status(200).send({ response: "Save successful!", message: message});
    });
};

exports.clearMessagesDB = function (req, res) {
    // console.log('(Not Yet Implemented (clearMessagesDB)');
    Message.remove({}).exec(function(err, messages){
        if (err) {
            console.log('Error deleting all messages: ', err);
            return res.status(400).send({
                reason: "Unable to delete all messages...",
                error: err
            });
        }
        return res.status(200).send( {response: "All messages removed!"} );
    });
};

exports.removeAllConversationsWithAUser = function (req, res) {
    console.log('(Not Yet Implemented (removeAllConversationsWithAUser)');
};
