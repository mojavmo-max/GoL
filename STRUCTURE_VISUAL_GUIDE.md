# New Project Structure - Visual Reference

```
GoL(Game of Life)/
│
├── server/
│   ├── src/
│   │   │
│   │   ├── Shared/                          ← SHARED ACROSS ALL MODULES
│   │   │   ├── Models/
│   │   │   │   └── User.cs                  (Core user entity)
│   │   │   ├── DataAccess/
│   │   │   │   └── UserDbContext.cs         (Database context)
│   │   │   └── Databases/
│   │   │       └── userauth.db              (SQLite database)
│   │   │
│   │   ├── Authentication/                  ← AUTHENTICATION MODULE
│   │   │   └── Api/
│   │   │       ├── Dtos/
│   │   │       │   ├── LoginRequest.cs
│   │   │       │   └── RegisterRequest.cs
│   │   │       └── Endpoints/
│   │   │           └── AuthHandler.cs       (Endpoints: /auth/*)
│   │   │   └── Services/
│   │   │       └── PasswordHasher.cs        (Password hashing)
│   │   │
│   │   └── UserProfile/                     ← USER PROFILE MODULE
│   │       └── Api/
│   │           ├── Dtos/
│   │           │   ├── UserProfileRequest.cs
│   │           │   ├── UserProfileResponse.cs
│   │           │   └── AvatarUploadResponse.cs
│   │           └── Endpoints/
│   │               └── ProfileHandler.cs    (Endpoints: /profile/*)
│   │       └── Services/
│   │           ├── FileStorageService.cs    (File uploads)
│   │           └── Model3dGenerationService.cs (3D model generation)
│   │
│   ├── Program.cs                           ← Updated with new namespaces
│   ├── server.csproj
│   └── [other configuration files]
│
├── client/                                  ← Frontend (React)
│   └── [React app files]
│
└── [Documentation files]
    ├── README.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── API_TESTING_GUIDE.md
    ├── API_QUICK_REFERENCE.md
    ├── SERVER_ARCHITECTURE.md
    ├── STRUCTURE_REFACTOR.md
    ├── REFACTORING_COMPLETE.md
    └── test_refactored_api.ps1
```

---

## 📍 Key Locations

### Database

```
server/src/Shared/Databases/userauth.db
```

### Authentication Services

```
server/src/Authentication/
  → LoginRequest, RegisterRequest
  → AuthHandler (register, login, list users)
  → PasswordHasher (hashing & verification)
```

### Profile Services

```
server/src/UserProfile/
  → UserProfileRequest, UserProfileResponse, AvatarUploadResponse
  → ProfileHandler (CRUD profile, upload/delete avatar)
  → FileStorageService (save/delete avatar files)
  → Model3dGenerationService (generate 3D models)
```

### Shared Services

```
server/src/Shared/
  → User (entity with all fields)
  → UserDbContext (database context for all operations)
```

---

## 🔌 API Endpoints by Module

### Authentication Module (`/auth/*`)

```
POST   /auth/register          → Create account
POST   /auth/login             → Login user
GET    /auth/users             → List all users
```

### Profile Module (`/profile/*`)

```
GET    /profile/{userId}       → Get user profile
PUT    /profile/{userId}       → Update profile
POST   /profile/{userId}/avatar       → Upload avatar
DELETE /profile/{userId}/avatar       → Delete avatar
```

---

## 📦 Module Dependencies

```
Authentication
    ↓
    Uses: User (from Shared)
    Uses: UserDbContext (from Shared)
    Uses: PasswordHasher (local)

UserProfile
    ↓
    Uses: User (from Shared)
    Uses: UserDbContext (from Shared)
    Uses: FileStorageService (local)
    Uses: Model3dGenerationService (local)
```

---

## 🎯 Adding New Modules

To add a new module (e.g., Goals):

1. Create folder: `server/src/Goals/`

2. Create structure:

```
Goals/
├── Api/
│   ├── Dtos/
│   │   ├── CreateGoalRequest.cs
│   │   ├── UpdateGoalRequest.cs
│   │   └── GoalResponse.cs
│   └── Endpoints/
│       └── GoalsHandler.cs
└── Services/
    └── GoalService.cs
```

3. Create namespaces:

```csharp
namespace Goals.Api.Dtos;
namespace Goals.Api.Endpoints;
namespace Goals.Services;
```

4. Register in Program.cs:

```csharp
app.MapGoalsEndpoints();
```

---

## 📊 Module Comparison

| Feature       | Authentication     | UserProfile        | Future Goals     |
| ------------- | ------------------ | ------------------ | ---------------- |
| Purpose       | Login/Signup       | Profile Management | Track objectives |
| Database      | Users              | Users              | Goals table      |
| Endpoints     | 3                  | 4                  | TBD              |
| Services      | 1 (PasswordHasher) | 2 (Files, 3D)      | TBD              |
| External APIs | None               | None (3D TBD)      | TBD              |

---

## 🔗 Module Interactions

```
                ┌──────────────────┐
                │     Shared       │
                │  (Models, Data)  │
                └──────────────────┘
                  ↑                 ↑
                  │                 │
        ┌─────────┘                 └─────────┐
        │                                     │
   ┌────────────┐                      ┌─────────────┐
   │Authentication                     │ UserProfile │
   │  - Login/Signup         ←uses→    │  - Profiles │
   │  - Password hash                  │  - Avatars  │
   └────────────┘                      │  - 3D Models│
                                       └─────────────┘
```

---

## 📋 Namespace Hierarchy

```
Shared
├── Shared.Models
└── Shared.DataAccess

Authentication
├── Authentication.Api.Dtos
├── Authentication.Api.Endpoints
└── Authentication.Services

UserProfile
├── UserProfile.Api.Dtos
├── UserProfile.Api.Endpoints
└── UserProfile.Services
```

---

## 🚀 Quick Navigation

**Need to modify authentication?**
→ Go to `server/src/Authentication/`

**Need to modify profiles?**
→ Go to `server/src/UserProfile/`

**Need to modify shared models?**
→ Go to `server/src/Shared/`

**Need to update endpoints mapping?**
→ Edit `server/Program.cs`

**Need to check database schema?**
→ Edit `server/src/Shared/DataAccess/UserDbContext.cs`

---

## 📝 File Purpose Guide

| File                        | Purpose               | Module         |
| --------------------------- | --------------------- | -------------- |
| User.cs                     | Core domain model     | Shared         |
| UserDbContext.cs            | Database access       | Shared         |
| LoginRequest.cs             | Login DTO             | Authentication |
| RegisterRequest.cs          | Registration DTO      | Authentication |
| AuthHandler.cs              | Auth endpoints        | Authentication |
| PasswordHasher.cs           | Hash/verify passwords | Authentication |
| UserProfileRequest.cs       | Profile update DTO    | UserProfile    |
| UserProfileResponse.cs      | Profile view DTO      | UserProfile    |
| ProfileHandler.cs           | Profile endpoints     | UserProfile    |
| FileStorageService.cs       | File upload/delete    | UserProfile    |
| Model3dGenerationService.cs | 3D model creation     | UserProfile    |

---

## ✨ Best Practices Applied

✅ **Domain-Driven Design** - Code organized by business domains  
✅ **Single Responsibility** - Each module has one reason to change  
✅ **Dependency Injection** - Services registered in Program.cs  
✅ **Clear Interfaces** - Services have contracts (interfaces)  
✅ **Separation of Concerns** - API, business logic, data layers separated  
✅ **Testability** - Each module can be tested independently  
✅ **Scalability** - Easy to add new modules  
✅ **Maintainability** - Code is organized and discoverable

---

## 🎓 Project Structure Rationale

### Why Domain-Based Organization?

1. **Cognitive Load Reduction**
   - Find authentication code in one place
   - Find profile code in one place
   - Not scattered across the project

2. **Team Scaling**
   - Team A works on Authentication
   - Team B works on UserProfile
   - Minimal conflicts

3. **Feature Isolation**
   - Change auth logic → only affects Authentication module
   - Change profile logic → only affects UserProfile module
   - Changes are localized

4. **Testing**
   - Test authentication independently
   - Test profiles independently
   - Mock Shared dependencies

5. **Microservices Ready**
   - Each module could become a service
   - Clear boundaries from the start
   - Easy migration path

---

## 🔄 Migration Path (if needed)

Current: Monolithic ASP.NET Core
↓
Future: Could split to:

- Authentication Service (separate project)
- Profile Service (separate project)
- Shared Library (NuGet package)

The current structure makes this transition seamless!

---

## 📚 Documentation Map

| Document                | Purpose             | Audience      |
| ----------------------- | ------------------- | ------------- |
| README.md               | Project overview    | Everyone      |
| API_QUICK_REFERENCE.md  | API endpoints       | Frontend devs |
| API_TESTING_GUIDE.md    | Testing APIs        | QA, Testers   |
| SERVER_ARCHITECTURE.md  | Technical details   | Backend devs  |
| STRUCTURE_REFACTOR.md   | Refactoring details | Architects    |
| REFACTORING_COMPLETE.md | Completion summary  | Project lead  |

---

**Status: ✅ NEW STRUCTURE COMPLETE AND VERIFIED**

_Project is now organized for growth and scalability!_
