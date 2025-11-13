require('dotenv').config();
const { Hono } = require('hono');
const { cors } = require('@hono/cors');

const app = new Hono();

app.use(
    '*',
    cors({
        origin: ['https://www.z47.com', 'https://z47.webflow.io'],
        allowMethods: ['POST'],
        allowHeaders: ['Content-Type'],
        credentials: true,
    })
);

// Disable caching for all responses
app.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
    await next();
});

// Health check
app.get('/health', (c) => c.json({ message: 'health check passed' }));

// Login proxy
app.post('/login', async (c) => {
    const { username, password, ipin } = await c.req.json();
    const res = await fetch('https://investorportal.sg/newui/api/users/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'username': username,
            'password': password,
            'ipin': ipin
        }
    });
    const data = await res.json();
    return c.json(data, res.status);
});

// Forget password proxy
app.post('/forget-password', async (c) => {
    const { username } = await c.req.json();
    const res = await fetch('https://investorportal.sg/newui/api/forgetpassword/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'username': username
        }
    });
    if (!res.ok) return c.json({ error: 'Failed to send forget password request' }, res.body);
    const data = await res.json();
    return c.json(data, res.status);
});

// Validate reset URL proxy
app.post('/validate-reset-url', async (c) => {
    const { urlcode, type } = await c.req.json();
    const res = await fetch('https://investorportal.sg/newui/api/forgetpassword/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urlcode, type })
    });
    const data = await res.json();
    return c.json({ data, updated: true }, res.status);
});

// Update password proxy
app.post('/update-password', async (c) => {
    const { password, confirm, urlcode, type } = await c.req.json();
    const res = await fetch('https://investorportal.sg/newui/api/forgetpassword/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, confirm, urlcode, type })
    });
    const data = await res.json();
    return c.json(data, res.status);
});

app.listen(3000, () => {
    console.log('Proxy listening on http://localhost:3000');
});