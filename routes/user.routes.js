const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


// POST route to add a person
router.post('/signup', async(req,res)=>{
    try {
        const data = req.body;  // Assuming the request body contains the person data

        // Create a new person document using the mongodb model
        const newUser = new User(data);

        // Save the new person to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id:response.id,
         }
        console.log(JSON.stringify(payload));
        
        // Generate token
        const token = generateToken(payload);
        console.log('Token is: ', token );

        res.status(200).json({response:response, token:token});
        
    } catch (error) {
        res.status(500).json({error:'Internal server error'})
    }
});




// Login Route
router.post('/login', async(req,res)=>{
    try {
        // Extract aadharCardNumber and password from req body
        const {aadharCardNumber, password} = req.body;

        // Find the user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber:aadharCardNumber});

        // If user does't exist or password does't match, return err
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({error:'Invalid aadharCardNumber or pass'})
        }

        // Generate Token
        const payload = {
            id:user.id,
         }
        const token = generateToken(payload);

        // return token as response
        res.json({msg :"Login Successful",token});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal Server Error'})
    }
});



// Profile route
router.get('/profile', jwtAuthMiddleware, async(req, res)=>{
    try {
        const userData = req.user
        const userId = userData.id;
        const user = await User.findById(userId);
        
        res.status(200).json({user});
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal server err'})
    }
});


 

// Put method to the update user
router.put('/profile/password', jwtAuthMiddleware, async(req, res)=>{
    try {
        // Extract the id from the token
        const userId = req.user.id;

        //Extract current and new password from new request body
        const{currentPassword, newPassword} = req.body;

        // Find the user by userId
        const user = await User.findById(userId);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({error:'Invalid currentPassword'})
        }

        // Update the user's password
        user.password = newPassword
        await user.save();

        console.log('password updated');
        res.status(200).json({msg:'password updated'});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal server err'})
    }
});



module.exports = router;