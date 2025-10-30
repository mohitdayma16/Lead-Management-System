const jwt = require('jsonwebtoken');
module.exports = function(req,res,next){
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
  if(!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
    req.user = decoded;
    next();
  }catch(err){
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
