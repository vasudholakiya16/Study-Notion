const mongoose  = require('mongoose');
const mailSender = require('../utils/MailSend');

const OTPSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    otp:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 5*60,
    },
});

/*
create a function the main aim of this function is
to send teh email for verification
*/
async function sendVerificationEmail(email, otp){
    try {

        const mailResponse= await mailSender(email,"Verification email for StudyNotion", `Your OTP is ${otp}`);
        console.log("Email send Successfully",mailResponse);        
    } catch (error) {
        console.log("Error occure while sending mail: ",error);
        
    }
}   
OTPSchema.pre('save', async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
});

// export model user with OTPSchema
module.exports = mongoose.model('OTP', OTPSchema);