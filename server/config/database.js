const mongoose = require('mongoose');
require('dotenv').config();

exports.connect = () => {

    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Database connection successful');
    }).catch(err => {
        console.log(err);
        console.error('Database connection error');
        process.exit(1);
    });
};

