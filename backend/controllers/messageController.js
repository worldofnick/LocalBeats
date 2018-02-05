'use strict';

var mongoose  = require('mongoose');
const async   = require('async');
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
  .populate('from to').sort({sentAt: 1})
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

//TODO: retreive users where from hasnt intialiated the conversation
// Sent to snorlax: Message.find({}).where('to').in(ids).distinct('from', function (error, toIds) {
// Sent by snorlax: Message.find({}).where('from').in(ids).distinct('to', function (error, toIds) {
exports.getAllActiveConversationsFrom = function (req, res) {
    //   console.log('(Not Yet Implemented (getAllFromToMessages)');

    let ids = [req.params.fromUID];

    async.parallel([
        function (callback) {
            Message.find({}).where('from').in(ids).distinct('to', function (error, toIds) {
                if (error) {
                    // console.log('Error retreiving TO users...')
                    // return res.status(400).send({
                    //     reason: "Unable to get distinct (to) users of (from)...",
                    //     error: error
                    // });
                }
                console.log('Sent (to) IDS      : ', toIds);
                callback(error, toIds);
            });
        },
        function (callback) {
            Message.find({}).where('to').in(ids).distinct('from', function (error, fromIds) {
                if (error) {
                    // console.log('Error retreiving TO users...')
                    // return res.status(400).send({
                    //     reason: "Unable to get distinct (to) users of (from)...",
                    //     error: error
                    // });
                }
                console.log('Received (from) IDS: ', fromIds);
                callback(error, fromIds);
            })
        }
    ], (asyncError, asyncResults) => {
        console.log('Async results: ', asyncResults);

        let resultIds = [];
        for (let id of asyncResults[0]) {
            resultIds.push(id);
        }
        // console.log('Results after 1st: ', resultIds);
        for (let id of asyncResults[1]) {
            // console.log(id + ' is in array? [', this.isInArray(id, resultIds) + ']');
            // if (!resultIds.isInArray(id)) {
            resultIds.push(id);
            // }
        }
        console.log('Resulting IDS: ', resultIds);

        User.find({}).where('_id').in(resultIds)
            .exec(function (err, toUsers) {
                if (err) {
                    console.log('Error getting user objects for TO ids: ', err);
                    return res.status(400).send({
                        reason: "Unable to get user objects for TO user ids",
                        error: err
                    });
                }
                // hide hashPassword
                for (let i = 0; i < toUsers.length; i++) {
                    toUsers[i].hashPassword = undefined;
                }
                return res.status(200).send({ users: toUsers });
            });
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
