const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Serve static files from docs directory
app.use(express.static(path.join(__dirname, "docs")));

// Serve YAML file with correct content type
app.get("/api-spec.yaml", (req, res) => {
  res.set("Content-Type", "text/yaml");
  res.sendFile(path.join(__dirname, "docs", "api-spec.yaml"));
});

// Serve config file
app.get("/scalar.config.json", (req, res) => {
  res.set("Content-Type", "application/json");
  res.sendFile(path.join(__dirname, "docs", "scalar.config.json"));
});

// Serve main documentation page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `📚 API Documentation server running at http://localhost:${PORT}`
  );
  console.log(`📖 Open your browser and visit: http://localhost:${PORT}`);
});
