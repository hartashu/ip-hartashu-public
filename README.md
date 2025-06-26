[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19842763&assignment_repo_type=AssignmentRepo)

# Individual Project Phase 2

## Website / domain :

Backend:
https://hartashuwanto.xyz

Frontend:

## Models :

_User_

- username: string
- email: string
- password: string
- role: string
- imgUrl: string

_Message_

- userId: number
- message: text
- isSummarized: boolean

## Endpoints :

List of available endpoints:

- `POST /register`
- `POST /login`
- `POST /google-login`

- `GET /messages`
- `PATCH /messages`
- `GET /summary`
- `GET /users/:id`

## 1. POST /register

Request:

- body:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

_Response (201 - Created)_

```json
{
  "message": "string",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "imgUrl": "string"
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "error": {
    "message": [
        "Username is required",
    ]
  }
}
OR
{
  "error": {
    "message": [
        "Email is required",
    ]
  }
}
OR
{
  "error": {
    "message": [
        "Input correct email format",
    ]
  }
}
OR
{
  "error": {
    "message": [
        "Password is required",
    ]
  }
}
```

## 2. POST /login

Request:

- body:

```json
{
  "username": "string",
  "password": "string"
}
```

_Response (200 - OK)_

```json
{
  "access_token": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "error": {
    "message": [
        "Username is required",
    ]
  }
}
OR
{
  "error": {
    "message": [
        "Password is required",
    ]
  }
}
```

_Response (401 - Unauthorized)_

```json
{
  "error": {
    "message": "Invalid username or password"
  }
}
```

## 3. POST /google-login

Request:

- headers:

```json
{
  "google_token": "string"
}
```

_Response (200 - OK)_

```json
{
  "access_token": "string"
}
```

## 4. GET /messages

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
  "message": {
    "username": "string",
    "imgUrl": "string",
    "message": "string"
  }
}
```

## 5. PATCH /messages

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- body:

```json
{
  "isSummarized": "boolean"
}
```

_Response (200 - OK)_

```json
{
  "message": "string"
}
```

_Response (401 - Unauthorized)_

```json
{
  "error": {
    "message": "Invalid token"
  }
}
```

## 6. GET /summary

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
  "message": "string"
}
```

_Response (401 - Unauthorized)_

```json
{
  "statusCode": 401,
  "error": {
    "message": "Invalid token"
  }
}
```

## 7. PATCH /users/:id

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer (required)"
}
```

- body:

```json
{
  "imgUrl": "string"
}
```

_Response (200 - OK)_

```json
{
  "message": [
    {
      "id": "number",
      "imgUrl": "string"
    }
  ]
}
```
