const axios = require("axios");

// Test URL validation endpoint
async function testUrlValidation() {
  const API_BASE = "http://localhost:5001/api";

  console.log("🧪 Testing URL Validation Endpoint...\n");

  const testCases = [
    {
      description: "Empty URL",
      url: "",
      expectedStatus: 400,
    },
    {
      description: "Invalid URL format",
      url: "not-a-url",
      expectedStatus: 400,
    },
    {
      description: "Valid image URL with extension",
      url: "https://example.com/image.jpg",
      expectedStatus: 200,
    },
    {
      description: "Valid Cloudinary URL",
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      expectedStatus: 200,
    },
    {
      description: "URL without image extension",
      url: "https://google.com",
      expectedStatus: 400,
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.description}`);
      console.log(`URL: ${testCase.url || "(empty)"}`);

      const response = await axios.post(
        `${API_BASE}/upload/validate-url`,
        {
          url: testCase.url,
        },
        {
          headers: {
            Authorization: "Bearer your-test-token-here", // Replace with valid token
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Status: ${response.status}`);
      console.log(`   Response: ${response.data.message}`);

      if (response.status === testCase.expectedStatus) {
        console.log(`✅ Expected status ${testCase.expectedStatus} - PASSED\n`);
      } else {
        console.log(
          `❌ Expected status ${testCase.expectedStatus}, got ${response.status} - FAILED\n`
        );
      }
    } catch (error) {
      console.log(`Status: ${error.response?.status || "Error"}`);
      console.log(
        `Response: ${error.response?.data?.message || error.message}`
      );

      if (error.response?.status === testCase.expectedStatus) {
        console.log(`✅ Expected status ${testCase.expectedStatus} - PASSED\n`);
      } else {
        console.log(
          `❌ Expected status ${testCase.expectedStatus}, got ${
            error.response?.status || "Error"
          } - FAILED\n`
        );
      }
    }
  }
}

// Only run if called directly
if (require.main === module) {
  testUrlValidation().catch(console.error);
}

module.exports = { testUrlValidation };
