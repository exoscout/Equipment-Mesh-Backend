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

app.use((err, res,req, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

//routes
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes"); 

app.get('/', (req, res) => {
    console.log('Received a request to the root route');
    res.redirect('/api');
});




