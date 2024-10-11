const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the Person schema
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },

    email:{
        type:String         
    },

    mobile:{
        type:String
    },

    address:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },

    isVoted:{
        type:Boolean,
        default:false
    }

},{timestamps:true});


userSchema.pre('save', async function(next){
    const person = this;

    // Hash the password only if it has been modified (or is new)
    if (!person.isModified('password')) {
        return next()
    }

    try {
        // Hash password generation
        const salt = await bcrypt.genSalt(10);

        // Hash password
        const hashedPassword = await bcrypt.hash(person.password,salt);

        // Overide the plain password with the hashed one
        person.password = hashedPassword;
        next();

    } catch (error) {
        return next(error);
    }

})


userSchema.methods.comparePassword = async function(candidatePassword){
    try {
        // Use bcrypt to compare the provide password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
}


const User = mongoose.model('User', userSchema);
module.exports = User;