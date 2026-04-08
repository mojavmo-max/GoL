# Life Goals Game Server - API Testing Guide

## Overview

This guide explains how to test the server-side APIs for the Life Goals tracking app. The server uses ASP.NET Core with SQLite and provides endpoints for authentication, profile management, and avatar uploads.

## Prerequisites

- .NET 8.0+ installed
- A REST client (Postman, Insomnia, VS Code REST Client, or cURL)
- The server running locally (typically on `https://localhost:5001` or `http://localhost:5000`)

## Running the Server

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Restore dependencies and run:

   ```bash
   dotnet run
   ```

3. The server will:
   - Create a SQLite database in `src/user-auth/Databases/userauth.db`
   - Start on `https://localhost:5001` (HTTPS) or `http://localhost:5000` (HTTP)
   - Display Swagger API documentation at `http://localhost:5000/swagger/index.html`

## Base URL

```
http://localhost:5000
```

## API Endpoints Summary

### Authentication Endpoints

- `POST /user-auth/register` - Register a new user
- `POST /user-auth/login` - Login user
- `GET /user-auth/users` - List all users

### Profile Endpoints

- `GET /user-auth/profile/{userId}` - Get user profile
- `PUT /user-auth/profile/{userId}` - Update user profile
- `POST /user-auth/profile/{userId}/avatar` - Upload avatar
- `DELETE /user-auth/profile/{userId}/avatar` - Delete avatar

---

## Detailed Testing Instructions

### 1. Register a New User

**Endpoint:** `POST /user-auth/register`

**Using cURL:**

```bash
curl -X POST http://localhost:5000/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player1@example.com",
    "password": "SecurePassword123!"
  }'
```

**Using REST Client (VS Code):**
Create a file `test.http`:

```http
### Register User
POST http://localhost:5000/user-auth/register
Content-Type: application/json

{
  "email": "player1@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response (201 Created):**

```json
{
  "id": 1,
  "email": "player1@example.com"
}
```

### 2. Login User

**Endpoint:** `POST /user-auth/login`

**Using cURL:**

```bash
curl -X POST http://localhost:5000/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player1@example.com",
    "password": "SecurePassword123!"
  }'
```

**Expected Response (200 OK):**

```json
{
  "id": 1,
  "email": "player1@example.com",
  "token": "<token-placeholder>"
}
```

### 3. Get User Profile

**Endpoint:** `GET /user-auth/profile/{userId}`

**Using cURL:**

```bash
curl http://localhost:5000/user-auth/profile/1
```

**Expected Response (200 OK):**

```json
{
  "id": 1,
  "email": "player1@example.com",
  "firstName": null,
  "lastName": null,
  "characterName": null,
  "age": null,
  "salary": null,
  "relationshipStatus": null,
  "avatarPhotoUrl": null,
  "model3dUrl": null,
  "createdAt": "2024-03-28T10:30:00Z",
  "updatedAt": "2024-03-28T10:30:00Z"
}
```

### 4. Update User Profile

**Endpoint:** `PUT /user-auth/profile/{userId}`

**Using cURL:**

```bash
curl -X PUT http://localhost:5000/user-auth/profile/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "characterName": "The Warrior",
    "age": 28,
    "salary": 75000.00,
    "relationshipStatus": "Single"
  }'
```

**Expected Response (200 OK):**

```json
{
  "id": 1,
  "email": "player1@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "characterName": "The Warrior"
}
```

### 5. Upload Avatar Photo

**Endpoint:** `POST /user-auth/profile/{userId}/avatar`

**Using cURL:**

```bash
curl -X POST http://localhost:5000/user-auth/profile/1/avatar \
  -F "file=@/path/to/your/photo.jpg"
```

**Using REST Client (VS Code):**

```http
### Upload Avatar
POST http://localhost:5000/user-auth/profile/1/avatar
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="avatar.jpg"
Content-Type: image/jpeg

< ./avatar.jpg
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

**Using Postman:**

1. Open Postman
2. Create a new POST request to `http://localhost:5000/user-auth/profile/1/avatar`
3. Go to the "Body" tab
4. Select "form-data"
5. Add a key "file" with type "File"
6. Select your image file
7. Click "Send"

**Expected Response (200 OK):**

```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "/api/uploads/avatars/1_1711612345678.jpg",
  "model3dGenerationUrl": "models/1_1711612345678.gltf"
}
```

**Supported Image Formats:** JPEG, PNG, GIF, WebP

### 6. Delete Avatar

**Endpoint:** `DELETE /user-auth/profile/{userId}/avatar`

**Using cURL:**

```bash
curl -X DELETE http://localhost:5000/user-auth/profile/1/avatar
```

**Expected Response (200 OK):**

```json
{
  "message": "Avatar deleted successfully"
}
```

### 7. List All Users

**Endpoint:** `GET /user-auth/users`

**Using cURL:**

```bash
curl http://localhost:5000/user-auth/users
```

**Expected Response (200 OK):**

```json
[
  {
    "id": 1,
    "email": "player1@example.com"
  },
  {
    "id": 2,
    "email": "player2@example.com"
  }
]
```

---

## Testing Workflow

### Complete User Journey Test

1. **Register a new user**

   ```bash
   curl -X POST http://localhost:5000/user-auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "newplayer@example.com", "password": "TestPass123!"}'
   ```

   Save the returned `id` (e.g., 1)

2. **Login to verify credentials**

   ```bash
   curl -X POST http://localhost:5000/user-auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "newplayer@example.com", "password": "TestPass123!"}'
   ```

3. **Get initial profile (should be mostly empty)**

   ```bash
   curl http://localhost:5000/user-auth/profile/1
   ```

4. **Update profile with basic info**

   ```bash
   curl -X PUT http://localhost:5000/user-auth/profile/1 \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Alice",
       "lastName": "Smith",
       "characterName": "Mystic Sage",
       "age": 32,
       "salary": 95000,
       "relationshipStatus": "Married"
     }'
   ```

5. **Upload an avatar photo**

   ```bash
   curl -X POST http://localhost:5000/user-auth/profile/1/avatar \
     -F "file=@./path/to/photo.jpg"
   ```

6. **Get updated profile with avatar**

   ```bash
   curl http://localhost:5000/user-auth/profile/1
   ```

7. **Download/view the avatar**
   Visit the returned `avatarPhotoUrl` in a browser or request it:
   ```bash
   curl http://localhost:5000/api/uploads/avatars/1_1711612345678.jpg -o avatar.jpg
   ```

---

## Swagger UI Testing

The easiest way to test the APIs is through the built-in Swagger UI:

1. Start the server
2. Navigate to: `http://localhost:5000/swagger/index.html`
3. Each endpoint will have an interactive interface
4. Click "Try it out" on any endpoint
5. Enter the required parameters
6. Click "Execute"
7. View the response

---

## Testing with Postman

1. **Create a Postman Collection:**
   - File → New → Collection
   - Name it "Life Goals Game API"

2. **Add Requests:**
   - Create requests for each endpoint
   - Use environment variables for `baseUrl` and `userId`
   - Save the collection

3. **Use Example:**
   ```
   {{baseUrl}}/user-auth/register
   {{baseUrl}}/user-auth/profile/{{userId}}
   ```

---

## Common Testing Scenarios

### Testing Avatar Upload with Different Formats

```bash
# Test with JPEG
curl -X POST http://localhost:5000/user-auth/profile/1/avatar \
  -F "file=@./avatar.jpg"

# Test with PNG
curl -X POST http://localhost:5000/user-auth/profile/1/avatar \
  -F "file=@./avatar.png"

# Test with invalid format (should fail)
curl -X POST http://localhost:5000/user-auth/profile/1/avatar \
  -F "file=@./document.txt"
```

### Testing Error Cases

```bash
# Invalid email/password format
curl -X POST http://localhost:5000/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "", "password": ""}'

# Duplicate email registration
curl -X POST http://localhost:5000/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "existing@example.com", "password": "Pass123!"}'

# Non-existent user
curl http://localhost:5000/user-auth/profile/999

# Login with wrong password
curl -X POST http://localhost:5000/user-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "player@example.com", "password": "WrongPassword"}'
```

---

## Database Inspection

The SQLite database is stored at:

```
server/src/user-auth/Databases/userauth.db
```

You can inspect it using:

- **SQLite Command Line:** `sqlite3 userauth.db`
- **DB Browser for SQLite:** Download from https://sqlitebrowser.org/
- **VS Code Extension:** Install "SQLite" extension

### Useful Queries

```sql
-- View all users
SELECT id, email, firstName, lastName, characterName, age, salary, relationshipStatus FROM Users;

-- Check uploads
SELECT * FROM Users WHERE AvatarPhotoPath IS NOT NULL;

-- Delete a user (be careful!)
DELETE FROM Users WHERE id = 1;
```

---

## Future Enhancement: 3D Model Generation

Currently, the 3D model generation returns a placeholder path. To integrate actual 3D generation:

### Option 1: Client-Side (Three.js)

- Use Three.js on the frontend to generate a 3D model from the photo
- Send the generated model file back to the server

### Option 2: Stable Diffusion API

```csharp
// Example integration
var diffusionApi = "https://api.stability.ai/v1/generate";
var response = await client.PostAsync(diffusionApi, new StringContent(...));
```

### Option 3: Custom Machine Learning Model

- Train a model to generate 3D avatars from photos
- Deploy it as a separate service and call it from the server

The service interface `IModel3dGenerationService` is ready to be extended with actual implementation.

---

## Troubleshooting

### Database Lock Issues

If you get a "database is locked" error:

1. Stop the server
2. Delete `userauth.db` (it will be recreated)
3. Restart the server

### Port Already in Use

If port 5000/5001 is already in use:

```bash
# View what's using the port
netstat -ano | findstr :5000

# Kill the process (Windows)
taskkill /PID <ProcessID> /F

# Or change the port in launchSettings.json
```

### Avatar Upload Issues

- Ensure images are under 10MB
- Supported formats: JPEG, PNG, GIF, WebP
- Check that the `uploads/` directory exists and has write permissions

---

## Performance Testing

### Load Test Example (using Apache Bench)

```bash
# Test registration endpoint with 100 requests, 10 concurrent
ab -n 100 -c 10 -p data.json -T application/json \
  http://localhost:5000/user-auth/register
```

### Memory Usage

Monitor server memory while running tests. Check `dotnet run` output for any warnings.

---

## Success Criteria

Your API implementation is working correctly when:

- ✅ Users can register with unique emails
- ✅ Users can login with correct credentials
- ✅ User profiles can be created and updated
- ✅ Avatar photos can be uploaded and retrieved
- ✅ Invalid requests return appropriate error codes
- ✅ Database persists data between server restarts
