const mongoose = require('mongoose');
const subSectionSchema = new mongoose.Schema({

    title: {
        type: String,
        
    },
    timeDuration: {
        type: String,
    },
    description:{
        type: String,
    },
    videoUrl:{
        type: String,
    },
   
});

// export model user with SubSectionSchema

module.exports = mongoose.model('SubSection', subSectionSchema);