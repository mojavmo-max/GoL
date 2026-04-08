# Server Architecture & Implementation Guide

## Project Structure

```
server/
├── Program.cs                          # Main entry point, dependency injection setup
├── server.csproj                       # Project configuration
└── src/user-auth/
    ├── Api/
    │   ├── Models/
    │   │   └── User.cs                # Core domain model with profile fields
    │   ├── Dtos/
    │   │   ├── LoginRequest.cs
    │   │   ├── RegisterRequest.cs
    │   │   ├── UserProfileRequest.cs
    │   │   ├── UserProfileResponse.cs
    │   │   └── AvatarUploadResponse.cs
    │   └── Endpoints/
    │       └── UserHandler.cs          # All HTTP endpoint handlers
    ├── DataAccess/
    │   └── UserAuthDbContext.cs        # Entity Framework Core DbContext
    └── Impl/Utils/
        ├── PasswordHasher.cs           # HMAC-SHA512 password hashing
        ├── FileStorageService.cs       # Avatar file management
        └── Model3dGenerationService.cs # 3D model generation service
└── Databases/
    └── userauth.db                     # SQLite database (auto-created)
```

---

## Key Features Implemented

### 1. Authentication System ✅

- **Register**: Email + password registration with HMAC-SHA512 hashing
- **Login**: Credential verification with constant-time comparison
- **Security**: Passwords use unique salts and fixed-time comparison to prevent timing attacks

**Files:**

- `Api/Models/User.cs` - User model with password hash/salt
- `Impl/Utils/PasswordHasher.cs` - Password hashing/verification
- `Api/Endpoints/UserHandler.cs` - Register/Login endpoints

### 2. User Profile Management ✅

- **Profile Fields**: First name, last name, character name, age, salary, relationship status
- **Create/Update**: Users can set these fields individually
- **Retrieval**: Get complete user profile with timestamps

**Files:**

- `Api/Models/User.cs` - Extended with profile fields
- `Api/Dtos/UserProfileRequest.cs` - Input DTO
- `Api/Dtos/UserProfileResponse.cs` - Output DTO
- `Api/Endpoints/UserHandler.cs` - Profile endpoints

### 3. Avatar Upload System ✅

- **Upload**: Save avatar images to `server/uploads/avatars/`
- **Validation**: Only allow JPEG, PNG, GIF, WebP formats
- **URL Generation**: Serve avatars via `/api/uploads/avatars/{filename}`
- **Deletion**: Remove avatar when user deletes it

**Files:**

- `Impl/Utils/FileStorageService.cs` - File upload/download handling
- `Api/Endpoints/UserHandler.cs` - Upload/delete endpoints

### 4. 3D Model Generation (Placeholder) ✅

- **Service Interface**: `IModel3dGenerationService`
- **Current Implementation**: Returns placeholder model paths
- **Future Ready**: Can be integrated with:
  - Three.js (client-side generation)
  - Stable Diffusion API
  - Custom ML models
  - Ready Player Me API

**Files:**

- `Impl/Utils/Model3dGenerationService.cs` - Model generation service

---

## Technology Stack

| Component         | Technology                     | Version  |
| ----------------- | ------------------------------ | -------- |
| Framework         | ASP.NET Core                   | 8.0+     |
| Database          | Entity Framework Core + SQLite | 8.0.8    |
| API Documentation | Swagger/OpenAPI                | 6.6.2    |
| Password Hashing  | HMAC-SHA512                    | Built-in |
| CORS              | ASP.NET Core CORS              | Built-in |
| File Storage      | Local File System              | Built-in |

---

## Data Model

### User Entity

```csharp
public class User
{
    public int Id { get; set; }

    // Authentication
    public required string Email { get; set; }
    public required byte[] PasswordHash { get; set; }
    public required byte[] PasswordSalt { get; set; }

    // Profile Information
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public int? Age { get; set; }
    public decimal? Salary { get; set; }
    public string? RelationshipStatus { get; set; }
    public string? CharacterName { get; set; }

    // Avatar & 3D Model
    public string? AvatarPhotoPath { get; set; }
    public string? Model3dPath { get; set; }

    // Metadata
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

---

## API Endpoints

### Authentication (3 endpoints)

| Method | Endpoint              | Purpose                      |
| ------ | --------------------- | ---------------------------- |
| POST   | `/user-auth/register` | Create new user account      |
| POST   | `/user-auth/login`    | Authenticate user            |
| GET    | `/user-auth/users`    | List all users (for testing) |

### Profile (4 endpoints)

| Method | Endpoint                             | Purpose               |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/user-auth/profile/{userId}`        | Retrieve user profile |
| PUT    | `/user-auth/profile/{userId}`        | Update profile fields |
| POST   | `/user-auth/profile/{userId}/avatar` | Upload avatar photo   |
| DELETE | `/user-auth/profile/{userId}/avatar` | Delete avatar         |

**Total: 7 API endpoints**

---

## Dependency Injection

Services are registered in `Program.cs`:

```csharp
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IModel3dGenerationService, Model3dGenerationService>();
builder.Services.AddDbContext<UserAuthDbContext>(options =>
    options.UseSqlite(...));
```

This ensures:

- One instance per request (Scoped)
- Automatic disposal of resources
- Easy testing with mocked services

---

## File Storage Structure

```
server/
└── uploads/
    ├── avatars/
    │   ├── 1_1711612345678.jpg
    │   ├── 2_1711612345679.png
    │   └── ...
    └── models/
        ├── 1_1711612345678.gltf
        └── ...
```

Avatar files are named: `{userId}_{timestamp}.{extension}`

- Prevents conflicts between users
- Easy to track which files belong to which user
- Timestamps prevent overwriting

---

## Error Handling

### Response Codes

- **201 Created**: Resource created successfully
- **200 OK**: Request successful
- **400 Bad Request**: Invalid input (missing fields, invalid format)
- **401 Unauthorized**: Wrong credentials
- **404 Not Found**: User/resource doesn't exist
- **409 Conflict**: Duplicate email during registration
- **500 Server Error**: Unexpected error

### Validation Examples

- Empty email/password → 400
- Duplicate email registration → 409
- Non-existent user ID → 404
- Invalid image format → 400
- Wrong login credentials → 401

---

## Security Considerations

### ✅ Implemented

1. **Password Security**
   - HMAC-SHA512 hashing with unique salt per user
   - Constant-time comparison prevents timing attacks
   - Never stored in plain text

2. **CORS**
   - Allows all origins (development setup)
   - Can be restricted in production

3. **File Upload Security**
   - File type validation (only images)
   - Unique file naming
   - Stored outside web root

### 🔄 Future Enhancements

1. **JWT Tokens** - Replace placeholder token authentication
2. **Rate Limiting** - Prevent brute force attacks
3. **HTTPS Only** - Enforce in production
4. **Database Encryption** - Encrypt sensitive fields
5. **File Size Limits** - Prevent large uploads
6. **Virus Scanning** - Scan uploaded files

---

## Testing Strategy

### Unit Tests (Future)

```csharp
[TestClass]
public class PasswordHasherTests
{
    [TestMethod]
    public void HashPassword_ProducesValidHash() { }

    [TestMethod]
    public void VerifyPassword_CorrectPassword_ReturnsTrue() { }

    [TestMethod]
    public void VerifyPassword_WrongPassword_ReturnsFalse() { }
}
```

### Integration Tests (Future)

```csharp
[TestClass]
public class UserRegistrationTests
{
    [TestMethod]
    public async Task Register_NewUser_ReturnsCreated() { }

    [TestMethod]
    public async Task Register_DuplicateEmail_ReturnsConflict() { }
}
```

### Manual Testing (Now)

See `API_TESTING_GUIDE.md` for comprehensive testing instructions with cURL, Postman, and REST Client examples.

---

## Running the Server

### Development

```bash
cd server
dotnet run
```

- Listens on `https://localhost:5001` and `http://localhost:5000`
- Swagger UI available at `http://localhost:5000/swagger`
- Hot reload enabled for code changes

### Production (Future)

```bash
dotnet publish -c Release
dotnet bin/Release/net8.0/server.dll
```

---

## Future Enhancements

### Phase 2: 3D Model Generation

1. **Choose Implementation**:
   - Client-side: Three.js + Three-controlled mesh generation
   - Server-side: Integration with 3D API
   - Hybrid: Client captures, server processes

2. **Implementation Example**:
   ```csharp
   public class ThreeDGenerationService : IModel3dGenerationService
   {
       public async Task<string> GenerateModel3dAsync(string photoPath, int userId)
       {
           // Call external API (Stable Diffusion, Custom ML, etc.)
           // Save resulting model to uploads/models/
           // Return path
       }
   }
   ```

### Phase 3: Goals Tracking

```csharp
public class Goal
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public int Progress { get; set; } // 0-100
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
```

### Phase 4: Statistics & Achievements

```csharp
public class Achievement
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public DateTime UnlockedAt { get; set; }
}
```

### Phase 5: Social Features

- Share profiles
- Leaderboards
- Comparison with friends
- Achievements showcase

---

## Deployment Checklist

- [ ] Set production connection string
- [ ] Enable HTTPS enforcing
- [ ] Configure CORS for specific domains
- [ ] Set up JWT token generation
- [ ] Implement rate limiting
- [ ] Add logging (Serilog)
- [ ] Set up database backups
- [ ] Configure file storage (cloud or robust local)
- [ ] Set up monitoring
- [ ] Document API changes
