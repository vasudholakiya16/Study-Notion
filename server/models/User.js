const mongoose = require('mongoose');
const { type } = require('server/reply');
const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        enum: ['Admin', 'Student', 'Instructor'],
        required: true,
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Profile',
    },
    cources: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        }
    ],
    image: {
        type: String,
        required: true,
    },
    token:{
        type:String,

    },
    resetPasswordExpires:{
        type:Date,
        
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourseProgress',
        }
    ],

});

// export model user with UserSchema    

module.exports = mongoose.model('User', userSchema);
