# Simple Auth Backend

This is a minimal Java backend for user authentication using JDBC.

## Setup

1. Install MySQL and create the database:
   - Run the schema.sql in MySQL to create the database and table.

2. Install Maven.

3. Compile and run:
   ```
   mvn clean compile
   mvn exec:java
   ```

The server will start on port 8080.

## API Endpoints

- POST /api/auth/login
  - Body: username=...&password=...
  - Response: "Login Success" or "Invalid Credentials"

- POST /api/auth/register
  - Body: username=...&password=...
  - Response: "User Registered" or "Username already exists"

## Notes

- Passwords are stored in plain text (not secure, for learning purposes only).
- Uses MySQL database.