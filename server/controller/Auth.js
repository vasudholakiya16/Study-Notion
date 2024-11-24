const User = require('../models/User');
const OTP = require('../models/OTP');
const mailSender = require('otp-generator');
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
require('dotenv').config();



// sendOTP

// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
    try {
      const { email } = req.body
  
      // Check if user is already present
      // Find user with provided email
      const checkUserPresent = await User.findOne({ email })
      // to be used in case of signup
  
      // If user found with provided email
      if (checkUserPresent) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is Already Registered`,
        })
      }
  
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      const result = await OTP.findOne({ otp: otp })
      console.log("Result is Generate OTP Func")
      console.log("OTP", otp)
      console.log("Result", result)
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
        })
      }
      const otpPayload = { email, otp }
      const otpBody = await OTP.create(otpPayload)
      console.log("OTP Body", otpBody)
      res.status(200).json({
        success: true,
        message: `OTP Sent Successfully`,
        otp,
      })
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
  

// exports.sendOTP = async (req, res) => {
//     try {
//         // fetch email from req.body
//     const { email } = req.body;

//     // check if email already exist in the database
//     const checkUserPresent = await User.findOne({ email });

//     // if email already exist in the database then return error
//     if(checkUserPresent){
//         return res.status(401).json({message: "Email already exist"});
//     } 
//     //  generate a random 6 digit OTP   
//     var otp = otpGenerator.generate(6, { 
//         upperCase: false,
//         specialChars: false,
//         alphabets: false,
//     },);
//     console.log("Otp generation is :- ",otp);

//     // check unique otp or not 
//     let result = await OTP.findOne({ otp: otp });    
    
// while(result){
//     otp = otpGenerator(6, { 
//         upperCase: false,
//         specialChars: false,
//         alphabets: false,
//     },);
//     console.log("Otp generation is :- ",otp);

// }
//  const otpPayload = {
//      email,
//      otp,};

//      // save otp in the database

//         const otpBody = await OTP.create(otpPayload);
//         console.log("Otp saved successfully", otpBody);

//         // return success response

//         return res.status(200).json({ message: "OTP sent successfully", sucess: true ,  otp});
        
//     } catch (error) {
//         console.log(error);
// return res.status(500).json({ message: "Internal server error", success: false});
        
        
//     }

// };



// Signup Controller for Registering USers

exports.signup = async (req, res) => {
    try {
      // Destructure fields from the request body
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
      } = req.body
      // Check if All Details are there or not
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !otp
      ) {
        return res.status(403).send({
          success: false,
          message: "All Fields are required",
        })
      }
      // Check if password and confirm password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Password and Confirm Password do not match. Please try again.",
        })
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists. Please sign in to continue.",
        })
      }
  
      // Find the most recent OTP for the email
      const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
      console.log(response)
      if (response.length === 0) {
        // OTP not found for the email
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        })
      } else if (otp !== response[0].otp) {
        // Invalid OTP
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        })
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Create the user
      let approved = ""
      approved === "Instructor" ? (approved = false) : (approved = true)
  
      // Create the Additional Profile For User
      const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
      })
      const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType: accountType,
        approved: approved,
        additionalDetails: profileDetails._id,
        image: "",
      })
  
      return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "User cannot be registered. Please try again.",
      })
    }
  }
  

// exports.signUp = async (req, res) => {
//     // fetch the data from request body
//     try {
//     const {firstName ,
//         lastName ,
//          email,
//          password,
//          conformPassword,
//          accountType,
//          contactNumber,
//          otp
//         }  = req.body;
//     // validet out data 

//     if (!firstName || !lastName || !email||!password||
//         !conformPassword||!otp){
//             return res.status(403).json({
//             success: false, message:"All fields are require"
//             })
//         }

//     // both password(passwaod + conformPassword) metch
    
//     if (password !== conformPassword) {
//         return res.status(400).json({
//             success: false,
//             message:"Password and conformPassword value are dose not match, place try again"
//         })

        
//     }
//     // check user alrady exist or not 

//     const existingUser = await User.findOne({ email });

//     if(existingUser){
//         return res.status(400).json({
//             success: false,
//             message:"User already exist"
//         })
//     }

    
//     // find most resent otp for the user 

//     const resentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
//     console.log("Most resent otp is :- ",resentOtp);
//     // validate our otp 
//     if(resentOtp.length === 0 || resentOtp[0].otp !== otp){
//         return res.status(401).json({
//             success: false,
//             message: "Invalid OTP"
//         });
//     } else if(otp!==resentOtp.otp){
//         return res.status(401).json({
//             success: false,
//             message: "Invalid OTP"
//         });
//     }
//     // hash password
    
//     const hashedPassword = await bcrypt.hash(password, 10); 
//     console.log("Hashed password is :- ",hashedPassword);
//     // enty create a database 
//        // create a user profile 
//        const profileDetails = await Profile.create({
//         gender: null,
//         dateOfBirth: null,
//         about: null,
//         contactNumber: null,


//        });
//     const user = await User.create({
//         firstName,
//         lastName,
//         email,
//         password: hashedPassword,
//         accountType,
//         contactNumber,
//         additionalDetails: profileDetails._id,
//         image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
//     });
//     // return responce 

//     return res.status(200).json({
//         success: true,
//         message: "User created successfully",
//         data: user,
//     });


    
    
// } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "User can not register place try again ", success: false });
    
// }
// };



// Login controller for authenticating users
exports.login = async (req, res) => {
    try {
      // Get email and password from request body
      const { email, password } = req.body
  
      // Check if email or password is missing
      if (!email || !password) {
        // Return 400 Bad Request status code with error message
        return res.status(400).json({
          success: false,
          message: `Please Fill up All the Required Fields`,
        })
      }
  
      // Find user with provided email
      const user = await User.findOne({ email }).populate("additionalDetails")
  
      // If user not found with provided email
      if (!user) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is not Registered with Us Please SignUp to Continue`,
        })
      }
  
      // Generate JWT token and Compare Password
      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { email: user.email, id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        )
  
        // Save token to user document in database
        user.token = token
        user.password = undefined
        // Set cookie for token and return success response
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        }
        res.cookie("token", token, options).status(200).json({
          success: true,
          token,
          user,
          message: `User Login Success`,
        })
      } else {
        return res.status(401).json({
          success: false,
          message: `Password is incorrect`,
        })
      }
    } catch (error) {
      console.error(error)
      // Return 500 Internal Server Error status code with error message
      return res.status(500).json({
        success: false,
        message: `Login Failure Please Try Again`,
      })
    }
  }
  
// exports.login = async (req, res) => {
//     try {
//         // get data form request body
//         const { email, password } = req.body;
//         // validiton of our data 
//         if (!email || !password) {
//             return res.status(400).json({ message: "All fields are required, place try again ", success: false });
//         }
//         // check user exist or not
//         const user = await User.findOne ({ email }).populate("additionalDetails");
//         if(!user){
//             return res.status(400).json({ message: "User not found, place try again ", success: false });
//         }
       
//         // generate JWT token ,after metch the password

//         if(await bcrypt.compare(password, user.password)){
//             // generate JWT token
//            const  payload ={
//             email: user.email,
//             id: user._id,
//             accountType: user.accountType,
//                };
//             const token = Jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

//             user.token = token;
//             user.password = undefined;

//             // create cookie and send to the user  
//         const options = {
//             expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
//             httpOnly: true,
//         };
//         res.cookie("token", token, options).status(200).json({
//             success: true,
//             user,
//             token,
//             message: "User login successfully",
//         });
        
//         }
//         else{
//             return res.status(400).json({ message: "Password is incorrect, place try again ", success: false });
//         }
        
    


    
    
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "User can not login place try again ", success: false });
        
//     }
            
// };


//changePassword

// Controller for Changing Password
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


// exports.changePassword = async (req, res) => {
//     try {
//       // Get user data from req.user
//       const userDetails = await User.findById(req.user.id)
  
//       // Get old password, new password, and confirm new password from req.body
//       const { oldPassword, newPassword } = req.body
  
//       // Validate old password
//       const isPasswordMatch = await bcrypt.compare(
//         oldPassword,
//         userDetails.password
//       )
//       if (!isPasswordMatch) {
//         // If old password does not match, return a 401 (Unauthorized) error
//         return res
//           .status(401)
//           .json({ success: false, message: "The password is incorrect" })
//       }
  
//       // Update password
//       const encryptedPassword = await bcrypt.hash(newPassword, 10)
//       const updatedUserDetails = await User.findByIdAndUpdate(
//         req.user.id,
//         { password: encryptedPassword },
//         { new: true }
//       )
  
//       // Send notification email
//       try {
//         const emailResponse = await mailSender(
//           updatedUserDetails.email,
//           "Password for your account has been updated",
//           passwordUpdated(
//             updatedUserDetails.email,
//             `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
//           )
//         )
//         console.log("Email sent successfully:", emailResponse.response)
//       } catch (error) {
//         // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
//         console.error("Error occurred while sending email:", error)
//         return res.status(500).json({
//           success: false,
//           message: "Error occurred while sending email",
//           error: error.message,
//         })
//       }
  
//       // Return success response
//       return res
//         .status(200)
//         .json({ success: true, message: "Password updated successfully" })
//     } catch (error) {
//       // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
//       console.error("Error occurred while updating password:", error)
//       return res.status(500).json({
//         success: false,
//         message: "Error occurred while updating password",
//         error: error.message,
//       })
//     }
//   }
