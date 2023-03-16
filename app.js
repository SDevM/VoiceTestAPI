require("dotenv").config()
const http = require("http")
const { connect } = require("http2")
const { Server } = require("socket.io")
const httpServer = http.createServer()
const ioSocketServer = new Server(httpServer)

httpServer.listen(process.env.PORT, () => {
  console.log("\tSocket server operational")
})

// VARIABLES
const connectedSockets = new Map()
// VARIABLES

ioSocketServer.on("connection", (socket) => {
  // Initialize metaData and create entry for new socket in connectedSockets map
  const metaData = {
    id: undefined,
  }

  // Listener for new peer keys
  socket.on("set", (id) => {
    metaData.id = id
    connectedSockets.set(metaData.id, socket)
    const online = [...connectedSockets.keys()].filter(
      (val) => val != metaData.id
    )

    console.log("entire", connectedSockets.keys())
    console.log("Emit new for", metaData.id, online)
    socket.emit("new", metaData.id, online)
  })

  // Listener for outgoing peer keys
  socket.on("peer", (peer) => {
    // Send peer key to target
    connectedSockets.get(peer).emit("peer", metaData.id)
    console.log("Peer invitation from", metaData.id, " to ", peer)
  })

  // Listener for outgoing connection requests
  socket.on("channel", (peer) => {
    // Send peer key to target
    connectedSockets.get(peer).emit("channel", metaData.id)
  })

  // Listener for disconnected peers
  socket.on("disconnect", () => {
    connectedSockets.delete(metaData.id)
    socket.broadcast.emit("delID", metaData.id)
  })
})
