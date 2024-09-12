// server.js

const express = require('express');
const os = require('os');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 443;
const pool = require('./config/db');
const locationCheckin = require('./router/locationRouter');
const userRoutes = require('./router/userRoutes');
const ATDRoutes = require('./router/atdRouter');
const advertRouter = require('./router/advertRouter');
const cors = require('cors');
app.use(express.json());
app.use(cors());
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Successfully connected to PostgreSQL');
    }
});
app.get('/', function (req, res) {
    console.log("test")
    res.send(`API OK ${os.hostname()}`); // ใช้ os.hostname() แทน os.hostname
});
app.use('/api', locationCheckin);
app.use('/api', userRoutes);
app.use('/api', ATDRoutes);
app.use('/api', advertRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
