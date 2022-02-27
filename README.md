# simple ws server that running on same port with http server

## HTTP endpoints:
### list rooms
```
curl --location --request GET 'http://localhost:1781/rooms'
```
#
### create room 
```
curl --location --request POST 'http://localhost:1781/room' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "my new room"
}'
```
#

## WS
### connect to room with ws://localhost:1781/${roomId}
#### if room not exist, you will be  notified and connection will be closed
```
ws://localhost:1781/18942c20-e801-47c8-a822-7fd557c2106d
```

# ws events (routes analog):
## list-users
### return array all users in this room

request: 
```
{"event": "list-users"}
```
response:
```
{
    "event": "list-users",
    "users": [
        {
            "id": "8087cb8f-3602-432b-a60b-12e3ab10cd10",
            "name": "anonym"
        },
        {
            "id": "d38d1514-5727-4db3-9fd9-e225bd3408b3",
            "name": "anonym"
        },
        {
            "id": "13c27329-61ce-4114-9482-6379b23315ca",
            "name": "newName"
        }
    ]
}
```
#
## sign-up
### sets your name that will be visible for all users 

request: 
```
{"event": "sign-up", "data": {"name": "newName"}}
```
response:
```
{
    "event": "sign-up",
    "success": true
}
```
#
## send message
### send message to all users in this room

request: 
```
{"event": "send-message", "data": {"text": "hello"}}
```
response will be broadcasted to all users in this room:
```
{
    "event": "new-message",
    "user": {
        "id": "5f562f01-ae9f-42c9-b813-cf8cbbd29940",
        "name": "anonym"
    },
    "message": {
        "text": "hello"
    }
}
```
#