# Event Management API Documentation

Welcome to the Event Management API! This comprehensive RESTful API provides all the tools you need to build a modern event management platform.

## Overview

The Event Management API is a robust backend service that powers event booking, user authentication, payment processing, and content management. Built with Express.js, TypeScript, and Prisma ORM, it provides secure, scalable, and well-documented endpoints for your event management application.

## Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication system
- Role-based access control (User, Organizer)
- Secure password hashing and validation
- Session management

### 🎫 Event Management

- Create, read, update, and delete events
- Event categorization and search
- Location and venue management
- Event image upload and management
- Capacity and availability tracking

### 🎟️ Booking System

- Real-time ticket booking
- Multiple ticket types support
- Booking status tracking
- Automated availability management

### 💰 Payment Processing

- Secure payment handling
- Payment proof upload
- Transaction history
- Refund management

### 🎁 Promotions & Discounts

- Flexible promotion system
- Discount codes and coupons
- Usage limits and expiration dates
- Referral programs

### ⭐ Reviews & Ratings

- Event review system
- Star rating (1-5)
- Review moderation
- Rating analytics

### 📤 File Upload

- Image upload to Cloudinary
- File validation and security
- Optimized image delivery
- Multiple format support

## Getting Started

### Base URL

All API requests should be made to:

```text
https://your-api-domain.com/api
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```text
Authorization: Bearer <your-jwt-token>
```

### Response Format

All responses are returned in JSON format with consistent structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }
}
```

### Error Handling

Errors are returned with appropriate HTTP status codes and descriptive messages:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## API Endpoints Overview

The API is organized into the following main sections:

- **Authentication** (`/auth`) - Login, register, and session management
- **Events** (`/events`) - Event CRUD operations and search
- **Users** (`/users`) - User profile and management
- **Transactions** (`/transactions`) - Booking and payment operations
- **Promotions** (`/promotions`) - Discount and promotion management
- **Reviews** (`/reviews`) - Review and rating system
- **Upload** (`/upload`) - File and image upload services

## Rate Limiting

API requests are rate-limited to ensure fair usage and system stability. Current limits:

- 100 requests per minute for authenticated users
- 50 requests per minute for public endpoints

## Support

For technical support or questions about this API:

- Email: <support@your-domain.com>
- Documentation: This interactive documentation
- GitHub: [Repository Link]

---

_Last updated: January 2025_
_API Version: 1.0.0_
