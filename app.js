require("dotenv").config()
const http = require("http")
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

  // Listener for outgoing offers
  // socket : Offer maker
  socket.on("makeOffer", (offer) => {
    // Broadcast offer
    socket.broadcast().emit("makeOffer", offer)
    // Listen for outgoing answer
    socket.on("getAnswer", (answer) => {
      // Emit answer to original offerer
      socket.emit("getAnswer", answer)
    })
  })
})
