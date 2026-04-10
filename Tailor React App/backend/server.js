require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
console.log("MONGO_URI loaded as:", process.env.MONGO_URI ? "Valid String" : "UNDEFINED");


const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const incomeRoutes = require('./src/routes/incomeRoutes');
const measurementRoutes = require('./src/routes/measurementRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/measurements', measurementRoutes);

app.get('/', (req, res) => {
    res.send('Tailor Management API is running...');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();

