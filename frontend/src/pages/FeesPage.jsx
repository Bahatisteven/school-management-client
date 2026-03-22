import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { feeService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';

function FeesPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedChild]);

  const loadData = async () => {
    try {
      if (user.role === 'parent') {
        const childrenData = await studentService.getChildren();
        setChildren(childrenData.data || []);
        if (childrenData.data.length > 0 && !selectedChild) {
          setSelectedChild(childrenData.data[0].id);
        }
      }

      const childId = user.role === 'parent' ? selectedChild : null;
      if (user.role === 'student' || (user.role === 'parent' && selectedChild)) {
        const balanceData = await feeService.getBalance(childId);
        setBalance(balanceData.data.balance);

        const historyData = await feeService.getHistory(childId);
        setTransactions(historyData.data);
      }
    } catch (error) {
      console.error('Error loading fees:', error);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const childId = user.role === 'parent' ? selectedChild : null;
      await feeService.deposit(parseFloat(amount), description, childId);
      setSuccess('Deposit successful!');
      setAmount('');
      setDescription('');
      setShowDeposit(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const childId = user.role === 'parent' ? selectedChild : null;
      await feeService.withdraw(parseFloat(amount), description, childId);
      setSuccess('Withdrawal successful!');
      setAmount('');
      setDescription('');
      setShowWithdraw(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Fee Management</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {user.role === 'parent' && children.length > 0 && (
          <div className="card">
            <label>Select Child:</label>
            <select
              value={selectedChild || ''}
              onChange={(e) => setSelectedChild(e.target.value)}
              style={{ marginTop: '10px', padding: '10px' }}
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.firstName} {child.lastName} - {child.studentId}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="card">
          <h2>Current Balance</h2>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#4f46e5', margin: '20px 0' }}>
            RWF {balance.toLocaleString()}
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-success" onClick={() => setShowDeposit(true)}>
              Deposit
            </button>
            <button className="btn btn-danger" onClick={() => setShowWithdraw(true)}>
              Withdraw
            </button>
          </div>
        </div>

        {showDeposit && (
          <div className="card">
            <h3>Make Deposit</h3>
            <form onSubmit={handleDeposit}>
              <div className="input-group">
                <label>Amount (RWF)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Deposit'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeposit(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showWithdraw && (
          <div className="card">
            <h3>Request Withdrawal</h3>
            <form onSubmit={handleWithdraw}>
              <div className="input-group">
                <label>Amount (RWF)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  max={balance}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-danger" disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowWithdraw(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <h2>Transaction History</h2>
          {transactions.length > 0 ? (
            <table style={{ width: '100%', marginTop: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      {new Date(txn.transactionDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: txn.type === 'deposit' ? '#d1fae5' : '#fee2e2',
                          color: txn.type === 'deposit' ? '#065f46' : '#991b1b',
                        }}
                      >
                        {txn.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{txn.description || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      RWF {txn.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      RWF {txn.balanceAfter.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ marginTop: '20px' }}>No transactions yet</p>
          )}
        </div>
      </div>
    </>
  );
}

export default FeesPage;
