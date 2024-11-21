const cloudinary = require('cloudinary').v2

// create course handler function

exports.uploadImageToCloudinary = async (file, folder,height,quality) => {

    const options = {
        folder,
    };
    if (height) {
        options.height = height;
    }
    if (quality) {
        options.quality = quality;
    }
    options.resource_type = 'auto';

    return await cloudinary.uploader.upload(file.tempFilePath, options);

    // try {
    //     cloudinary.config({
    //         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //         api_key: process.env.CLOUDINARY_API_KEY,
    //         api_secret: process.env.CLOUDINARY_API_SECRET,
    //     });
    //     console.log('Connected to Cloudinary');
    // }
    // catch (err) {
    //     console.log('Failed to connect to Cloudinary', err);
    //     process.exit(1);
    // }

};