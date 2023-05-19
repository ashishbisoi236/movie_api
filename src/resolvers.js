require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

const resolvers = {
    Query: {
        movies: async () => {
            const query = 'SELECT * FROM movies';
            const { rows } = await pool.query(query);
            console.log(rows);
            return rows;
        },
        movie: async (_, { id }) => {
            const query = 'SELECT * FROM movies WHERE id = $1';
            const values = [id];
            const { rows } = await pool.query(query, values);
            console.log(rows[0]);
            return rows[0];
        },
        reviews: async (_, { movieId }) => {
            const query = 'SELECT * FROM reviews WHERE movie_id = $1 ORDER BY user_id = $2 DESC';
            const values = [movieId, userId];
            const { rows } = await pool.query(query, values);
            return rows;
        },
    },
    Mutation: {
        signup: async (_, { username, email, password }) => {
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
            const values = [username, email, hashedPassword];
            await pool.query(query, values);
            return 'User registered successfully.';
        },
        login: async (_, { email, password }) => {
            const query = 'SELECT * FROM users WHERE email = $1';
            const values = [email];
            const { rows } = await pool.query(query, values);
            const user = rows[0];
            if (!user) {
                throw new Error('Invalid email or password');
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new Error('Invalid email or password');
            }
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return token;
        },
        changePassword: async (_, { oldPassword, newPassword }, { userId }) => {
            const query = 'SELECT * FROM users WHERE id = $1';
            const values = [userId];
            const { rows } = await pool.query(query, values);
            const user = rows[0];
            if (!user) {
                throw new Error('User not found');
            }
            const passwordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!passwordMatch) {
                throw new Error('Invalid old password');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateQuery = 'UPDATE users SET password = $1 WHERE id = $2';
            const updateValues = [hashedPassword, userId];
            await pool.query(updateQuery, updateValues);
            return 'Password changed successfully.';
        },
        createMovie: async (_, { name, description, director, releaseDate }, { userId }) => {
            const query = 'INSERT INTO movies (name, description, director, release_date) VALUES ($1, $2, $3, $4) RETURNING *';
            const values = [name, description, director, releaseDate];
            const { rows } = await pool.query(query, values);
            console.log("checkpoint...");
            console.log(rows[0]);
            return rows[0];
        },
        updateMovie: async (_, { id, name, description, director, releaseDate }, { userId }) => {
            const query = 'UPDATE movies SET name = $1, description = $2, director = $3, release_date = $4 WHERE id = $5 RETURNING *';
            const values = [name, description, director, releaseDate, id];
            const { rows } = await pool.query(query, values);
            return rows[0];
        },
        deleteMovie: async (_, { id }, { userId }) => {
            const query = 'DELETE FROM movies WHERE id = $1 RETURNING id';
            const values = [id];
            const { rows } = await pool.query(query, values);
            return rows[0].id;
        },
        createReview: async (_, { movieId, rating, comment }, { userId }) => {
            const query = 'INSERT INTO reviews (movie_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *';
            const values = [movieId, userId, rating, comment];
            const { rows } = await pool.query(query, values);
            console.log(rows);
            return rows[0];
        },
        updateReview: async (_, { id, rating, comment }, { userId }) => {
            const query = 'UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3 RETURNING *';
            const values = [rating, comment, id];
            const { rows } = await pool.query(query, values);
            return rows[0];
        },
        deleteReview: async (_, { id }, { userId }) => {
            const query = 'DELETE FROM reviews WHERE id = $1 RETURNING id';
            const values = [id];
            const { rows } = await pool.query(query, values);
            return rows[0].id;
        },
    },
};

module.exports = resolvers;