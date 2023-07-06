const mongoose = require("mongoose")
const productSchema = mongoose.Schema

const products = new productSchema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true,
    },
    publishedBy:{
        type:String,
        required:true,
    },
    publishedDate:{
        type:Date,
        required:true
    }
},{
    collection:'productData',
})


module.exports= mongoose.model('products',products)