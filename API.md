# NBRLY REST API Documentation

Base URL: `http://localhost:5000/api`

All protected routes expect standard Bearer JWT authorization:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Purpose**: Register a new neighborhood member account
- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "password123",
  "neighborhood": "Bandra West",
  "bio": "IT student helping neighbors with tech & errands.",
  "skills": ["Technology", "Errands", "Computer Help"]
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Account registered successfully.",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "neighborhood": "Bandra West",
      "skills": ["Technology", "Errands"]
    },
    "token": "eyJhbGciOi..."
  }
}
```

### `POST /api/auth/login`
- **Purpose**: Authenticate user and receive JWT token
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "aarav.sharma@example.com",
  "password": "nbrly123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOi..."
  }
}
```

### `GET /api/auth/me`
- **Purpose**: Retrieve current logged-in user profile with earned badges & reviews
- **Auth Required**: Yes

### `POST /api/auth/logout`
- **Purpose**: Invalidate current session
- **Auth Required**: No

---

## 2. Help Requests (`/api/requests`)

### `GET /api/requests`
- **Purpose**: List and filter neighborhood help requests with Smart Match scores
- **Auth Required**: Optional
- **Query Parameters**:
  - `search` (string) - text search in title/description/category
  - `category` (string) - e.g. `Healthcare / Medicine`, `Technology`, `Education`
  - `urgency` (string) - `URGENT`, `TODAY`, `FLEXIBLE`
  - `neighborhood` (string) - e.g. `Bandra West`
  - `status` (string) - `OPEN`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "uuid",
        "title": "Pick up blood pressure medication",
        "description": "Prescription ready at Apollo Pharmacy.",
        "category": "Healthcare / Medicine",
        "urgency": "URGENT",
        "neighborhood": "Bandra West",
        "preferredDate": "Today",
        "preferredTime": "Before 6:00 PM",
        "status": "OPEN",
        "matchScore": 94,
        "matchReasons": [
          "Same neighborhood (Bandra West)",
          "Direct skill match for category"
        ],
        "requester": {
          "id": "uuid",
          "name": "Priya Shah",
          "rating": 5.0,
          "completedHelps": 12,
          "neighborhood": "Bandra West"
        }
      }
    ]
  }
}
```

### `GET /api/requests/:id`
- **Purpose**: Retrieve detailed request info, requester trust data, helper assignment, reviews, and explainable Smart Match breakdown
- **Auth Required**: Optional

### `POST /api/requests`
- **Purpose**: Create a new neighborhood help request
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "title": "Need help setting up home WiFi router",
  "description": "Just moved in and need assistance configuring router & devices.",
  "category": "Technology",
  "urgency": "TODAY",
  "neighborhood": "Bandra West",
  "preferredDate": "Today",
  "preferredTime": "7:30 PM",
  "reward": "Tea and snacks ☕"
}
```

### `PATCH /api/requests/:id`
- **Purpose**: Update an open request (requester only)
- **Auth Required**: Yes

### `DELETE /api/requests/:id`
- **Purpose**: Cancel a request (requester only)
- **Auth Required**: Yes

---

## 3. Help Workflow & Lifecycle Transitions

### `POST /api/requests/:id/accept`
- **Purpose**: Helper accepts an open request
- **Transition**: `OPEN` → `ACCEPTED`
- **Auth Required**: Yes (Helper)

### `POST /api/requests/:id/start`
- **Purpose**: Helper begins the task
- **Transition**: `ACCEPTED` → `IN_PROGRESS`
- **Auth Required**: Yes (Assigned Helper)

### `POST /api/requests/:id/complete`
- **Purpose**: Helper marks the task finished (auto-increments helper completed count & checks badges)
- **Transition**: `IN_PROGRESS` → `COMPLETED`
- **Auth Required**: Yes (Assigned Helper)

---

## 4. Ratings & Reviews (`/api/requests/:id/review`)

### `POST /api/requests/:id/review`
- **Purpose**: Submit a rating and review for a completed help request
- **Auth Required**: Yes (Requester or Helper)
- **Request Body**:
```json
{
  "rating": 5,
  "comment": "Arrived right on time and fixed the router in 15 minutes. Great neighbor!"
}
```

---

## 5. User Profiles (`/api/users`)

### `GET /api/users/:id`
- **Purpose**: Retrieve privacy-conscious public profile for any neighbor
- **Auth Required**: No
- **Response**: Returns name, neighborhood, bio, skills, rating, completedHelps, badges, and reviews (excludes email/password).

### `PATCH /api/users/me`
- **Purpose**: Update editable profile fields (name, bio, neighborhood, skills, avatar)
- **Auth Required**: Yes

---

## 6. Activity & Community (`/api/activity` & `/api/community`)

### `GET /api/activity/me`
- **Purpose**: Retrieve user's personal activity grouped by created requests and helper assignments
- **Auth Required**: Yes

### `GET /api/community/stats`
- **Purpose**: Live Neighborhood Pulse aggregate statistics (open requests, active helpers, completed helps, peak times)
- **Auth Required**: No

### `GET /api/community/activity`
- **Purpose**: Live neighborhood feed of recent help events
- **Auth Required**: No

---

## 7. Deterministic NeighborMatch Algorithm

Match score is calculated deterministically across 5 criteria (0–100 pts max):
1. **Neighborhood Match**: +40 pts for identical neighborhood, +25 pts for adjacent areas
2. **Category / Skill Match**: +25 pts for matching user skill tags
3. **Availability / Time Match**: +20 pts for matching same-day/shift availability
4. **Urgency Alignment**: +10 pts for immediate / same-day dispatch compatibility
5. **Walking Proximity**: +5 pts for high-density walking radius (< 800m)
