const express = require("express")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io").listen(server)
const PORT = 3000

let taxiSocket = null

io.on("connection", socket => {
    console.log("a user connected :D")
    socket.on("taxiRequest", routeResponse => {
        console.log('Someone is looking for a taxi');
        console.log(routeResponse);
        if (taxiSocket !== null) {
            console.log("emit taxiRequest");
            taxiSocket.emit('taxiRequest', routeResponse)
        }
    })

    socket.on('lookingForPassengers', () => {
        console.log('Someone is looking for a passenger');
        taxiSocket = socket

        
    })
})

server.listen(PORT, ()=> console.log(`Server running on port: ${PORT}`))