const io = require("socket.io")(8800, {
    cors: {
        origin: "http://localhost:5173",
    }
});

let activeUsers = [];

io.on("connection", (socket) => {
    socket.on("new-user-add", (newUserId) => {
        if (!activeUsers.some((user) => user.email === newUserId)) {
            activeUsers.push({ userId: newUserId, socketId: socket.id });
        }
        // Send all active users to new user
        console.log("New User Connected", activeUsers);
        io.emit("get-users", activeUsers);
    });

    // Listening for "send-message" if you choose to use this event name
    socket.on("send-message", (data) => {
        console.log("send", data);
        const { senderMail } = data;
        const user = activeUsers.find((user) => user.userId === senderMail);
        if (user) {
            io.to(user.socketId).emit("receive-message", data);
        }
    });

    // socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    //     console.log(senderId, receiverId, text);
    //     const user = getUser(receiverId);
    //     console.log(user);
    //     io.to(user?.socketId).emit("getMessage", {
    //         senderId,
    //         text,
    //     });
    // });


    console.log("active", activeUsers);

    socket.on("disconnect", () => {
        // Remove user from active users
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", activeUsers);
        // Send all active users to all users
        io.emit("get-users", activeUsers);
    });

});
