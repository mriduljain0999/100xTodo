const JWT_SECRET = "halleluiya";
const jwt = require('jsonwebtoken')

function auth(req,res,next){
    const token = req.headers.token;
    const response = jwt.verify(token,JWT_SECRET);
   
    if(response){
        req.userId = response.userId
        next();
    }
    else{
        res.status(401).send("Unauthorized request: Token missing")
    }
}

module.exports = {
    auth,
    JWT_SECRET
}