# Life Goals Game - Server API Quick Reference

## Authentication

### Register User

```
POST /user-auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 201 Created
{
  "id": 1,
  "email": "user@example.com"
}
```

### Login

```
POST /user-auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "token": "<token-placeholder>"
}
```

### List All Users

```
GET /user-auth/users

Response: 200 OK
[
  { "id": 1, "email": "user1@example.com" },
  { "id": 2, "email": "user2@example.com" }
]
```

---

## Profile Management

### Get User Profile

```
GET /user-auth/profile/{userId}

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "characterName": "The Warrior",
  "age": 28,
  "salary": 75000.00,
  "relationshipStatus": "Single",
  "avatarPhotoUrl": "/api/uploads/avatars/1_1711612345678.jpg",
  "model3dUrl": "models/1_1711612345678.gltf",
  "createdAt": "2024-03-28T10:30:00Z",
  "updatedAt": "2024-03-28T10:30:00Z"
}
```

### Update User Profile

```
PUT /user-auth/profile/{userId}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "characterName": "The Warrior",
  "age": 28,
  "salary": 75000.00,
  "relationshipStatus": "Single"
}

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "characterName": "The Warrior"
}
```

---

## Avatar Management

### Upload Avatar Photo

```
POST /user-auth/profile/{userId}/avatar
Content-Type: multipart/form-data

[Binary image file]

Response: 200 OK
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "/api/uploads/avatars/1_1711612345678.jpg",
  "model3dGenerationUrl": "models/1_1711612345678.gltf"
}
```

### Delete Avatar

```
DELETE /user-auth/profile/{userId}/avatar

Response: 200 OK
{
  "message": "Avatar deleted successfully"
}
```

---

## Status Codes

| Code | Meaning                                                    |
| ---- | ---------------------------------------------------------- |
| 200  | OK - Request successful                                    |
| 201  | Created - Resource created successfully                    |
| 400  | Bad Request - Invalid input                                |
| 401  | Unauthorized - Invalid credentials                         |
| 404  | Not Found - User/resource not found                        |
| 409  | Conflict - Resource already exists (e.g., duplicate email) |
| 500  | Internal Server Error                                      |

---

## Field Requirements

### User Profile Fields

- `firstName`\* - Optional string
- `lastName`\* - Optional string
- `characterName`\* - Optional string (player's character name)
- `age`\* - Optional integer
- `salary`\* - Optional decimal
- `relationshipStatus`\* - Optional string (e.g., "Single", "Married", "In a relationship")

\*All profile fields are optional for initial creation. They can be updated individually.

### Supported Image Formats

- JPEG
- PNG
- GIF
- WebP

---

## Example Usage Flow

1. **Register**: `POST /user-auth/register` → Get user ID
2. **Login**: `POST /user-auth/login` → Get token
3. **Update Profile**: `PUT /user-auth/profile/{id}` → Set basic info
4. **Upload Avatar**: `POST /user-auth/profile/{id}/avatar` → Upload photo
5. **Get Profile**: `GET /user-auth/profile/{id}` → View complete profile

---

## Development Server

```bash
cd server
dotnet run
```

Server runs on: `http://localhost:5000` or `https://localhost:5001`

Swagger UI: `http://localhost:5000/swagger/index.html`

Database: `server/src/user-auth/Databases/userauth.db` (SQLite)

Uploads: `server/uploads/avatars/` (local file system)
