const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/get', async(req,resp)=>{
    try {
        console.log('Working....');
        
        return resp.status(200).json({msg:"working!"})
        
    } catch (error) {
        console.log(error,'error----');
        
        return resp.status(500).json({msg:"Something went wrong!"})
    }
});

module.exports = router;
