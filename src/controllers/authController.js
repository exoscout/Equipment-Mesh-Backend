const { User } = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/appError.js');

const registerUser = async (req, res) => {

    const { name, email, phone, password, address } = req.body;

    if(!name || !email || !phone || !password) {
        throw new AppError('All fields are required', 400);
    }

    const existingUser = await User.findOne({ email });
    if(existingUser) {
        throw new AppError('Email already registered', 409);
    }

    const existingPhone = await User.findOne({ phone });
    if(existingPhone) {
        throw new AppError('Phone number already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        phone,
        password: hashedPassword,
        address: address || undefined
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if(!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '72h' });

    res.status(200).json({ message: 'User logged in successfully', token });

}


module.exports = {
    registerUser,
    loginUser,
}