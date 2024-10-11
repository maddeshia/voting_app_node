const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Candidate = require('../models/candidate');
const {jwtAuthMiddleware } = require('../jwt');


// check user are admin 
const checkAdmin = async (userID) => {
    try{
         const user = await User.findById(userID);
         if(user.role === 'admin'){
             return true;
         }
    }catch(err){
         return false;
    }
}



// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async(req,res)=>{
    try {
        if(!(await checkAdmin(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'});

        const data = req.body // Assuming the request body contains the candidate data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    
        
    } catch (error) {
        res.status(500).json({error:'Internal server error'})
    }
});

 

// Put method to the update candidate
router.put('/:candidateId', jwtAuthMiddleware, async(req, res)=>{
    try {
        if(!(await checkAdmin(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'});

        const candidateId = req.params.candidateId;    // Extract the id from the url parameter
        const candidateData = req.body;    // Update data for the person

        const response = await Candidate.findByIdAndUpdate(candidateId, candidateData,{
            new:true,  // return the update document
            runValidators:true  // run mongoose validation
        })

        if (!response) {
            return res.status(404).json({error:'candidate not found'})
        }

        console.log('candidate data updated');
        res.status(200).json({msg:"Data Successfully Updated",response});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal server err'})
    }
});



// Delete method to the Delete candidate
router.delete('/:candidateId', jwtAuthMiddleware, async(req, res)=>{
    try {
        if (!(await checkAdmin(req.user.id))) {
            return res.status(403).json({msg:'user does not have admin role'})
        }

        const candidateId = req.params.candidateId;    // Extract the id from the url parameter

        const response = await Candidate.findByIdAndDelete(candidateId) 

        if (!response) {
            return res.status(404).json({error:'candidate not found'})
        }

        console.log('candidate data Deleted');
        res.status(200).json({msg:"Data Successfully Deleted",response});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:'Internal server err'})
    }
});



// let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    // no admin can vote
    // user can only vote once
    
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});



// vote count 
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});



// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Export router
module.exports = router;