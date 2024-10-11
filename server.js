require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose')

const PORT =  3000;  // Server port Num

app.use(express.json())
const bodyParser = require('body-parser');
app.use(bodyParser.json());  // req.body



// Database connections... with MongoDB
const uri = process.env.MONGODB_URL
mongoose.connect(uri)
.then(()=> console.log("Connection Successful...."))
.catch((err)=>console.log("err"));



// Import the router files
const userRoutes = require('./routes/user.routes');
const candidateRoutes = require('./routes/candidate.routes');
   
// Use the routes
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);
 

// Server Connection...
app.listen(PORT, ()=>{
    console.log(`listening on port: ${PORT}`);
})
