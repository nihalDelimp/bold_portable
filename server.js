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


    socket.on('new_quote', (quote) => {
        console.log('new quote received:', quote);

        // emit the new quote event to the admin panel
        io.emit('new_quote_recieved', quote);
    });

    // Send a cancel order event to the user panel
    socket.on('cancel_order', (data) => {
        console.log('cancel order received for orderId:', data.orderId, 'order:', data.order);

        // emit the cancel order event to the user panel
        io.emit('cancel_order_received', data.order);
    });
})

module.exports = { server, io };
