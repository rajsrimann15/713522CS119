const asyncHandler = require("express-async-handler");
const axios = require("axios");

const WINDOW_SIZE = 10;
let numberWindow = [];
const BASE_URL = "http://20.244.56.144/test"; // test
const AUTH_URL = "http://20.244.56.144/test/auth"; // Aut

let accessToken = null; // Store access token

// Credentials for authentication
const credentials = {
    companyName: "DadCode",
    clientID: "50c9f3b2-aef2-47d3-9d5c-648bee8d7f54",
    clientSecret: "scUHTFcfRQycJRaH",
    ownerName: "Raj Srimann",
    ownerEmail: "rajsrimann.k.cse.2022@snsct.org",
    rollNo: "713522CS119"
};

// Mapping single-character types to API endpoints
const TYPE_MAPPING = {
    even: "even",
    primes: "primes",
    fibonacci: "fibonacci",
    random: "random"
};

// Function to obtain an access token
const getAccessToken = async () => {
    try {
        const response = await axios.post(AUTH_URL, credentials);
        accessToken = response.data.access_token;
        console.log("Access token obtained:", accessToken);
    } catch (error) {
        console.error("Error obtaining access token:", error.message);
        accessToken = null;
    }
};

// Function to fetch numbers from the test server
const fetchNumbersFromServer = async (type) => {
    if (!accessToken) {
        await getAccessToken(); 
        if (!accessToken) return [];
    }

    try {
        const response = await axios.get(`${BASE_URL}/${type}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: 500
        });

        if (!response.data || !Array.isArray(response.data.numbers)) {
            throw new Error("Invalid response from API");
        }

        return response.data.numbers;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("Access token expired, refreshing token...");
            await getAccessToken();
            return fetchNumbersFromServer(type); 
        }

        console.error(`Error fetching ${type} numbers:`, error.message);
        return [];
    }
};

// Common function to update the sliding window and send response
const processNumbers = asyncHandler(async (req, res) => {
    const { numberid } = req.params;
    const type = TYPE_MAPPING[numberid];

    if (!type) {
        return res.status(400).json({ error: "Invalid number type. Use e, p, f, or r." });
    }

    console.log(`Received request for type: ${type}`);

    const prevState = [...numberWindow];

    // Fetch numbers from test server
    let newNumbers = await fetchNumbersFromServer(type);

    // Ensure uniqueness
    newNumbers = newNumbers.filter(num => !numberWindow.includes(num));

    // Maintain window size
    numberWindow.push(...newNumbers);
    numberWindow = numberWindow.slice(-WINDOW_SIZE);

    // Calculate average
    const avg = numberWindow.length > 0
        ? (numberWindow.reduce((sum, num) => sum + num, 0) / numberWindow.length).toFixed(2)
        : "N/A";

    res.json({
        windowPrevState: prevState,
        windowCurrState: numberWindow,
        numbers: newNumbers,
        avg
    });
});

module.exports = { processNumbers };
