function isAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader || authHeader !== 'hello') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }

 //....... JSON WEB TOKEN ............
 const createToken = (payload) => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    return jwt.sign(payload, jwtSecretKey, { expiresIn: "3d" });
  };  

  module.exports= {isAdmin, createToken};
