import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { feeService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

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
        <div className="page-header">
          <h1>Fee Management</h1>
          <p>Manage your school fee balance and transactions</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <AlertCircle size={20} />
            {success}
          </div>
        )}

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
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div className="stat-icon-wrapper" style={{ background: '#667eea' }}>
                <DollarSign size={20} strokeWidth={2.5} />
              </div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>Current Balance</h2>
            </div>
            <p style={{ fontSize: '42px', fontWeight: '700', color: '#667eea', margin: '20px 0' }}>
              RWF {balance.toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-success" onClick={() => setShowDeposit(true)}>
              <TrendingUp size={18} />
              Deposit
            </button>
            <button className="btn btn-danger" onClick={() => setShowWithdraw(true)}>
              <TrendingDown size={18} />
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
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Transaction History</h2>
          {transactions.length > 0 ? (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td style={{ fontSize: '13px', color: '#6b7280' }}>
                        {new Date(txn.transactionDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td>
                        <span className={`badge ${txn.type === 'deposit' ? 'badge-success' : 'badge-danger'}`}>
                          {txn.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{txn.description || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        RWF {txn.amount.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                        RWF {txn.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 20px' }}>No transactions yet</p>
          )}
        </div>
      </div>
    </>
  );
}

export default FeesPage;
