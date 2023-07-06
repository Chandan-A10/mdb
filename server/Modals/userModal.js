const mongoose = require("mongoose")
const userSchema = mongoose.Schema

const productSchema = new userSchema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true,
    },
    publishedBy: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true
    }
})

const users = new userSchema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required:true,
        enum: ["customer", "vendor", "admin"]
    },
    cart: {
        type: [productSchema],
    },
    drafted: {
        type: [productSchema],
    },
    published: {
        type: [productSchema],
    }
}, {
    collection: 'userData'
})

module.exports = mongoose.model('users', users)