import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

//GET 
app.length('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM posts');

        const posts = result.rows;
        client.release();
        res.json(posts);
    } catch (error) {
        console.error('error running query', error.stack);
        res.status(500).send("Error connecting to database");
    }
});

//GET by id
app.get('/posts/:id', async (req, res) => {
    const { id } = req.params; 
    try {
      const client = await pool.connect();
      const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        client.release();
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.status(200).json(result.rows[0]);
      client.release();
    } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));