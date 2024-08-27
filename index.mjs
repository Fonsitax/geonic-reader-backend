import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

dotenv.config();

const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.NEON_URL,
});


const app = express();
app.use(cors());
app.use(express.json());

//GET 
app.get('/readings/all', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM readings');

        const posts = result.rows;
        client.release();
        res.json(posts);
    } catch (error) {
        console.error('error running query', error.stack);
        res.status(500).send("Error connecting to database");
    }
});

//GET by id
app.get('/readings/id/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        const result = await pool.query('SELECT * FROM readings WHERE id = $1', [id]);
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

//GET by country
app.get('/readings/country/:country', async (req, res) => {
    const { country } = req.params;
    try {
        const client = await pool.connect();
        const searchCountry = `%${country}%`;
        const result = await client.query('SELECT * FROM readings WHERE LOWER(country) LIKE LOWER($1)', [searchCountry]);

        res.status(200).json(result.rows);
        client.release();
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));