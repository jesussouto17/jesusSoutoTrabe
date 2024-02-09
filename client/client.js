import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import bodyParser from 'body-parser';
import fs from 'fs';
import cheerio from 'cheerio';

const URL_TEST = 'http://localhost:4000/test';

var tokenAutentication;

function clear() {
    tokenAutentication = "";
}

const data = {
    "username": "victor",
    "password": "writer"
}

async function addUser(data) {

    const response = await fetch('http://localhost:3000/auth/register', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let json = await response.json();
    let status = response.status;
    if (status == 201) {
        status = await loginUser(data);
    }
    return status;
}

async function loginUser(data) {

    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let json = await response.json();
    let status = response.status;

    if (status == 200) {
        let {
            token
        } = json;
        tokenAutentication = token;
    }
    return status;
}

async function test() {

    const response = await fetch('http://localhost:5000/test', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'token': tokenAutentication
        }
    });

    let json = await response.json();
    let status = response.status;
    console.log("test: " + status);

    let html;
    if (status == 200) {
        let {
            message
        } = json;
        html = fs.readFileSync(ROOT_PATH + '/response.html', 'utf8')
        let $ = cheerio.load(html);
        let mensajeHtml = "<span>" + message + "</span>";
        $('#text').replaceWith(mensajeHtml);
        return $.html();
    } else {
        html = fs.readFileSync(ROOT_PATH + '/responseError.html', 'utf8')
        return html;
    }
}

//Server
const app = express();
const ROOT_PATH = path.resolve() + '/views';

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set("port", 4000);
app.listen(app.get("port"));
console.log("server running in port", app.get("port"));

app.get("/", (req, res, next) => {
    fs.readFile(ROOT_PATH + '/index.html', 'utf8', function(err, text) {
        clear();
        res.send(text);
    });
});

app.get("/close", (req, res, next) => async function() {
    try{
        let html = await close();
        res.send(html);
    }catch (error) {
        res.status(500).json({
            error: 'Login failed'
        });
    }
});

app.get("/register", (req, res, next) => {
    fs.readFile(ROOT_PATH + '/registration.html', 'utf8', function(err, text) {
        res.send(text);
    });
});

app.post('/register', async (req, res) => {
    try{
        let data = req.body;
        let status = await addUser(data);
        console.log("register:" + status);

        if (status == 200) {
            res.send({
                'status': status,
                'url': URL_TEST
            });
        } else {
            res.send({
                'status': status,
                'error': 'Invalid login or password'
            });
        }

    }catch (error) {
        console.log("register: 500");
        res.status(500).json({
            error: 'Register failed'
        });
    }
});

app.get("/login", (req, res, next) => {
    fs.readFile(ROOT_PATH + '/login.html', 'utf8', function(err, text) {
        res.send(text);
    });
});

app.post('/login', async (req, res) => {
    try{
        let data = req.body;
        let status = await loginUser(data);

        console.log("login: " + status);
        if (status == 200) {
            res.send({
                'status': status,
                'url': URL_TEST
            });
        } else {
            res.send({
                'status': status,
                'error': 'Invalid login or password'
            });
        }
    }catch (error) {
        console.log("Login: 500");
        res.status(500).json({
            error: 'Login failed'
        });
    }
});

app.get("/test", async (req, res) => {
    try{
        let response = await test();
        res.send(response);

    }catch (error) {
        console.log("Test: 500");
        res.status(500).json({
            error: 'Test failed'
        });
    }
});