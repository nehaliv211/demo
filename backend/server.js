const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger for diagnostics
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Get all customers (or search by name)
app.get('/api/customers', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM customers ORDER BY created_at DESC';
        let params = [];

        if (search) {
            query = 'SELECT * FROM customers WHERE name LIKE ? ORDER BY created_at DESC';
            params = [`%${search}%`];
        }

        const [rows] = await db.query(query, params);
        console.log(`Successfully fetched ${rows.length} customers`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// Add a new customer
app.post('/api/customers', async (req, res) => {
    try {
        const { name, notes, total_amount, pending_amount } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const [result] = await db.query(
            'INSERT INTO customers (name, notes, total_amount, pending_amount) VALUES (?, ?, ?, ?)',
            [name, notes || '', total_amount || 0, pending_amount || 0]
        );

        res.status(201).json({ 
            id: result.insertId, 
            name, 
            notes: notes || '',
            total_amount: total_amount || 0, 
            pending_amount: pending_amount || 0 
        });
    } catch (error) {
        console.error('Error adding customer:', error);
        res.status(500).json({ error: 'Failed to add customer' });
    }
});

// Update a customer
app.put('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, total_amount, pending_amount } = req.body;

        const [result] = await db.query(
            'UPDATE customers SET notes = ?, total_amount = ?, pending_amount = ? WHERE id = ?',
            [notes, total_amount, pending_amount, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// Delete a customer
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
