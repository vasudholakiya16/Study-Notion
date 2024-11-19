const User = require('../models/User');
const mailSender = require('../utils/MailSend');

// resetPasswordToken

exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req.body 
        const email = req.body.email;

        //check user for this email, email validation
        const user = await User.findOne({email:email});
        if(!user){
            
            return res.status(404).json({ success: false, message: 'Your email is not registered with us ' });
            
        }
        // generate token
        const token = crypto.randomUUID();
        console.log(token);
        
        // update user by adding token and expiration time 

        const updatedDetails = await User.findOneAndUpdate({email:email}, 
                {token:token, resetPasswordExpires: Date.now() + 5*60*1000,},{new:true}); // 5 minutes
        // create url 
        // link generate 
        const url =`http://localhost:3000/update-Password/${token}`; // frontend url
        // send email containing the url

        await mailSender({
            email: email,
            subject: 'Reset Password link',
            message: `Click on the link to reset your password ${url}`
        });
        // return responce
        return res.status(200).json({ success: true, message: 'Reset password link has been sent to your email, place check your email and reset your password' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Somenthing went wrone while sending reset  password' });
        
    }
};

// resetPassword
