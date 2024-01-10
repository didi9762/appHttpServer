import { log } from 'console';
import jwt from 'jsonwebtoken';
import url from 'url'

 async function verifyToken(req,next) {
    let token = req.headers.authorization;
    if(!token){
    const query = url.parse(req.url, true).query;
    token = query.token;}
  if (!token){console.log('token error no token');return false}
  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {console.log('error token:',err);return false}
    return next(decoded.name);
      });
}

const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.TOKEN_KEY, { expiresIn: '1h' });
  return token;
};

export {verifyToken,generateToken}