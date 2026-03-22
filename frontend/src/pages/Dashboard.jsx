import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { feeService, academicService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';

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
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Dashboard</h1>

        {user.role === 'student' && (
          <>
            <div className="grid grid-3">
              <div className="card">
                <h3 style={{ marginBottom: '10px', color: '#6b7280' }}>Fee Balance</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4f46e5' }}>
                  RWF {balance?.toLocaleString() || '0'}
                </p>
                {balance < 10000 && (
                  <div className="alert alert-warning" style={{ marginTop: '10px' }}>
                    Low balance warning!
                  </div>
                )}
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '10px', color: '#6b7280' }}>Total Grades</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                  {grades.length}
                </p>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '10px', color: '#6b7280' }}>Average Score</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {grades.length > 0
                    ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1)
                    : '0'}%
                </p>
              </div>
            </div>

            <div className="grid grid-2" style={{ marginTop: '20px' }}>
              <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
                {recentTransactions.length > 0 ? (
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((txn) => (
                        <tr key={txn.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px' }}>
                            <span
                              style={{
                                color: txn.type === 'deposit' ? '#10b981' : '#ef4444',
                                fontWeight: '500',
                              }}
                            >
                              {txn.type.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            RWF {txn.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', fontSize: '14px' }}>
                            {new Date(txn.transactionDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No transactions yet</p>
                )}
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Recent Grades</h3>
                {grades.length > 0 ? (
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Score</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => (
                        <tr key={grade.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px' }}>{grade.subject}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{grade.score}%</td>
                          <td
                            style={{
                              padding: '10px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: grade.score >= 70 ? '#10b981' : '#ef4444',
                            }}
                          >
                            {grade.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No grades yet</p>
                )}
              </div>
            </div>
          </>
        )}

        {user.role === 'parent' && (
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>My Children</h2>
            {children.length > 0 ? (
              <div className="grid grid-2">
                {children.map((child) => (
                  <div key={child.id} className="card" style={{ background: '#f9fafb' }}>
                    <h3>
                      {child.firstName} {child.lastName}
                    </h3>
                    <p>Student ID: {child.studentId}</p>
                    <p>Class: {child.class?.name || 'Not assigned'}</p>
                    <p>Fee Balance: RWF {child.feeBalance.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No children registered</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
