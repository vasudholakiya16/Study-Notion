const Course = require('../models/Course');
const Tag = require('../models/Category');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/ImageUploader');

// create course handler function
exports.createCourse = async (req, res) => {
    try {
        // fetch data from req.body
        const { name, courseDescription, price, whatYouWillLearn, tag } = req.body;

        // get thumbnail image url
        const thumbnail = req.file.thumbnailImage;
        // add validation

        if (!name || !courseDescription || !price || !whatYouWillLearn || !tag || !thumbnail) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        // CHECK for instructor or not 
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log(instructorDetails);
        if (!instructorDetails) {
            return res.status(400).json({ success: false, message: 'You are not an instructor' });
        }

        // check for tag exist or not 
        const tagDetails = await Tag.findById(tag);
        if (!tagDetails) {
            return res.status(400).json({ success: false, message: 'Tag not found' });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.CLOUDINARY_COURSE_FOLDER);
        console.log(thumbnailImage);

        // create an entry in db
        const newCourse = await Course.create({
            name,
            courseDescription,
            price,
            whatYouWillLearn: whatYouWillLearn,
            tag: tagDetails._id,
            instructor: instructorDetails._id,
            thumbnailImage: thumbnailImage.secure_url,
        });
        console.log(newCourse);
        if (!newCourse) {
            return res.status(400).json({ success: false, message: 'Course not created' });
        }
        // add the new course to the userSchema of the instructor
         await User.findByIdAndUpdate({_id:intstructorDetails._id},
            {$push:{courses:newCourse._id}},{new:true});

        // update the tag schema
        await tagDetails.updateOne({$push:{courses:newCourse._id}}
            ,{new:true}, {upsert: true});
// // Add the new course to the Categories
//     const categoryDetails2 = await Category.findByIdAndUpdate(
//       { _id: category },
//       {
//         $push: {
//           courses: newCourse._id,
//         },
//       },
//       { new: true }
//     )
//     console.log("HEREEEEEEEE", categoryDetails2)


        // send response
        return res.status(200).json({ success: true, message: 'Course created successfully', newCourse });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message:"Failed to create course",error:error.message, });
        
    }
};


// get all courses handler function

exports.showAllCourses = async (req, res) => { 
    
    try {
        const allCourses = await Course.find({},{courseName:true,  price:true, thumbnail:true,instructor:true,ratingAndReviews:true,
            studentsEnrolled:true
        }).populate('instructor').exec();

        return res.status(200).json({ success: true, courses: allCourses, message: 'All courses return successfully ' });

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "No fetch course data ", error: error.message });
        
    }
};
