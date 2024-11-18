const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        let info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        console.log(info);
        console.log("Message sent: %s", info.messageId);

        return info.messageId;


    } catch (error) {
        console.log(error.message);

    }

};

// export mailSender function 

module.exports = mailSender; 
