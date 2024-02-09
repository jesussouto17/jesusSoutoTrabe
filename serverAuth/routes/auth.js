// routes/auth.js
const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');

let userList = [];

// User registration
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        let user = {
            username,
            password: hashedPassword
        };
        userList.push(user);
        console.log('Registrated user: ' + username);
        res.status(201).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Registration failed'
        });
        console.log('Registration failed');
    }
});

// User login
router.post('/login', async (req, res) => {
    try {

        const {
            username,
            password
        } = req.body;
        let user = findUserByUserName(username);

        if (!user) {
            return res.status(401).json({
                error: 'Authentication failed'
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                error: 'Authentication failed'
            });
        }
        const token = jwt.sign({
            userId: user._id
        }, 'your-secret-key', {
            expiresIn: '1min',
        });

        res.status(200).json({
            token
        });

    } catch (error) {
        res.status(500).json({
            error: 'Login failed'
        });
    }
});

// Protected route
router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({
        message: 'Protected route accessed'
    });
});

module.exports = router;

function findUserByUserName(username) {
    for (let user of userList) {
        //console.log(user);
        if (user.username == username) {
            return user;
        }
    }
}

module.exports = router;