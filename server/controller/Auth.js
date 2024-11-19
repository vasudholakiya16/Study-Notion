const User = require('../models/User');
const OTP = require('../models/OTP');
const mailSender = require('otp-generator');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
require('dotenv').config();



// sendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req.body
    const { email } = req.body;

    // check if email already exist in the database
    const checkUserPresent = await User.findOne({ email });

    // if email already exist in the database then return error
    if(checkUserPresent){
        return res.status(401).json({message: "Email already exist"});
    } 
    //  generate a random 6 digit OTP   
    var otp = otpGenerator.generate(6, { 
        upperCase: false,
        specialChars: false,
        alphabets: false,
    },);
    console.log("Otp generation is :- ",otp);

    // check unique otp or not 
    let result = await OTP.findOne({ otp: otp });    
    
while(result){
    otp = otpGenerator(6, { 
        upperCase: false,
        specialChars: false,
        alphabets: false,
    },);
    console.log("Otp generation is :- ",otp);

}
 const otpPayload = {
     email,
     otp,};

     // save otp in the database

        const otpBody = await OTP.create(otpPayload);
        console.log("Otp saved successfully", otpBody);

        // return success response

        return res.status(200).json({ message: "OTP sent successfully", sucess: true ,  otp});
        
    } catch (error) {
        console.log(error);
return res.status(500).json({ message: "Internal server error", success: false});
        
        
    }

};

// signup 

exports.signUp = async (req, res) => {
    // fetch the data from request body
    try {
    const {firstName ,
        lastName ,
         email,
         password,
         conformPassword,
         accountType,
         contactNumber,
         otp
        }  = req.body;
    // validet out data 

    if (!firstName || !lastName || !email||!password||
        !conformPassword||!otp){
            return res.status(403).json({
            success: false, message:"All fields are require"
            })
        }

    // both password(passwaod + conformPassword) metch
    
    if (password !== conformPassword) {
        return res.status(400).json({
            success: false,
            message:"Password and conformPassword value are dose not match, place try again"
        })

        
    }
    // check user alrady exist or not 

    const existingUser = await User.findOne({ email });

    if(existingUser){
        return res.status(400).json({
            success: false,
            message:"User already exist"
        })
    }

    
    // find most resent otp for the user 

    const resentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
    console.log("Most resent otp is :- ",resentOtp);
    // validate our otp 
    if(resentOtp.length === 0 || resentOtp[0].otp !== otp){
        return res.status(401).json({
            success: false,
            message: "Invalid OTP"
        });
    } else if(otp!==resentOtp.otp){
        return res.status(401).json({
            success: false,
            message: "Invalid OTP"
        });
    }
    // hash password
    
    const hashedPassword = await bcrypt.hash(password, 10); 
    console.log("Hashed password is :- ",hashedPassword);
    // enty create a database 
       // create a user profile 
       const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,


       });
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        accountType,
        contactNumber,
        additionalDetails: profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    // return responce 

    return res.status(200).json({
        success: true,
        message: "User created successfully",
        data: user,
    });


    
    
} catch (error) {
    console.log(error);
    return res.status(500).json({ message: "User can not register place try again ", success: false });
    
}
};
// login
exports.login = async (req, res) => {
    try {
        // get data form request body
        const { email, password } = req.body;
        // validiton of our data 
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required, place try again ", success: false });
        }
        // check user exist or not
        const user = await User.findOne ({ email }).populate("additionalDetails");
        if(!user){
            return res.status(400).json({ message: "User not found, place try again ", success: false });
        }
       
        // generate JWT token ,after metch the password

        if(await bcrypt.compare(password, user.password)){
            // generate JWT token
           const  payload ={
            email: user.email,
            id: user._id,
            accountType: user.accountType,
               };
            const token = Jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

            user.token = token;
            user.password = undefined;

            // create cookie and send to the user  
        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };
        res.cookie("token", token, options).status(200).json({
            success: true,
            user,
            token,
            message: "User login successfully",
        });
        
        }
        else{
            return res.status(400).json({ message: "Password is incorrect, place try again ", success: false });
        }
        
    


    
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "User can not login place try again ", success: false });
        
    }
            
};


//changePassword
exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }
