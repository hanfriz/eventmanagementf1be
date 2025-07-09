# Event Management API Documentation

This directory contains the API documentation for the Event Management system using Scalar.

## Files

- `api-spec.yaml` - OpenAPI 3.0 specification file containing all API endpoints
- `scalar.config.json` - Scalar configuration file
- `introduction.md` - Introduction and overview documentation
- `index.html` - Static HTML file for viewing documentation

## Usage

### 1. View Documentation Locally

You can view the documentation in several ways:

#### Option A: Using npm script (Recommended)

```bash
npm run docs
```

This will start a local server at `http://localhost:3001` with the documentation.

#### Option B: Using static HTML

Open `docs/index.html` in your browser. Note: You may need to serve it through a local server due to CORS restrictions.

#### Option C: Using a simple HTTP server

```bash
cd docs
npx serve .
```

### 2. Generate Static Documentation

```bash
npm run docs:build
```

This will generate a static HTML bundle in `docs/index.html`.

### 3. Update Documentation

When you make changes to the API:

1. Update the route files in `src/routes/`
2. Update the corresponding endpoints in `api-spec.yaml`
3. Update any relevant information in `introduction.md`
4. Test the documentation by running `npm run docs`

## API Endpoints Coverage

The documentation includes:

- **Authentication** (`/auth`) - Login, register, logout
- **Events** (`/events`) - CRUD operations, search, categories
- **Users** (`/users`) - Profile management, statistics
- **Transactions** (`/transactions`) - Bookings, payments, history
- **Reviews** (`/reviews`) - Event reviews and ratings
- **Promotions** (`/promotions`) - Discount codes and promotions
- **Upload** (`/upload`) - File and image upload

## Configuration

### Scalar Configuration

The `scalar.config.json` file contains:

- Subdomain for hosted documentation
- Reference to the OpenAPI spec file
- Guides and introduction pages

### OpenAPI Specification

The `api-spec.yaml` file includes:

- Complete API endpoint definitions
- Request/response schemas
- Authentication requirements
- Example requests and responses

## Development

When adding new endpoints:

1. Add the route in the appropriate file under `src/routes/`
2. Add the endpoint definition to `api-spec.yaml`
3. Include proper:
   - Tags for organization
   - Security requirements
   - Request/response schemas
   - Example data
   - Error responses

## Hosting

For production deployment, you can:

1. **Static hosting**: Deploy the generated HTML files to any static hosting service
2. **Scalar Cloud**: Use the subdomain configuration in `scalar.config.json`
3. **Custom server**: Integrate Scalar into your main application

## Maintenance

- Keep the OpenAPI spec in sync with actual API changes
- Update version numbers when releasing new API versions
- Review and update examples regularly
- Ensure all new endpoints are documented

## Support

For issues with the documentation:

- Check that all file paths in configurations are correct
- Ensure the OpenAPI spec is valid YAML
- Verify that examples match actual API behavior
