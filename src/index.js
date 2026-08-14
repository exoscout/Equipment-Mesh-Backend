const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");d

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


//routes
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes"); 

app.get('/', (req, res) => {
    console.log('Received a request to the root route');
    res.redirect('/api');
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});






