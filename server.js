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
        console.log('new order received:', order);

        // emit the new order event to the admin panel
        io.emit('new_order_recieved', order);
    });

    // Send a cancel order event to the user panel
    socket.on('cancel_order', (orderId) => {
        console.log('cancel order received for orderId:', orderId, "heloo");

        // emit the cancel order event to the user panel
        io.emit('cancel_order_received', orderId);
    });
})

module.exports = { server, io };
