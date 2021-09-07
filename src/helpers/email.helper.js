const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,    
    auth: {
        user: "abe.kohler59@ethereal.email",
        pass: "8Bft1DC6qX7319GZ1f",
    },
    tls: {
        secure: false,
        ignoreTLS: true,
        rejectUnauthorized: false
    },
});

const send = (info) => {    
    return new Promise(async (resolve, reject) => {
        try {
            // send mail with defined transport object
            let result = await transporter.sendMail(info);

            console.log("Message sent: %s", result.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(result));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

            resolve(result);
        } catch (error) {            
            console.log(error);
            reject(error);
        }
    });
};

const emailProcessor = ({email, pin, type}) => {    
    let info = '';
    switch (type) {
        case "request-new-password":
            info = {
                from: '"CMR Company" <makenna.stark63@ethereal.email>', // sender address
                to: email, // list of receivers
                subject: "Request new Pin", // Subject line
                text:
                    "Here is your password rest pin " +
                    pin +
                    " This pin will expires in 1day", // plain text body
                html: `<p>Hello
                here is your pin.</p>
                <b>${pin} </b>
                <p>This pin will expires in 1day
                </p>`, // html body
            };

            return send(info);
            break;
        case 'update-password-success':
            info = {
                from: '"CMR Company" <makenna.stark63@ethereal.email>', // sender address
                to: email, // list of receivers
                subject: "Update Password", // Subject line
                text:
                    "Your password has been updated", // plain text body
                html: `<p>Your password has been updated.</p>`                
            };

            send(info);
            break;
    
        default:
            break;
    }
    
};

module.exports = {
    emailProcessor
};