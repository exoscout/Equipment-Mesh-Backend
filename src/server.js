const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../.env")});


const PORT = process.env.PORT || 3000;
const app = require("./index");
const connectDB = require("./config/database");


const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server Running On Port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }

};

startServer();