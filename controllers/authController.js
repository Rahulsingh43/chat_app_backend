const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try { 
        console.log('willchanged');
        
        const { userName, email, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);

        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length) return res.status(400).json({ message: 'Email ID taken' });
      
        await db.query('INSERT INTO users (userName, email, password) VALUES (?, ?, ?)', [userName, email, hashed]);
        res.status(200).json({status:'success', message: 'Registered' });
    } catch (error) {
        
        res.status(500).json({status:'error', message: error || 'Something went wrong' });
    }

};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
      
        const token = jwt.sign({ id: user.id, email: user.email,userName:user.userName }, process.env.JWT_SECRET);
        res.status(200).json({status:'success',message:"Login successfuly", token,user });
    } catch (error) {
        res.status(500).json({status:'error', message: 'Something went wrong' });
    }
};

module.exports = { register, login };
