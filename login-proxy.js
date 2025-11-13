require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.disable("etag");

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// CORS setup for specific domains
app.use(cors({
    origin: ['https://www.z47.com', 'https://z47.webflow.io'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type'],
}));


app.get('/health', async (req, res) => {
    res.status(200).json({ message: 'health check passed' })
})

app.post('/login', async (req, res) => {
    const { username, password, ipin } = req.body;

    console.log('Requets body >>>', req.body)
    try {
        const response = await axios.get("https://investorportal.sg/newui/api/users/", {
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
                "username": username,
                "password": password,
                "ipin": ipin
            }
        });
        console.log('LOgin API: reposne >>', response.data);
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({
            message: err.response?.data || "Proxy login failed"
        });
    }
});

app.post('/forget-password', async (req, res) => {
    const { username } = req.body;

    try {
        const response = await axios.get("https://investorportal.sg/newui/api/forgetpassword/", {
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
                "username": username
            }
        });

        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({
            message: err.response?.data || "Proxy forget password failed"
        });
    }
});

app.post('/validate-reset-url', async (req, res) => {
    const { urlcode, type } = req.body;

    console.log('body:', urlcode, type)
    try {
        const response = await axios.post("https://investorportal.sg/newui/api/forgetpassword/", {
            urlcode,
            type
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        res.status(response.status).json({ data: response.data, updated: true });
    } catch (err) {
        res.status(err.response?.status || 500).json({
            message: err.response?.data || "Proxy validate reset url failed"
        });
    }
});

app.post('/update-password', async (req, res) => {
    const { password, confirm, urlcode, type } = req.body;

    try {
        const response = await axios.post("https://investorportal.sg/newui/api/forgetpassword/", {
            password,
            confirm,
            urlcode,
            type
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({
            message: err.response?.data || "Proxy update password failed"
        });
    }
});

app.listen(3000, () => {
    console.log('Proxy listening on http://localhost:3000');
});