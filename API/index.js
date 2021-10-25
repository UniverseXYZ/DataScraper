const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const connectionString = process.env.DB_URI
const pool = new Pool({ connectionString })
const app = express()
const port = 3000
app.use(cors())

app.get("/transfers", async (req, res) => {
    try {
      const allTransfers = await pool.query("SELECT * FROM transfers ORDER BY id DESC limit 200");
      res.json(allTransfers.rows);
    } catch (err) {
      console.error(err.message);
    }
});
  
app.get("/transfers/from/:addr", async (req, res) => {
    try {
      const { addr } = req.params;
      const transfers = await pool.query("SELECT * FROM transfers WHERE fromAddr = $1 ORDER BY id DESC limit 200", [
        addr
      ]);
  
      res.json(transfers.rows);
    } catch (err) {
      console.error(err.message);
    }
});

app.get("/transfers/to/:addr", async (req, res) => {
    try {
      const { addr } = req.params;
      const transfers = await pool.query("SELECT * FROM transfers WHERE toAddr = $1 ORDER BY id DESC limit 200", [
        addr
      ]);
  
      res.json(transfers.rows);
    } catch (err) {
      console.error(err.message);
    }
});


app.get("/transfers/contract/:addr", async (req, res) => {
    try {
      const { addr } = req.params;
      const transfers = await pool.query("SELECT * FROM transfers WHERE tokenAddr = $1 ORDER BY id DESC limit 200", [
        addr
      ]);
  
      res.json(transfers.rows);
    } catch (err) {
      console.error(err.message);
    }
});

app.get("/transfers/token/:addr/:id", async (req, res) => {
    try {
      const { addr, id } = req.params;
      const transfers = await pool.query("SELECT * FROM transfers WHERE tokenAddr = $1 AND tokenId = $2 ORDER BY id DESC limit 200", [
        addr, id
      ]);
      res.json(transfers.rows);
    } catch (err) {
      console.error(err.message);
    }
});


app.listen(port, () => {
  console.log(`Transfers API listening at http://localhost:${port}`)
})
