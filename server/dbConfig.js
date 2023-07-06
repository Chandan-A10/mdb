const mongoose=require('mongoose')
require('dotenv').config()

module.exports =()=> mongoose.connect(process.env.db_URL).then((db)=>{
    console.log('db connected....')
}).catch((error)=>{
    console.log('Error connecting to database')
})