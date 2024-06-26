const express = require("express")
const cors = require("cors")
const path = require("path");
const { GoogleRouter } = require("./routes/google.routes");
const { GmailRouter } = require("./routes/gmail.routes");
const { MicrosoftRouter } = require("./routes/microsoft.router");
const { OutlookRouter } = require("./routes/outlook.routes");
const axios = require("axios")
const PORT = process.env.PORT || 8080

const app = express();
app.use(express.json())
app.use(cors())

// Google oauth
app.use("/google",GoogleRouter)

// Gmail routes
app.use("/gmail",GmailRouter)

// MS Oauth

app.use("/microsoft",MicrosoftRouter)

// Outlook routes

app.use("/outlook",OutlookRouter)
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"index.html"))
})



app.listen(PORT,async()=>{
    await axios("https://reachinbox-worker.onrender.com")
    console.log("Worker started")
    console.log(`Server is running at http://localhost:${PORT}`)
} )