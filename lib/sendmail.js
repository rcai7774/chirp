// Define a function for sending emails and export it for use in verify
function sendMail(email) {
    console.log("yay it worked!");

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "information.chirp@gmail.com",
            pass: process.env.webemail
        },
    });

    const mailOptions = {
        from: "information.chirp@gmail.com",
        to: email,
        subject: "Sending Email using Node.js",
        html: "<h1>Email Verification</h1><br><p>This is the email verification for Chirp. Please follow the link below to continue the signup process.</p><br><a href = https://chirp.rcai7774.repl.co/signup1.html>Sign Up</a>"
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}

module.exports = sendMail;
