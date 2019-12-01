const express = require("express")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io").listen(server)
const PORT = 3000

io.on("connection", socket => {
    console.log("a user connected :D")
    socket.on("taxiRequest", routeResponse => {
        console.log(routeResponse);
    })
})

server.listen(PORT, ()=> console.log(`Server running on port: ${PORT}`))