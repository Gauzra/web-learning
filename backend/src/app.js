const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const materialRoutes = require('./routes/materialRoutes');
const materialVideoRoutes = require('./routes/materialVideoRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const penilaianRoutes = require('./routes/penilaianRoutes');

const app = express();

app.use(cors());

app.use(express.json());

app.use(
    '/uploads',
    express.static(
        path.join(process.cwd(), 'uploads')
    )
);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'SMARTFIN API is running'
    });
});

app.use('/api/auth', authRoutes);

app.use('/api/materials', materialRoutes);

app.use('/api/material-videos', materialVideoRoutes);

app.use('/api/exercises', exerciseRoutes);

app.use('/api/penilaian', penilaianRoutes);

module.exports = app;