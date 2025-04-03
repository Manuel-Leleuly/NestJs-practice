# User API Spec

## Register User

Endpoint: POST /api/users

Request Body:

```json
{
  "username": "manuel",
  "password": "rahasia",
  "name": "Manuel Leleuly"
}
```

Response Body (success):

```json
{
  "data": {
    "username": "manuel",
    "name": "Manuel Leleuly"
  }
}
```

Response Body (failed):

```json
{
  "errors": "Username already registered"
}
```

## Login User

Endpoint: POST /api/users/login

Request Body:

```json
{
  "username": "manuel",
  "password": "rahasia"
}
```

Response Body (success):

```json
{
  "data": {
    "username": "manuel",
    "name": "Manuel Leleuly",
    "token": "session_id_generated"
  }
}
```

Response Body (failed):

```json
{
  "errors": "Username or password is wrong"
}
```

## Get User

Endpoint: GET /api/users/current

Headers:

- authorization: token

Response Body (success):

```json
{
  "data": {
    "username": "manuel",
    "name": "Manuel Leleuly"
  }
}
```

Response Body (failed):

```json
{
  "errors": "Unauthorized"
}
```

## Update User

Endpoint: PATCH /api/users/current

Headers:

- Authorization: token

Request Body:

```json
{
  "password": "rahasia", // optional
  "name": "Manuel Leleuly" // optional
}
```

Response Body (success):

```json
{
  "data": {
    "username": "manuel",
    "name": "Manuel Leleuly"
  }
}
```

Response Body (failed):

```json
{
  "errors": "Username already registered"
}
```

## Logout User

Endpoint: DELETE /api/users/current

Headers:

- Authorization: token

Response Body (success):

```json
{
  "data": true
}
```
