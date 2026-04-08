# New Project Structure Overview

## Before vs After

### ❌ Old Structure

```
server/src/user-auth/
├── Api/
│   ├── Models/
│   │   └── User.cs
│   ├── Dtos/
│   │   ├── LoginRequest.cs
│   │   ├── RegisterRequest.cs
│   │   ├── UserProfileRequest.cs
│   │   ├── UserProfileResponse.cs
│   │   └── AvatarUploadResponse.cs
│   └── Endpoints/
│       └── UserHandler.cs
├── DataAccess/
│   └── UserAuthDbContext.cs
└── Impl/Utils/
    ├── PasswordHasher.cs
    ├── FileStorageService.cs
    └── Model3dGenerationService.cs
```

### ✅ New Structure (Domain-Based)

```
server/src/
├── Shared/                           # Shared across all modules
│   ├── Models/
│   │   └── User.cs                  # Core user entity
│   ├── DataAccess/
│   │   └── UserDbContext.cs         # Database context
│   └── Databases/
│       └── userauth.db              # SQLite database
│
├── Authentication/                   # Authentication module
│   └── Api/
│       ├── Dtos/
│       │   ├── LoginRequest.cs
│       │   └── RegisterRequest.cs
│       └── Endpoints/
│           └── AuthHandler.cs
│   └── Services/
│       └── PasswordHasher.cs
│
└── UserProfile/                     # User profile & avatar module
    └── Api/
        ├── Dtos/
        │   ├── UserProfileRequest.cs
        │   ├── UserProfileResponse.cs
        │   └── AvatarUploadResponse.cs
        └── Endpoints/
            └── ProfileHandler.cs
    └── Services/
        ├── FileStorageService.cs
        └── Model3dGenerationService.cs
```

---

## Changes Made

### 1. **Namespace Updates**

| Old                      | New                                                           |
| ------------------------ | ------------------------------------------------------------- |
| `UserAuth.Api.Models`    | `Shared.Models`                                               |
| `UserAuth.DataAccess`    | `Shared.DataAccess`                                           |
| `UserAuth.Api.Dtos`      | `Authentication.Api.Dtos` or `UserProfile.Api.Dtos`           |
| `UserAuth.Api.Endpoints` | `Authentication.Api.Endpoints` or `UserProfile.Api.Endpoints` |
| `UserAuth.Services`      | `Authentication.Services` or `UserProfile.Services`           |

### 2. **Files Moved**

| File                        | Old Location     | New Location                                                                                               |
| --------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| User.cs                     | `Api/Models/`    | `Shared/Models/`                                                                                           |
| UserAuthDbContext.cs        | `DataAccess/`    | `Shared/DataAccess/UserDbContext.cs`                                                                       |
| LoginRequest.cs             | `Api/Dtos/`      | `Authentication/Api/Dtos/`                                                                                 |
| RegisterRequest.cs          | `Api/Dtos/`      | `Authentication/Api/Dtos/`                                                                                 |
| PasswordHasher.cs           | `Impl/Utils/`    | `Authentication/Services/`                                                                                 |
| UserProfileRequest.cs       | `Api/Dtos/`      | `UserProfile/Api/Dtos/`                                                                                    |
| UserProfileResponse.cs      | `Api/Dtos/`      | `UserProfile/Api/Dtos/`                                                                                    |
| AvatarUploadResponse.cs     | `Api/Dtos/`      | `UserProfile/Api/Dtos/`                                                                                    |
| FileStorageService.cs       | `Impl/Utils/`    | `UserProfile/Services/`                                                                                    |
| Model3dGenerationService.cs | `Impl/Utils/`    | `UserProfile/Services/`                                                                                    |
| UserHandler.cs              | `Api/Endpoints/` | Split into `Authentication/Api/Endpoints/AuthHandler.cs` and `UserProfile/Api/Endpoints/ProfileHandler.cs` |

### 3. **Endpoint Path Changes**

| Old Endpoint                                  | New Endpoint                        |
| --------------------------------------------- | ----------------------------------- |
| `/user-auth/register`                         | `/auth/register`                    |
| `/user-auth/login`                            | `/auth/login`                       |
| `/user-auth/users`                            | `/auth/users`                       |
| `/user-auth/profile/{userId}`                 | `/profile/{userId}`                 |
| `/user-auth/profile/{userId}` (PUT)           | `/profile/{userId}` (PUT)           |
| `/user-auth/profile/{userId}/avatar`          | `/profile/{userId}/avatar`          |
| `/user-auth/profile/{userId}/avatar` (DELETE) | `/profile/{userId}/avatar` (DELETE) |

### 4. **Program.cs Changes**

- Updated all `using` statements to use new namespaces
- Changed `UserAuthDbContext` → `UserDbContext`
- Updated database path: `src/Shared/Databases/userauth.db`
- Added separate endpoint mapping:
  - `app.MapAuthenticationEndpoints();`
  - `app.MapProfileEndpoints();`

---

## Benefits of New Structure

### ✅ **Clear Separation of Concerns**

Each domain (Authentication, UserProfile) has its own:

- API layer (Dtos, Endpoints)
- Business logic (Services)
- Clear responsibility

### ✅ **Scalability**

New modules can be added easily:

```
src/
├── Shared/
├── Authentication/
├── UserProfile/
├── Goals/          ← Easy to add
├── Achievements/   ← Easy to add
└── Social/         ← Easy to add
```

### ✅ **Reusability**

`Shared/` folder contains:

- Entities used by all modules (User)
- Database context accessed by all modules
- Can add shared DTOs, interfaces, utilities here

### ✅ **Maintainability**

- Find authentication code → Go to `Authentication/`
- Find profile code → Go to `UserProfile/`
- Find shared models → Go to `Shared/`
- Each folder is independent and self-contained

### ✅ **Testing**

Each module can be:

- Unit tested independently
- Mocked separately
- Tested in isolation

### ✅ **Future-Ready**

Ready for:

- Microservices (each module could become a service)
- Feature flags (enable/disable modules)
- Plugin architecture (add modules dynamically)

---

## How to Test

The API still works exactly the same way:

### Swagger UI

```
http://localhost:5000/swagger/index.html
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "Pass123!"}'

# Update Profile
curl -X PUT http://localhost:5000/profile/1 \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe"}'
```

The endpoints now have cleaner paths:

- `/auth/*` for authentication operations
- `/profile/*` for profile operations

---

## Next Steps

### For Existing Code

If you have TypeScript/JavaScript client code referencing the old endpoints, update:

```javascript
// Old
const registerUrl = 'http://localhost:5000/user-auth/register';

// New
const registerUrl = 'http://localhost:5000/auth/register';
```

### For Future Modules

When adding new features (e.g., Goals):

1. Create folder: `server/src/Goals/`
2. Create subfolders: `Api/Endpoints/`, `Services/`
3. Create handler file: `Goals/Api/Endpoints/GoalsHandler.cs`
4. Register endpoint in `Program.cs`:
   ```csharp
   app.MapGoalsEndpoints();
   ```

### For Shared Utilities

Need shared utilities? Add to `Shared/`:

```
src/Shared/
├── Models/
├── DataAccess/
├── Services/       ← Shared services
├── Utilities/      ← Shared utilities
└── Dtos/          ← Shared DTOs
```

---

## Old Folders to Delete

The following old folders can now be deleted:

- `server/src/user-auth/` (entire folder)

The database file was at:

- `server/src/user-auth/Databases/userauth.db`

It will be recreated at:

- `server/src/Shared/Databases/userauth.db`

---

## Summary

✅ **Code is now organized by domain**  
✅ **Clear separation between Authentication and UserProfile**  
✅ **Shared models available to all modules**  
✅ **Cleaner endpoint paths**  
✅ **Ready for future expansion**  
✅ **All functionality preserved**

The server is still fully functional—just better organized!
