const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


//routes
const userRoutes = require("./routes/user.routes");
const itemRoutes = require("./routes/item.routes");
const requestRoutes = require("./routes/request.routes");
const negotiationRoutes = require("./routes/negotiation.routes");
const transactionRoutes = require("./routes/transaction.routes");
const conditionCardRoutes = require("./routes/conditionCard.routes");
const reviewRoutes = require("./routes/review.routes");
const reportDisputeRoutes = require("./routes/reportDispute.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/condition-cards', conditionCardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/issues', reportDisputeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    console.log('Received a request to the root route');
    res.redirect('/api');
});

app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Equipment Mesh API is running' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});

module.exports = app;






