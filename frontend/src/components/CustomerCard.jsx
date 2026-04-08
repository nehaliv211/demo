import React, { useState, useEffect } from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';

const CustomerCard = ({ customer, onUpdate, onDelete }) => {
  const [totalStr, setTotalStr] = useState(customer.total_amount);
  const [pendingStr, setPendingStr] = useState(customer.pending_amount);
  const [notes, setNotes] = useState(customer.notes || '');

  // Sync state if props change (like after a search or refresh)
  useEffect(() => {
    setTotalStr(customer.total_amount);
    setPendingStr(customer.pending_amount);
    setNotes(customer.notes || '');
  }, [customer]);

  const handleBlur = () => {
    // Parse the values to numbers securely
    const total = parseFloat(totalStr) || 0;
    const pending = parseFloat(pendingStr) || 0;
    
    // Only update if changes actually occurred
    if (
      total !== parseFloat(customer.total_amount) || 
      pending !== parseFloat(customer.pending_amount) ||
      notes !== (customer.notes || '')
    ) {
      onUpdate(customer.id, total, pending, notes);
    }
  };

  const isCleared = parseFloat(pendingStr) === parseFloat(totalStr) && parseFloat(totalStr) > 0;
  
  // Calculate Balance (Total - Paid)
  const balance = (parseFloat(totalStr) || 0) - (parseFloat(pendingStr) || 0);

  return (
    <div className="glass customer-card">
      <div className="customer-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>{customer.name}</h2>
            <input 
              className="notes-input"
              placeholder="Add a small note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
          <p>Customer ID: #{customer.id}</p>
        </div>
        <button 
          onClick={() => onDelete(customer.id)}
          style={{ 
            alignSelf: 'flex-start', 
            background: 'transparent', 
            color: 'var(--danger)', 
            border: 'none', 
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.9rem'
          }}
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>

      <div className="financials">
        <div className="amount-group">
          <label>Total Amount</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              className="amount-input"
              value={totalStr}
              onChange={(e) => setTotalStr(e.target.value)}
              onBlur={handleBlur}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="amount-group">
          <label>Paid Amount</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              className="amount-input"
              style={{ color: isCleared ? 'var(--success)' : 'var(--danger)' }}
              value={pendingStr}
              onChange={(e) => setPendingStr(e.target.value)}
              onBlur={handleBlur}
              min="0"
              step="0.01"
            />
          </div>
          {isCleared && (
            <div className="cleared-badge" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
              <CheckCircle size={14} />
              Amount is cleared
            </div>
          )}
        </div>

        <div className="amount-group">
          <label>Balance</label>
          <div className="amount-input-wrapper">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              className="amount-input"
              value={balance.toFixed(2)}
              readOnly
              style={{ background: 'transparent', color: 'var(--text-main)', borderColor: 'transparent', cursor: 'default' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
