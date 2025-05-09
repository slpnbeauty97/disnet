const fetch = require('node-fetch'); // Correct usage of `node-fetch` v2
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.post('/create-order', async (req, res) => {
    const order = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: '1200.00', // Replace with your price
                },
            },
        ],
    };

    try {
        const accessToken = await getPayPalAccessToken(); // Fetch dynamic token

        const response = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(order),
        });

        const data = await response.json();
        console.log('PayPal Response:', data);  // Log the PayPal response for debugging

        if (response.ok && data.id) {
            res.json(data);
        } else {
            console.log('Error creating PayPal order:', data); // Log specific error response
            res.status(400).json({ error: 'Failed to create PayPal order', details: data });
        }
    } catch (err) {
        console.error('Error creating PayPal order:', err); // Log any errors thrown during the process
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID; // Ensure your environment variables are set correctly
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (response.ok) {
        return data.access_token;  // Return the access token
    } else {
        throw new Error(`Failed to retrieve PayPal access token: ${data.error_description}`);
    }
}
