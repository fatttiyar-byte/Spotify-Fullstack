
import express from "express";
import dotenv from 'dotenv'
import { sql } from "./config/db.js";
import adminRoute from "./route.js";


dotenv.config()


const app = express()
app.use(express.json())

async function initDB(){
      try {
            await sql`
            CREAT TABLE IF NOT EXISTS albums(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            thumbnail VARCHAR(255) NOT NULL,
            CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;





            await sql `
            CREATE TABLE IF NOT EXISTS songs(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            thumbnail VARCHAR(255) NOT NULL,
            audio VARCHAR(255) NOT NULL,
            album_id INT REFERENCES albums(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

            console.log('database initialized successfully✔');
      } catch (error) {

            console.error('Error initializing database:', error);

            throw error;
            
      }
}



app.use('/api/v1/' , adminRoute)







const port =process.env.PORT || 3100

const startServer = async() =>{
    console.log(`server is running on port ${port}`);
    app.listen(port , ()=>{
        console.log(`server is running on port ${port}`)
    })
}

 startServer ()




//  Set up this Neon project in the current working directory.

// 1. `npm i -g neon@latest && neon login`
// 2. `neon skills -y`
// 3. `neon mcp -y`
// 4. `neon link --project-id proud-butterfly-64944588 --branch production -y`
// 5. `neon config init`
// 6. Update `neon.ts`:

// ```ts
// import { defineConfig } from "@neon/config/v1";

// export default defineConfig({});
// ```

// 7. `neon deploy`