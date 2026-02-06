const axios = require('axios');

const testApi = async () => {
    const url = "https://urban-backend-28dc.onrender.com/api/v1/property/calculate-tax";
    const payload = {
        propertyType: "residential",
        area: 120,
        ward: "Ward 1",
        constructionType: "rcc",
        occupancyType: "self"
    };

    try {
        console.log('Sending request to:', url);
        // Note: We don't have a valid token here, so it should return 401/403 if it hits middleware.
        // But if it crashes BEFORE middleware (unlikely) or in the logic, we might see it.
        // Actually, let's try a health check on the specific property routes if possible.
        const response = await axios.post(url, payload).catch(err => err.response);

        console.log('Status:', response?.status);
        console.log('Data:', response?.data);
    } catch (error) {
        console.error('Fetch Error:', error.message);
    }
};

testApi();
