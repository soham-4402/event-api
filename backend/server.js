require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const authRouter = require("./routes/auth.router")

const app = express()

app.use(express.json())


app.use("/auth",authRouter)

async function connectDB() {
    try {
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB using Native Driver!');
        
        

    } catch (error) {
        console.error('Connection error:', error);
    }
}


app.listen(3000, () => {
    console.log("Server is running on PORT 3000")
    connectDB()
})
