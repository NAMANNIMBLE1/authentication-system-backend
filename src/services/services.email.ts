import nodemailer from 'nodemailer';
import config from '../config/config.ts';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN,
    }
});

transporter.verify((error: any, success: any) => {
    if (error) {
        console.log("Error connecting to nodemailer:", error);
    } else {
        console.log("Email server ready to send messages");
    }
});

const sendEmail = async (to, subject,text,html) => {
    try {
        const info = await transporter.sendMail({
            from: `"naman nimbble" < ${config.GOOGLE_USER}`, // sender address
            to: to, // list of recipients
            subject: subject, // subject line
            text: text, // plain text body
            html: html, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}

export  {transporter , sendEmail };