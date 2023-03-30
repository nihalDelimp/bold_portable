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
    // socket.emit('newOrder', order);
    socket.on('new_order', (order) => {
        // handle the new order event here, e.g. save the order to a database
        console.log('new order received:', order);

        // emit the new order event to the admin panel
        io.emit('new_order_recieved', order);
    });
})

module.exports = { server, io };
