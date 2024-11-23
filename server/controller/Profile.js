const Profile = require('../models/ProfileModel');
const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
// get data 
const {dateOfBirth= "", about="",contactNumber,gender }= req.body;
// get userID
const id = req.user.id;
// validate data
if(!contactNumber|| !gender|| !id){
    return res.status(400).json({message: "Please provide all the details", success: false});
}
// find profile by userID
const userDetails = await User.findById(id);
if(!userDetails){
    return res.status(404).json({message: "User not found, Place Try again", success: false});
}
const profileID = userDetails.additionalDetails;

if(!profileID){
    return res.status(404).json({message: "Profile not found, Place Try again", success: false});
}

const profileDetails = await Profile.findById(profileID);
if(!profileDetails){
    return res.status(404).json({message: "Profile not found, Place Try again", success: false});
}


// update profile
profileDetails.dateOfBirth = dateOfBirth;
profileDetails.about = about;
profileDetails.contactNumber = contactNumber;
profileDetails.gender = gender;

await profileDetails.save();


// return response

return res.status(200).json({message: "Profile updated successfully", success: true, data: profileDetails});

        
    } catch (error) {
        console.log("Error is :- ", error);
        return res.status(500).json({message: "Something went wrong while updating profile", success: false});  

        
    }
};


// delete account

exports.deleteAccount = async (req, res)=>{
    try {
        // get userID
        const id = req.user.id;
        // check if our id is valid or not
       const userDetails = await User.findById(id); 
         if(!userDetails){
            return res.status(404).json({message: "User not found, Place Try again", success: false}); }
        // delete user profile 
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});

// unenroll user from all the courses 
        // delete user from all the courses
        
        // delete user
        await User.findByIdAndDelete({_id: id});
        // return response
        return res.status(200).json({message: "Account deleted successfully", success: true});
    } catch (error) {
        console.log("Error is :- ", error);
        return res.status(500).json({message: "Something went wrong while deleting account", success: false});
        
    }


    
}

// get all user details

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;// get userID from token
    const userDetails = await User.findById(id)// find user by id
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
