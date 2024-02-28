const io = require("socket.io")(8800, {
    cors: {
        origin: "http://localhost:5173",
    }
});

let activeUsers = [];

io.on("connection", (socket) => {
    socket.on("new-user-add", (newUserId) => {
        if (!activeUsers.some((user) => user._id === newUserId)) {
            activeUsers.push({ userId: newUserId, socketId: socket.id });
        }
        // Send all active users to new user
        console.log("New User Connected", activeUsers);
        io.emit("get-users", activeUsers);
    });


    // Listening for "send-message" if you choose to use this event name
    socket.on("send-message", (data) => {
        const { id } = data;
        const user = activeUsers.find((user) => user.userId === id);
        console.log("Sending from socket to:", id);
        console.log("Data:", data);
        if (user) {
            io.to(user.socketId).emit("receive-message", data);
        }
    });

    socket.on("disconnect", () => {
        // Remove user from active users
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", activeUsers);
        // Send all active users to all users
        io.emit("get-users", activeUsers);
    });

});
