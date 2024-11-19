const jwt = require('jsonwebtoken');
require('dotenv').config(); 
const User = require('../models/User');



// auth 

exports.auth = async (req, res, next) => {
    try {
        // extract token from header
        const token = req.cookies.token || req.body.token ||req.headers['Authorisation'].replace("Bearer", "") || req.headers.authorization.split(' ')[1];

        // if token is missing , return responce 
        if(!token){
            return res.status(401).json({message: "Token is missing",sucess: false});
        }

        // verify token, in basic of secret key

        try {
            const decoad =  jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded token is :- ", decoad);
            req.user = decoad;
            
        } catch (error) {
            // verification failed

            console.log("Error is :- ", error);
            return res.status(401).json({message: "Invalid token", success: false});  
        }
        next();
             
    } catch (error) {

        console.log("Error is :- ", error);
        return res.status(401).json({message: "Something went wrong while validating token", success: false});
        
    }
};

// student 

exports.isStudent = async (req, res, next) => {
    try {

        if (req.user.accountType !== "student") {
            return res.status(403).json({message: "You are not authorized to access this route, Because of this is protected rout for student only", success: false});
        }
        next(); 
    } catch (error) {
        console.log("Error is :- ", error);
        return res.status(500).json({message: "Something went wrong while validating student", success: false});
        
    }
};
// isInstructor

exports.isInstructor = async (req, res, next) => {
    try {

        if (req.user.accountType !== "instructor") {
            return res.status(403).json({message: "You are not authorized to access this route, Because of this is protected rout for instructor only", success: false});
        }
        next(); 
    } catch (error) {
        console.log("Error is :- ", error);
        return res.status(500).json({message: "Something went wrong while validating instructor", success: false});
        
    }
}
// isAdmin

exports.isAdmin = async (req, res, next) => {
    try {

        if (req.user.accountType !== "admin") {
            return res.status(403).json({message: "You are not authorized to access this route, Because of this is protected rout for admin only", success: false});
        }
        next(); 
    } catch (error) {
        console.log("Error is :- ", error);
        return res.status(500).json({message: "Something went wrong while validating admin", success: false});
        
    }
}