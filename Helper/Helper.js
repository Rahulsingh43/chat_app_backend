require('dotenv').config();
const jwt = require('jsonwebtoken');


const getUserFromToken = async (auth) => {
        // console.log(auth,'jjjjjjjjjjjjj');
       const token = auth;
       
       if (!token) return 'No name';
     
       try {
         const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        //  console.log(decoded,'ddddddddddddd');
         
         return decoded;
       } catch (err) {
        console.log(err);
        
        return 'something went wrong'
       }
    } 

module.exports = { getUserFromToken };