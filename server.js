const express = require('express');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

const app = express();
const port = 3000;

// Correct the model path to the relative path where your service model exists
const Service = require('./models/service');

app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/healthcare', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("DB connection error: ", err));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Add a new service
app.post('/services', [
    check('name', 'Service name is required').notEmpty(),
    check('price', 'Price must be a number').isFloat({ min: 0 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price } = req.body;
    try {
        const service = new Service({ name, description, price });
        await service.save();
        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Get all services
app.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Update a service by ID
app.put('/services/:id', [
    check('name', 'Service name is required').optional().notEmpty(),
    check('price', 'Price must be a number').optional().isFloat({ min: 0 })
], async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedService) {
            return res.status(404).send("Service not found");
        }
        res.json(updatedService);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Delete a service by ID
app.delete('/services/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const service = await Service.findByIdAndDelete(id);
        if (!service) {
            return res.status(404).send("Service not found");
        }
        res.json({ message: "Service deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});
