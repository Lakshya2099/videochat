const express = require('express');
const path = require('path');
const app = express();
const indexRouter = require('./routes/index');

const http = require("http");
const socketIO = require("socket.io");

const server = http.createServer(app);
const io = socketIO(server);

let waitingusers = [];

// Example structure for rooms (ensure proper handling in the logic)
let rooms = {
  'sdfhbhskjsbcskjdcb': ['sdffsfsf', 'asdfasfs'],
};

io.on("connection", function(socket) {
  // Listen for when a user joins a room
  socket.on("joinroom", function() {
    if (waitingusers.length > 0) {
      let partner = waitingusers.shift();
      const roomname = `${socket.id}-${partner.id}`;

      socket.join(roomname);
      partner.join(roomname);

      io.to(roomname).emit("joined",roomname);
    } else {
      waitingusers.push(socket);
    }
  });

    socket.on("signalingMessage", function(data){
      socket.broadcast.to(data.room).emit("signalingMessage",data.message);
    })

  socket.on("message", function(data){
    socket.broadcast.to(data.room).emit("message", data.message);
  })

socket.on("startVideoCall", function({room}){
  
  socket.broadcast.to(room).emit("incomingCall");
})

socket.on("rejectCall", function({room}){
  
  socket.broadcast.to(room).emit("callRejected");
})

socket.on("acceptCall", function({room}){
  socket.broadcast.to(room).emit("callAccepted");
})
  
  socket.on("disconnect", function() {
    
    let index = waitingusers.findIndex(
      (waitingUser) => waitingUser.id === socket.id
    );

      waitingusers.splice(index, 1);
    }
  );
});

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
