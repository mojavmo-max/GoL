# Life Goals Game - Full Stack Application

A gamified life goals tracking application where users create character profiles, track personal goals, and watch their "character" evolve. Think of it as a video game for your real life.

## 🎮 Features (Phase 1 - Complete)

### ✅ Server-Side (Completed)

1. **User Authentication**
   - Registration with secure password hashing
   - Login with credential verification
   - User session tracking

2. **User Profiles**
   - Personal information (name, age, salary)
   - Character name
   - Relationship status
   - Timestamps for tracking account lifecycle

3. **Avatar System**
   - Upload profile photos
   - Store avatars locally
   - Serve via API endpoints
   - Delete avatars

4. **3D Model Integration Ready**
   - Service interface for 3D model generation
   - Ready to integrate with Three.js, Stable Diffusion, or custom ML
   - Placeholder implementation for future expansion

---

## 📦 Project Structure

```
GoL(Game of Life)/
├── server/                    # ASP.NET Core server
│   ├── src/user-auth/        # User authentication module
│   ├── Program.cs            # Server configuration
│   └── server.csproj         # .NET project file
├── client/                    # React frontend (for later)
└── Documentation/
    ├── IMPLEMENTATION_SUMMARY.md    # What was built
    ├── API_TESTING_GUIDE.md         # How to test
    ├── API_QUICK_REFERENCE.md       # API endpoints
    └── SERVER_ARCHITECTURE.md       # Technical details
```

---

## 🚀 Getting Started

### Prerequisites

- .NET 8.0 or higher
- A REST client (Postman, Insomnia, or cURL)
- Visual Studio Code or Visual Studio

### Step 1: Start the Server

```bash
cd server
dotnet run
```

You should see:

```
Now listening on: http://localhost:5000
Now listening on: https://localhost:5001
```

### Step 2: Test the API (Choose One)

#### Option A: Swagger UI (Easiest)

1. Open browser: `http://localhost:5000/swagger/index.html`
2. Try endpoints directly in the browser
3. No additional tools needed

#### Option B: cURL

```bash
# Register a user
curl -X POST http://localhost:5000/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "player@example.com", "password": "Password123!"}'
```

#### Option C: Postman

1. Import endpoints from `API_QUICK_REFERENCE.md`
2. Create requests for each endpoint
3. Send and view responses

### Step 3: Try the Complete Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/user-auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "player@example.com", "password": "Password123!"}'
# Returns: {"id": 1, "email": "player@example.com"}

# 2. Update profile (use ID from above)
curl -X PUT http://localhost:5000/user-auth/profile/1 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "characterName": "The Warrior",
    "age": 28,
    "salary": 75000,
    "relationshipStatus": "Single"
  }'

# 3. Upload avatar
curl -X POST http://localhost:5000/user-auth/profile/1/avatar \
  -F "file=@path/to/photo.jpg"

# 4. Get complete profile
curl http://localhost:5000/user-auth/profile/1
```

---

## 📚 Documentation

### For Testing

👉 **[API Testing Guide](./API_TESTING_GUIDE.md)**

- Complete step-by-step testing instructions
- Examples for every endpoint
- cURL, Postman, and REST Client examples
- Error cases and troubleshooting

### For Quick Reference

👉 **[API Quick Reference](./API_QUICK_REFERENCE.md)**

- All endpoints at a glance
- Request/response examples
- Status codes and field requirements

### For Technical Details

👉 **[Server Architecture](./SERVER_ARCHITECTURE.md)**

- Project structure explanation
- How each feature is implemented
- Technology stack details
- Future enhancement roadmap

### For Implementation Overview

👉 **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)**

- What was built and why
- How to integrate with frontend
- Development notes and checklist

---

## 🧪 API Endpoints

### Authentication

| Method | Endpoint              | Purpose              |
| ------ | --------------------- | -------------------- |
| POST   | `/user-auth/register` | Create new account   |
| POST   | `/user-auth/login`    | Login user           |
| GET    | `/user-auth/users`    | List users (testing) |

### Profile Management

| Method | Endpoint                             | Purpose        |
| ------ | ------------------------------------ | -------------- |
| GET    | `/user-auth/profile/{userId}`        | View profile   |
| PUT    | `/user-auth/profile/{userId}`        | Update profile |
| POST   | `/user-auth/profile/{userId}/avatar` | Upload avatar  |
| DELETE | `/user-auth/profile/{userId}/avatar` | Delete avatar  |

See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) for detailed examples.

---

## 💾 Database

- **Type**: SQLite (file-based, no configuration needed)
- **Location**: `server/src/user-auth/Databases/userauth.db`
- **Auto-created**: Database is automatically created when server first runs
- **Tables**: Users (with profile fields and authentication data)

---

## 🔒 Security

Implemented:

- ✅ HMAC-SHA512 password hashing with unique salts
- ✅ Constant-time password comparison
- ✅ File upload validation (images only)
- ✅ CORS support
- ✅ Input validation

Future:

- JWT token authentication
- Rate limiting
- File size limits
- Enhanced validation

---

## 🎯 Testing Checklist

Complete this checklist to verify all features work:

- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Update user profile
- [ ] Upload avatar photo (JPEG/PNG/GIF/WebP)
- [ ] View profile with avatar URL
- [ ] Delete avatar
- [ ] Get non-existent user (should return 404)
- [ ] Register duplicate email (should return 409)
- [ ] Login with wrong password (should return 401)

---

## 🔄 Development Workflow

### Adding New Endpoints

1. Create DTOs in `Api/Dtos/`
2. Add model logic in `Api/Models/`
3. Create service in `Impl/Utils/`
4. Add endpoint in `Api/Endpoints/UserHandler.cs`
5. Register service in `Program.cs`
6. Test with Swagger UI

### Running Tests

```bash
cd server
dotnet test  # (when tests are added)
```

---

## 🚨 Troubleshooting

### Server won't start

```bash
# Clean and rebuild
dotnet clean
dotnet restore
dotnet run
```

### Port 5000 already in use

```bash
dotnet run --urls "http://localhost:5002"
```

### Database issues

```bash
# Delete database (will auto-recreate)
rm server/src/user-auth/Databases/userauth.db
dotnet run
```

### CORS errors

The server allows all origins by default (development). In production, configure specific domains in `Program.cs`.

See [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md#troubleshooting) for more troubleshooting.

---

## 🎨 Frontend Ready

The server API is complete and ready for frontend integration:

```javascript
// Example: Register and create profile
const userId = await register('user@example.com', 'password');
await updateProfile(userId, {
  firstName: 'John',
  lastName: 'Doe',
  characterName: 'The Hero',
});
const avatarUrl = await uploadAvatar(userId, imageFile);
```

---

## 📈 Future Phases

### Phase 2: Goals Tracking

- Create, read, update, delete goals
- Track progress (0-100%)
- Goal categories

### Phase 3: Achievements & Statistics

- Unlock achievements
- Track statistics
- Level up system

### Phase 4: 3D Model Generation

- Integrate Three.js
- Generate 3D avatars from photos
- Character customization

### Phase 5: Social Features

- Share profiles
- Leaderboards
- Friend connections
- Social achievements

See [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md#future-enhancements) for detailed roadmap.

---

## 📝 Quick Start Command

```bash
# Navigate to server
cd server

# Run the server
dotnet run

# In another terminal, test with curl
curl http://localhost:5000/swagger/index.html

# Or import to Postman/Insomnia using:
# http://localhost:5000/swagger/v1/swagger.json
```

---

## 🔗 Quick Links

| Resource          | Link                                                     |
| ----------------- | -------------------------------------------------------- |
| Swagger UI        | `http://localhost:5000/swagger/index.html`               |
| API Testing Guide | [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)           |
| API Reference     | [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)       |
| Architecture      | [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md)       |
| Implementation    | [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) |

---

## 📞 Help

- **Testing Help**: See [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
- **API Questions**: See [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)
- **Architecture Questions**: See [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 📊 Project Status

| Component         | Status      | Notes                             |
| ----------------- | ----------- | --------------------------------- |
| Authentication    | ✅ Complete | Register, login, password hashing |
| Profiles          | ✅ Complete | Create, read, update user info    |
| Avatar Upload     | ✅ Complete | JPEG, PNG, GIF, WebP support      |
| 3D Model Service  | ✅ Ready    | Interface ready, placeholder impl |
| API Documentation | ✅ Complete | Swagger + 3 guides                |
| Database          | ✅ Complete | SQLite with auto-migration        |
| Testing Guide     | ✅ Complete | Comprehensive manual testing      |

---

## 🎓 Learning Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [REST API Best Practices](https://restfulapi.net/)
- [Swagger/OpenAPI](https://swagger.io/)

---

## 📄 License

This project is part of the Game of Life initiative.

---

**Happy coding! 🚀**

_Built with ❤️ using ASP.NET Core 8.0_
