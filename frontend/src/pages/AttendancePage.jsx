import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { academicService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

function AttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedChild, startDate, endDate]);

  const loadData = async () => {
    setLoading(true);
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
        const attendanceData = await academicService.getAttendance(
          childId,
          startDate,
          endDate
        );
        setAttendance(attendanceData.data);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      present: { bg: '#d1fae5', text: '#065f46' },
      absent: { bg: '#fee2e2', text: '#991b1b' },
      late: { bg: '#fef3c7', text: '#92400e' },
      excused: { bg: '#dbeafe', text: '#1e40af' },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  const calculateStats = () => {
    const total = attendance.length;
    if (total === 0) return { present: 0, absent: 0, late: 0, excused: 0, rate: 0 };

    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const excused = attendance.filter((a) => a.status === 'excused').length;
    const rate = ((present / total) * 100).toFixed(1);

    return { present, absent, late, excused, rate };
  };

  const stats = calculateStats();

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Attendance Records</h1>
          <p>Track your attendance and presence history</p>
        </div>

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
          <h3>Filter by Date Range</h3>
          <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={{ alignSelf: 'flex-end' }}
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading attendance...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-3">
              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                    <CheckCircle size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Attendance Rate</h3>
                </div>
                <div className="stat-number">{stats.rate}%</div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#667eea' }}>
                    <CheckCircle size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Present</h3>
                </div>
                <div className="stat-number">{stats.present}</div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#ef4444' }}>
                    <XCircle size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Absent</h3>
                </div>
                <div className="stat-number">{stats.absent}</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Attendance History</h2>
              {attendance.length > 0 ? (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th>Remarks</th>
                        <th>Recorded By</th>
                      </tr>
                    </thead>
                    <tbody>
                    {attendance.map((record) => {
                      const color = getStatusColor(record.status);
                      return (
                        <tr key={record.id}>
                          <td style={{ fontSize: '13px', color: '#6b7280' }}>
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge badge-${record.status === 'present' ? 'success' : record.status === 'absent' ? 'danger' : 'warning'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td>{record.remarks || '-'}</td>
                          <td>{record.recordedBy || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 20px' }}>No attendance records found</p>
            )}
          </div>
        </>
      )}
      </div>
    </>
  );
}

export default AttendancePage;
