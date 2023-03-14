const http = require('http');
const app = require('./app');
const socket = require("socket.io");
const port = process.env.PORT || 4000;
const server = http.createServer(app);
console.log(`Server is listening at PORT:-${port}`)
server.listen(port);
const io = socket(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Socket is connected")
})

