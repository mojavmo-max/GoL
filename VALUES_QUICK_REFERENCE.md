# Values & Tasks Module - Quick Reference

## Overview

The Values module allows users to track life values (Wealth, Fitness, Social, etc.) and create specific tasks/challenges to progress on each value. This gamifies personal development.

---

## Value Categories

```
Wealth, Fitness, Social, Spirit, Health, Education, Career,
Creativity, Family, Adventure, Leadership, Happiness
```

---

## API Endpoints

### Goals

#### Get All Goals for User

```
GET /values/{userId}

Response: Array of Goal objects with nested Tasks
```

#### Get Single Goal

```
GET /values/{userId}/{valueId}

Response: Goal with all Tasks included
```

#### Create Goal

```
POST /values/{userId}

Body:
{
  "category": "Fitness",          // Value enum
  "description": "Get fit",       // string
  "colorHex": "#FF5733"          // optional
}

Response: 201 Created with GoalResponse
```

#### Update Goal

```
PUT /values/{userId}/{valueId}

Body:
{
  "id": 1,
  "progressScore": 45.5,          // 0-100
  "description": "Updated goal",
  "isActive": true
}

Response: 200 OK
```

#### Delete Goal

```
DELETE /values/{userId}/{valueId}

Response: 200 OK
```

---

### Tasks

#### Create Task

```
POST /values/task/create

Body:
{
  "valueId": 1,
  "title": "Run 5K",
  "description": "Complete a 5K run",
  "points": 25,                   // Points earned on completion
  "priority": 3,                  // 1=Low, 2=Medium, 3=High
  "dueDate": "2026-04-15T00:00:00",  // optional
  "frequency": 2,                 // How many times
  "frequencyType": "weekly"       // weekly, monthly, once
}

Response: 201 Created with TaskResponse
```

#### Get Task

```
GET /values/task/{taskId}

Response: TaskResponse object
```

#### Update Task Status

```
PUT /values/task/{taskId}/status

Body:
{
  "status": "Completed"  // Pending, InProgress, Completed, Abandoned, OnHold
}

Response: 200 OK
(If Completed, CompletedAt is auto-set)
```

#### Delete Task

```
DELETE /values/task/{taskId}

Response: 200 OK
```

---

## Data Models

### Value

```csharp
{
  "id": 1,
  "userId": 1,
  "category": "Fitness",          // enum
  "description": "Get fit",
  "progressScore": 45.5,          // 0-100
  "colorHex": "#FF5733",
  "isActive": true,
  "createdAt": "2026-03-29T...",
  "updatedAt": "2026-03-29T...",
  "tasks": [...]
}
```

### Task

```csharp
{
  "id": 1,
  "valueId": 1,
  "title": "Run 5K",
  "description": "Complete a 5K run",
  "status": "Completed",          // enum
  "points": 25,
  "priority": 3,
  "dueDate": "2026-04-15T...",
  "completedAt": "2026-03-29T...",
  "frequency": 2,
  "frequencyType": "weekly",
  "createdAt": "2026-03-29T...",
  "updatedAt": "2026-03-29T..."
}
```

---

## Example Usage Flow

1. **Create a Value** (e.g., Fitness goal)

   ```
   POST /values/1 → creates "Get fit in 3 months"
   ```

2. **Add Tasks** to that Value

   ```
   POST /values/task/create → "Run 5K", "Workout 3x/week", "Meal prep"
   ```

3. **Track Progress** by updating tasks

   ```
   PUT /values/task/1/status with "Completed"
   ```

4. **Update Value Progress**

   ```
   PUT /values/1/1 with progressScore: 50
   ```

5. **View Full Value** with all Tasks
   ```
   GET /values/1/1 → Returns Value + all Tasks
   ```

---

## File Structure

```
server/src/Values/
├── Models/
│   ├── ValueCategory.cs    (Enum)
│   ├── Value.cs            (Main entity)
│   └── Task.cs             (Task + TaskStatus enum)
├── Api/
│   ├── Dtos/
│   │   └── ValueDtos.cs    (All request/response DTOs)
│   └── Endpoints/
│       └── ValuesHandler.cs
└── Services/
    (Ready for business logic - advance calculations, etc)
```

---

## Next Steps

- Add Points/Achievement calculation service
- Add Value progress aggregation
- Add Task completion notifications
- Add leaderboards based on points
- Add streak tracking (consecutive completions)
