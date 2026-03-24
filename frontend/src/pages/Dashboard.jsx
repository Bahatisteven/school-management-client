import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { feeService, academicService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';
import { 
  DollarSign, 
  GraduationCap, 
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [grades, setGrades] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (user.role === 'parent') {
        const childrenData = await studentService.getChildren();
        setChildren(childrenData.data || []);
      } else if (user.role === 'student') {
        const balanceData = await feeService.getBalance();
        setBalance(balanceData.data.balance);

        const historyData = await feeService.getHistory();
        setRecentTransactions(historyData.data.slice(0, 5));

        const gradesData = await academicService.getGrades();
        setGrades(gradesData.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading dashboard...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.firstName}! Here's your overview.</p>
        </div>

        {user.role === 'student' && (
          <>
            <div className="grid grid-3">
              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#667eea' }}>
                    <DollarSign size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Fee Balance</h3>
                </div>
                <div className="stat-number">RWF {balance?.toLocaleString() || '0'}</div>
                {balance < 10000 && (
                  <div className="alert alert-warning" style={{ marginTop: '16px' }}>
                    <AlertCircle size={16} />
                    <span>Low balance warning!</span>
                  </div>
                )}
              </div>

              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                    <GraduationCap size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Total Grades</h3>
                </div>
                <div className="stat-number">{grades.length}</div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#f59e0b' }}>
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Average Score</h3>
                </div>
                <div className="stat-number">
                  {grades.length > 0
                    ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
                    : '0'}%
                </div>
              </div>
            </div>

            <div className="grid grid-2" style={{ marginTop: '20px' }}>
              <div className="card">
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Recent Transactions</h3>
                {recentTransactions.length > 0 ? (
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Amount</th>
                          <th style={{ textAlign: 'right' }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((txn) => (
                          <tr key={txn.id}>
                            <td>
                              <span className={`badge ${txn.type === 'deposit' ? 'badge-success' : 'badge-danger'}`}>
                                {txn.type.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>
                              RWF {txn.amount.toLocaleString()}
                            </td>
                            <td style={{ textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>
                              {new Date(txn.transactionDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
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

              <div className="card">
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>Recent Grades</h3>
                {grades.length > 0 ? (
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th style={{ textAlign: 'center' }}>Score</th>
                          <th style={{ textAlign: 'center' }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((grade) => (
                          <tr key={grade.id}>
                            <td style={{ fontWeight: '500' }}>{grade.subject}</td>
                            <td style={{ textAlign: 'center', fontWeight: '600' }}>{grade.score}%</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${grade.score >= 70 ? 'badge-success' : 'badge-danger'}`}>
                                {grade.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 20px' }}>No grades yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {user.role === 'parent' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="stat-icon-wrapper" style={{ background: '#667eea' }}>
                <Users size={20} strokeWidth={2.5} />
              </div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>My Children</h2>
            </div>
            {children.length > 0 ? (
              <div className="grid grid-2">
                {children.map((child) => (
                  <div key={child.id} className="card" style={{ background: '#fafafa', marginBottom: 0 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                      {child.firstName} {child.lastName}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        <strong style={{ color: '#374151' }}>Student ID:</strong> {child.studentId}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        <strong style={{ color: '#374151' }}>Class:</strong> {child.class?.name || 'Not assigned'}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                        <strong style={{ color: '#374151' }}>Fee Balance:</strong> 
                        <span style={{ fontWeight: '700', color: '#667eea', marginLeft: '4px' }}>
                          RWF {child.feeBalance.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 20px' }}>No children registered</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
