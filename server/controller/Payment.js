const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/MailSend");
const { courseEnrollmentEmail } = require("../mail/Template/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const crypto = require("crypto");
const { console } = require("inspector");

// capture the payment and initiate the Razorpay payment

exports.capturePayment = async (req, res) => {
    // get couseID and userID  
    const { course_id } = req.body;
    const { userID } = req.user.id;
    // validation
    if (!course_id || !userID) {
        return res.status(400).json({ message: "Please provide a valid course id and user id ", success: false });
    }
    // valid courseID 


    //valid courseDetails
    let course;
    try {
        course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: "Course not found", success: false });
        }
        // user is enrolled in the course or not
        const uid = new mongoose.Types.ObjectId(userID);

        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: "User is already enrolde"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false, error: error.message });

    }

    // create order
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency: currency,
        receipt: Math.random(Date.now()).toString().substring(0, 7).toUpperCase().replace(".", ""),
        notes: {
            course_id: course_id,
            userID: userID
        }
    };
    try {
        // initiate payment use razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        // return response
        return res.status(200).json({ success: true, data: paymentResponse , 
            courseName:course.courseName,
            courseDescription:course.description,
            thumbnail:course.thumbnail,
            price:course.price,
            currency:paymentResponse.currency,
            orderID:paymentResponse.id,
            amount:paymentResponse.amount,
            // receipt:paymentResponse.receipt,
            message: "Payment initiated successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Colud not initiate order ", success: false, error: error.message });

    }

};


/// verify the payment and enroll the user in the course

exports.verifySignature = async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");



    if(signature == digest){
        console.log("Payment is Authorized");
        const {course_id,userID} = req.body.payload.payment.entity.notes;

        try {
            // fulfill the action
            // find the course and student in it 
            const enrolledCourse = await Course.findOneAndUpdate({_id:course_id},{
                $push:{studentsEnrolled:userID}
            },{new:true});

            // verify the  enrolled course 
            if (!enrolledCourse) {
                return res.status(404).json({ message: "Course not found", success: false });
                
            }
            console.log(enrolledCourse);    

            // find the student and  add our course to their list of enrolled courses
            const enrolledStudent = await User.findOneAndUpdate({_id:userID},{
                $push:{cources:course_id}
            },{new:true});
            if (!enrolledStudent) {
                return res.status(404).json({ message: "User not found", success: false });
                
            }
            console.log(enrolledStudent);
            // send email to the student    
            const emailResponse = await mailSender({
                to:enrolledStudent.email,
                subject:"Course Enrollment",
                text:courseEnrollmentEmail(enrolledStudent.firstName,enrolledCourse.courseName)
            });
            console.log(emailResponse);

            return res.status(200).json({success:true,message:"Course enrolled successfully",data:enrolledCourse});
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message:error.message, success: false,  });
            
        }
       
    }else{
        console.log("Payment is not Authorized");
        return res.status(403).json({message:"Payment is not Authorized",success:false});
    } 

};