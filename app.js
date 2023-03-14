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
  socket.emit("addID", online)
  socket.broadcast.emit("addID", [metaData.id])

  // Listener for outgoing offers
  socket.on("offer", (offer, id) => {
    // Send offer to target
    connectedSockets.get(id).emit("offer", offer, metaData.id)
  })

  // Listen for outgoing answer
  socket.on("answer", (answer, id) => {
    // Emit answer to original offerer
    connectedSockets.get(id).emit("answer", answer, metaData.id)
  })

  socket.on("disconnect", () => {
    connectedSockets.delete(metaData.id)
    socket.broadcast.emit("delID", metaData.id)
  })
})
