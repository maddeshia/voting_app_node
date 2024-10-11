const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) =>{

    // first check request headers has authorization or not 
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(404).json({err:'Token not found'})
    }

    // Extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({errot:'Unauthorized'})
    }

    try {
        // Verify the jwt token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Attach user information to the request object
        req.user = decoded
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({error:'Invalid token'})
    }
}


//  Function to generate JWT token
const generateToken = (userdata) =>{
    // Generate a new JWT token using user data
    return jwt.sign(userdata, process.env.JWT_SECRET_KEY, {expiresIn:'1d'});
}

module.exports = {jwtAuthMiddleware, generateToken }