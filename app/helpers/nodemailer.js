const nodemailer = require("nodemailer");
const dotenv = require('dotenv');

dotenv.config();

class Nodemailer {

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
      }
    });
  }
  
  emailVerificationTemplate(emailAddress) {
    return {
      from: '"Social Net" <no-reply@socialnet.com>', // sender address
      to: emailAddress, // list of receivers
      subject: "Please confirm your email address", // Subject line
      text: "Dear Customer,\n\nPlease confirm the email from your SocialNet account.\n\nIn order to verify the domain " +
      "ownership, please copy the following URL to your browser: http://somelink\n\nIf you did not request this email, you can ignore it, and no changes will be " +
      "made to your account.\n\nIf you need help or advice, please contact our technical support.\n\nBest regards, SocialNet Team.", // plain text body
      html: "<b>Dear Customer,</b><br><br>Please confirm the email from your SocialNet account.<br><br>In order to verify the domain " +
      "ownership, please <a href=''>click here</a>.<br><br>If you did not request this email, you can ignore it, and no changes will be " +
      "made to your account.<br><br>If you need help or advice, please contact our technical support.<br><br><hr><br>Best regards, SocialNet Team." // html body
    }
  }
  
  sendEmailVerification(emailAddress) {
    email = this.emailVerificationTemplate(emailAddress)
    this.transporter.sendMail(email);
  }

}



module.exports = Nodemailer;

