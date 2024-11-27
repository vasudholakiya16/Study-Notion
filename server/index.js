const express = require('express');
const app = express();

const userRouter = require('./routes/user');
const profileRouter = require('./routes/profile');
const paymentRouter = require('./routes/Payments');
const courseRouter = require('./routes/course');

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');   
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT || 4000;


// Connect to database
database.connect();
// add middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

// cloudinary connection
cloudinaryConnect();

// add routes
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/payment', paymentRouter);

// set a default route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the e-learning platform',
        success:true,


    });
});
// activate the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});