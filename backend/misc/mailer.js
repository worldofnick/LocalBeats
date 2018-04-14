const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
var config = require('../../config');

let transporter = nodemailer.createTransport({
    service: config.sendGrid.service,
    auth: {
      user: config.sendGrid.user,
      pass: config.sendGrid.apiKey
    }
});

module.exports = {
    sendEmail(from, to, subject, html) {
        return new Promise((resolve, reject) => {
            transporter.sendMail({ from, subject, to, html }, (err, info) => {
                if (err) reject(err);
                resolve(info);
            });
        });
    }
}