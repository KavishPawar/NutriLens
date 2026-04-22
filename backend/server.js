import app from "./src/app.js"
import connectDB from "./src/config/database.js";
import 'dotenv/config'


connectDB()

app.listen(3000, () => {
    console.log(`PORT StArTeD @3000=======> `)
})