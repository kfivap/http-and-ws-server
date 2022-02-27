const express = require('express');
const { v4 } = require('uuid');
const http = require('http');
const WebSocket = require('ws');
const defaultWS = new WebSocket.Server({ noServer: true });

const port = 1781
const app = express();
const server = http.createServer(app);

app.use(express.json());


const connectionHandler = (wss, ws) => {
    ws.user = {
        id: v4(),
        name: 'anonym'
    }
    ws.send(JSON.stringify({ event: 'you-connected', user: ws.user, message: 'welcome' }))
    console.log(wss.clients.size)
    wss.clients.forEach(client => {
        client.send(JSON.stringify({ event: 'user-connected', user: ws.user }))
    })
}

const rooms = {
    'initial': {
        _wss: new WebSocket.Server({ noServer: true }),
        name: 'initial'
    }
}


rooms['initial']._wss.on('connection', (ws) => { return connectionHandler(rooms['initial']._wss, ws) })

app.post('/room', (req, res) => {
    const roomId = v4()
    rooms[roomId] = {
        _wss: new WebSocket.Server({ noServer: true }),
        name: req.body.name,
    }
    rooms[roomId]._wss.on('connection', (ws) => { return connectionHandler(rooms[roomId]._wss, ws) })
    res.json({ message: 'room created', id: roomId })
})

app.get('/rooms', (req, res) => {
    res.json(Object.keys(rooms).map(roomId => {
        return {
            id: roomId,
            name: rooms[roomId].name
        }
    }))
})

server.on('upgrade', (request, socket, head) => {
    const pathname = request.url.substring(1, request.url.length)

    const roomExist = rooms[pathname]
    console.log('room exist', !!roomExist, pathname)
    if (roomExist) {
        roomExist._wss.handleUpgrade(request, socket, head, (ws) => {
            roomExist._wss.emit('connection', ws);
            ws.on('message', (rawMsg) => {
                console.log('user', ws.user)
                const msg = parseMessage(rawMsg)
                switch (msg.event) {
                    case 'send-message':
                        broadcast(roomExist._wss, { event: 'new-message', user: ws.user, message: msg.data })
                        break
                    case 'sign-up':
                        ws.user.name = msg.data.name
                        sendResponse(ws, {event: 'sign-up', success: true})
                        break
                    case 'list-users':
                        const users = []
                        roomExist._wss.clients.forEach(client=>users.push(client.user))
                        sendResponse(ws, {event: 'list-users', users})
                        break
                    default:
                        sendResponse(ws, {event: 'error', message: 'unknown event'})
                }
            })
        });
    } else {
        defaultWS.handleUpgrade(request, socket, head, (ws) => {
            ws.send('room not exist')
        })
        socket.destroy();
    }
});

function broadcast(wss, data) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(data))
    })
}
function sendResponse(ws, data){
    ws.send(JSON.stringify(data))
}
function parseMessage(msg){
    try{
        return JSON.parse(msg)
    } catch {
        return {}
    }
}

server.listen(port, () => {
    console.log('app started')
});
