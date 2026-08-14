const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    phone : {
        type: String,
        required: true,
        unique: true,
    },
    status : {
        state :{
            type: String,
            enum: ['active', 'restricted', 'banned'],
            default: 'active',
        },
        banExpires : {
            type: Date,
            default: null
        }
    },
    password : {
        type: String,
        required: true,
        select: false
    },
    address : {
        type: String,
    
    },
    rating : {
        type: Number,
        min: 1,
        max: 5,
    },
    reviews : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],

})



module.exports = {
    User : mongoose.model('User', userSchema),
}