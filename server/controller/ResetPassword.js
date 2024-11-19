const User = require('../models/User');
const mailSender = require('../utils/MailSend');
const crypto = require('crypto');

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

exports.resetPassword = async (req, res) => {
    try {
         // fetch the data 
         const{passwoed, confirmPassword, token} = req.body;
         //validition
         if(passwoed !== confirmPassword){
             return res.status(400).json({ success: false, message: 'Password and confirm password should be same' });
         }
         // get user details from db using token
         const userDetail = await User.findOne({token:token});
         // if not entryfound - invalid token
         if(!userDetail){
             return res.status(400).json({ success: false, message: 'Invalid token' });
            }

         // check for expiration time - if expired - invalid token
            if(userDetail.resetPasswordExpires < Date.now()){
                return res.status(400).json({ success: false, message: 'Token expired, place regenerat your token ' });
            }
         // hash the password
            const hashedPassword = await bcrypt.hash(passwoed, 10);
            console.log(
                'hashedPassword', hashedPassword
            );
         // update the password in db
         await User.findOneAndUpdate(
            {token:token},
             {password:hashedPassword, 
                },
                 {new:true},

            );

         // send a respince

            return res.status(200).json({ success: true, message: 'Password reset successfully' });
          


        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Somenthing went wrone while reseting password' });
        
    }

};


