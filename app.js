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
    id: socket.id,
  }
  connectedSockets.set(metaData.id, socket)
  const online = [...connectedSockets.keys()].filter(
    (val) => val != metaData.id
  )
  console.log("EMIT NEW for", metaData.id, online)
  socket.emit("new", online)

  // Listener for outgoing peer keys
  socket.on("peer", (offer, id) => {
    // Send peer key to target
    connectedSockets.get(id).emit("peer", offer, metaData.id)
    console.log("Peer invitation from", metaData.id)
  })

  socket.on("disconnect", () => {
    connectedSockets.delete(metaData.id)
    socket.broadcast.emit("delID", metaData.id)
  })
})
