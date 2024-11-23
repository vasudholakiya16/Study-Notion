const Section = require('../models/Section');
const Course = require('../models/Course'); 


// CREATE a new section
exports.createSection = async (req, res) => {
	try {
		// Extract the required properties from the request body
		const { sectionName, courseId } = req.body;

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json({
				success: false,
				message: "Missing required properties",
			});
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourseDetail = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

            console.log(updatedCourseDetail);

		// Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourseDetail,
		});
	} catch (error) {
		// Handle errors
		res.status(500).json({
			success: false,
			message: "Unable to create section, please try again",
			error: error.message,
		});
	}
};


// update a section

exports.updateSection = async (req, res) => {
    try {

        // data input 
        const { sectionName, sectionId } = req.body;
        //data validation
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties",
            });
        }
        // update the data 
        const section= await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });
        // return the response
        res.status(200).json({
            success: true,
            message: "Section updated successfully",
            section,
        });
        
    } catch (error) {
        // Handle errors
		
		res.status(500).json({
			success: false,
			message: "Unable to create section, please try again",
			error: error.message,
		});
    }
};

// delete a section

exports.deleteSection = async (req, res) => {
    try {

        // get id- assuming the id is in the request body
        const { sectionId } = req.params ;

        // findbyid and delete function
        await Section.findByIdAndDelete(sectionId);
        // send response    
        res.status(200).json({
            success: true,
            message: "Section deleted successfully",
        });
        
    } catch (error) {
        // Handle errors
        res.status(500).json({
            success: false,
            message: "Unable to delete section, please try again",
            error: error.message,
        }); 
    }
};
