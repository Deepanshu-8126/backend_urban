const axios = require('axios');

const testApi = async () => {
    const payloads = [
        {
            name: "Calculate Tax (POST)",
            url: "https://urban-backend-28dc.onrender.com/api/v1/property/calculate-tax",
            method: "POST",
            data: {
                propertyType: "residential",
                area: 120,
                ward: "Ward 1",
                constructionType: "rcc",
                occupancyType: "self"
            }
        },
        {
            name: "Nearby Properties (GET)",
            url: "https://urban-backend-28dc.onrender.com/api/v1/property",
            method: "GET"
        }
    ];

    for (const test of payloads) {
        console.log(`\nTesting: ${test.name}`);
        try {
            const config = {
                method: test.method,
                url: test.url,
                data: test.data || {}
            };
            const response = await axios(config).catch(err => err.response);

            console.log('Status:', response?.status);
            console.log('Success:', response?.data?.success);
            console.log('Error:', response?.data?.error);
        } catch (error) {
            console.error('Fetch Error:', error.message);
        }
    }
};

testApi();
