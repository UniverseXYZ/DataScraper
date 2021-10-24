const express = require('express')
const { Pool } = require('pg')
const connectionString = process.env.DB_URI
const pool = new Pool({ connectionString })
const app = express()
const port = 3000

app.get("/transfers", async (req, res) => {
    try {
      const allTransfers = await pool.query("SELECT * FROM transfers ORDER BY id DESC limit 200");
      res.json(allTransfers.rows);
    } catch (err) {
      console.error(err.message);
    }
});
  
  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
