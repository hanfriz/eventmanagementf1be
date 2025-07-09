const fs = require("fs");
const yaml = require("js-yaml");

try {
  const fileContents = fs.readFileSync("./docs/api-spec.yaml", "utf8");
  const data = yaml.load(fileContents);

  console.log("✅ OpenAPI Spec is valid YAML");
  console.log(`📋 Title: ${data.info.title}`);
  console.log(`🔢 Version: ${data.info.version}`);
  console.log(`📡 Servers: ${data.servers.length} configured`);
  console.log(`🏷️  Tags: ${data.tags.length} categories`);

  const pathCount = Object.keys(data.paths).length;
  console.log(`🛣️  Endpoints: ${pathCount} paths documented`);

  // List all endpoints
  console.log("\n📚 Documented Endpoints:");
  Object.keys(data.paths).forEach((path) => {
    const methods = Object.keys(data.paths[path]);
    methods.forEach((method) => {
      if (method !== "parameters") {
        const endpoint = data.paths[path][method];
        console.log(
          `  ${method.toUpperCase()} ${path} - ${
            endpoint.summary || "No summary"
          }`
        );
      }
    });
  });

  console.log("\n🎉 API Documentation is ready!");
  console.log('💡 Run "npm run docs" to start the documentation server');
} catch (error) {
  console.error("❌ Error validating OpenAPI spec:", error.message);
}
