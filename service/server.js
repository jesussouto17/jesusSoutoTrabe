import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

//Server
const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json())
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}/`);
});

app.post('/test', async (req, res) => {
    try{
        let {
            token
        } = req.headers;

        console.log("Testing with token: " + token);

        let access = await validate(token);
        if (access) {
            res.status(200).json({
                message: 'This is a message from the service'
            });
        } else {
            res.status(401).json({
                error: 'Invalid token'
            });
        }
    }catch (error) {
        console.log("test: 500");
        res.status(500).json({
            error: 'Test failed'
        });
    }   
});

async function validate(token) {

    const response = await fetch('http://localhost:3000/auth/protected', {
        method: 'GET',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    });

    let validateStatus = response.status;
    return validateStatus == 200;
}