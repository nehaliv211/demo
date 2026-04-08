import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import axios from 'axios';
import CustomerCard from './components/CustomerCard';

// Set API URL from environment variables for production, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/customers';

function App() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');

  // Consolidated Fetch logic
  const fetchCustomers = async (search = '') => {
    try {
      console.log(`Fetching customers with search: "${search}"`);
      const url = search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Run on mount AND when searchQuery changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, searchQuery ? 300 : 0); // No delay for initial load
    return () => clearTimeout(timer);
  }, [searchQuery]);


  // Add new customer
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    try {
      await axios.post(API_URL, { name: newCustomerName });
      setNewCustomerName('');
      fetchCustomers(searchQuery);
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  // Update customer details (amounts and notes)
  const handleUpdateCustomer = async (id, total, pending, notes) => {
    try {
      await axios.put(`${API_URL}/${id}`, {
        total_amount: total,
        pending_amount: pending,
        notes: notes
      });
      fetchCustomers(searchQuery);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchCustomers(searchQuery);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Business Billing</h1>
        <p>Manage your customer payments easily</p>
      </header>

      <div className="controls-area">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <form className="add-bar" onSubmit={handleAddCustomer}>
          <input
            type="text"
            placeholder="New customer name..."
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
          />
          <button type="submit" className="add-btn">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} /> Add
            </span>
          </button>
        </form>
      </div>

      <div className="customers-grid">
        {customers.length === 0 ? (
          <div className="glass empty-state">
            <p>No customers found.</p>
          </div>
        ) : (
          customers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onUpdate={handleUpdateCustomer}
              onDelete={handleDeleteCustomer}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
