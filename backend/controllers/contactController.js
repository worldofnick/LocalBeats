'use strict';

const nodemailer = require('nodemailer');
const mailer = require('../misc/mailer');
const request = require('request');
var config = require('../../config.js');

exports.contactUs = function (req, res) {
    const senderEmail = req.body.email;
    const body = req.body.message;
    const subject = req.body.subject;
    const name = req.body.name;

    let message = {
      from: senderEmail,
      to: 'brandon.gregory.koch@gmail.com',
      subject: subject,
      text: 'Hello from ' + name,
      html: '<p>' + body + '<p>'
    };

    mailer.sendEmail(message.from, message.to, message.subject, message.html)
      .then(data => {
        res.status(200).send({ message: 'Message sent!' });
      }, error => {
        res.status(500).send({ message: 'Unable to send the email.  Please try again later.'});
      });
};