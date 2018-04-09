'use strict';

var mongoose = require('mongoose');
const async = require('async');
var User = mongoose.model('User');
var Message = mongoose.model('Message');

// ====== MESSAGE ROUTES ======

exports.getAllMessages = function (req, res) {

    Message.find({}).populate('from to').exec(function (err, messages) {
        if (err) {
            console.log('Error getting all messages: ', err);
            return res.status(400).send({
                reason: "Unable to get all the messages...",
                error: err
            });
        }
        // No need for this anymore. Otherwise, will give cant set undefined of null
        // for( let i = 0; i < messages.length; i++ ) {
        //     if(messages[i] != null || messages[i] != undefined) {
        //         messages[i].from.hashPassword = undefined;
        //         messages[i].to.hashPassword = undefined;
        //     }
        // }
        return res.status(200).send({ messages: messages });
    });
};

exports.getAllFromToMessages = function (req, res) {

    let ids = [req.params.fromUID, req.params.toUID];
    Message.find({}).where('from').in(ids).where('to').in(ids)
        .populate('from to').sort({ sentAt: 1 })
        .exec(function (err, messages) {
            if (err) {
                console.log('Error getting messages (from , to): ', err);
                return res.status(400).send({
                    reason: "Unable to get (from, to) messages...",
                    error: err
                });
            }
            // No need for this anymore. Otherwise, will give cant set undefined of null
            //   for( let i = 0; i < messages.length; i++ ) {
            //     messages[i].from.hashPassword = undefined;
            //     messages[i].to.hashPassword = undefined;
            // }
            return res.status(200).send({ messages: messages });
        });
};

/**
 * Retrieves all the conversation buddies of the passed from_id user. 
 * Looks for users from_id sent messages to and got messages from. So even if 
 * from_id did not sent someone messages but received messages from them, that 
 * buddy will be added to the resulting users.
 * @param {*} req - Contains from_id of the user you want the budddies of
 * @param {*} res - returns { users: [User] }
 */
exports.getAllActiveConversationsFrom = function (req, res) {
    let ids = [req.params.fromUID];

    async.parallel([
        function (callback) {
            Message.find({}).where('from').in(ids).distinct('to', function (error, toIds) {
                callback(error, toIds);
            });
        },
        function (callback) {
            Message.find({}).where('to').in(ids).distinct('from', function (error, fromIds) {
                callback(error, fromIds);
            })
        }
    ], (asyncError, asyncResults) => {

        if (asyncError !== null) {
            console.log('Error getting conversation buddies: ', asyncError);
            return res.status(400).send({
                reason: "Unable to get conversation buddies...",
                error: asyncError
            });
        }

        let resultIds = [];
        for (let id of asyncResults[0]) {
            resultIds.push(id);
        }
        for (let id of asyncResults[1]) {
            resultIds.push(id);
        }

        User.find({}).where('_id').in(resultIds)
            .exec(function (err, toUsers) {
                if (err) {
                    console.log('Error getting user objects for TO ids: ', err);
                    return res.status(400).send({
                        reason: "Unable to get user objects for TO user ids",
                        error: err
                    });
                }
                // No need for this anymore. Otherwise, will give cant set undefined of null
                // for (let i = 0; i < toUsers.length; i++) {
                //     toUsers[i].hashPassword = undefined;
                // }
                return res.status(200).send({ users: toUsers });
            });
    });
};

exports.getOverallUnreadCountForUser = function (req, res) {
    let thisUserId = req.params.myUID;

    Message.find({ isRead: false }).where('to').in(thisUserId).count({}, function (error, unreadCount) {
        if (error) {
            console.log('Error getting overall unread count: ', error);
            return res.status(400).send({
                reason: "Unable to get overall unread count...",
                error: error
            });
        }
        return res.status(200).send({ unreadMessagesCount: unreadCount });
    });
}

/**
 * To get all unread messages sent to this user by a particular sender
 * @param {*} req Has loggedInUserID, and array of senderIDs
 * @param {*} res table of unread message count sent by sender to loggedInUser
 */
exports.getUnreadCountBetweenThisUserAndPassedArrayOfBuddies = function (req, res) {
    //TODO: correct it and test more. Then make it multiple senderIDs
    let thisUserId = req.body.loggedInUser._id;

    let senderArray = new Array();
    if (req.body.senders !== undefined && req.body.senders !== null) {
        for (let i = 0; i < req.body.senders.length; i++) {
            senderArray.push(mongoose.Types.ObjectId(req.body.senders[i]._id));
        }
    }

    // To get all unread messages sent to this user by a particular sender
    Message.aggregate([
        {
            $match:
                {
                    isRead: false,
                    from: { $in: senderArray },
                    to: mongoose.Types.ObjectId(thisUserId)
                }
        },
        {
            $group:
                {
                    _id: "$from",
                    unreadCount: { $sum: 1 }
                }
        }
    ], function (error, result) {
        if (error) {
            console.log('Error getting total unread between 2 buddies: ', error);
            return res.status(400).send({
                reason: "Error getting total unread between you and list of senders...",
                error: error
            });
        }
        return res.status(200).send({ buddies: result });
    });
}

exports.markAllMessagesReadBetweenTwoUsers = function (req, res) {
    let thisUserId = req.params.toUID;
    let senderId = req.params.fromUID;

    Message.updateMany(
        {
            isRead: false,
            to: mongoose.Types.ObjectId(thisUserId),
            from: mongoose.Types.ObjectId(senderId)
        },
        {
            $set: { isRead: true }
        }, function (error, result) {
            if (error) {
                return res.status(400).send({
                    reason: "Unable to update the isUnread to true",
                    error: error
                });
            }
            return res.status(200).send({ result: result });
        });
}

exports.markThisMessageAsRead = function (req, res) {
    Message.update(
        {
            _id: req.params.messageID
        },
        {
            $set: { isRead: true }
        }, function (error, result) {
            if (error) {
                return res.status(400).send({
                    reason: "Unable to set the isUnread for this message",
                    error: error
                });
            }
            return res.status(200).send({ result: result });
        });
}

exports.saveMessage = function (req, res) {
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
        return res.status(200).send({ response: "Save successful!", message: message });
    });
};

exports.clearMessagesDB = function (req, res) {
    Message.remove({}).exec(function (err, messages) {
        if (err) {
            console.log('Error deleting all messages: ', err);
            return res.status(400).send({
                reason: "Unable to delete all messages...",
                error: err
            });
        }
        return res.status(200).send({ response: "All messages removed!" });
    });
};

exports.removeAllConversationsWithAUser = function (req, res) {
    console.log('(Not Yet Implemented (removeAllConversationsWithAUser)');
};
