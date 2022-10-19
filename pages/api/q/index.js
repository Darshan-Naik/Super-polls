import { Server } from "Socket.IO";

const pools = {};

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  const onConnection = (socket) => {
    socket.on("q-post",(data)=>{
      pools[data.id] = data;
      io.emit(`a-${data.id}`, data);
    })
    socket.on("q-id", (data) => {
      socket.qId = data;
      if (!pools[data]) {
       socket.emit(`no-q`)
      } else {
      socket.emit('q-data', pools[socket.qId])
      }
    });
    socket.on("vote", (data) => {
      pools[socket.qId].options[data]++;
      io.sockets.emit(`a-${socket.qId}`, pools[socket.qId]);
    })
  };

  // Define actions inside
  io.on("connection", onConnection);

  console.log("Setting up socket");
  res.end();
}
