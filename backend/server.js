import app from "./src/app.js"
import connectDB from "./src/config/database.js";
import 'dotenv/config'


connectDB()

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
