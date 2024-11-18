const mongoose = require('mongoose');
const { type } = require('server/reply');
const courseProgressSchema = new mongoose.Schema({
   courseID: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Course',
   },
   comppletedVideos: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:'SubSection',
    }
   ]  
});
// export model user with CourseProgressSchema
module.exports = mongoose.model('CourseProgress', courseProgressSchema);