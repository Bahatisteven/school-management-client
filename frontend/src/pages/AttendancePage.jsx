import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { academicService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';

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
        <h1 style={{ marginBottom: '30px' }}>Attendance Records</h1>

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
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="card">
              <h2>Attendance Statistics</h2>
              <div className="grid grid-3" style={{ marginTop: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#10b981', fontSize: '32px', fontWeight: 'bold' }}>
                    {stats.rate}%
                  </p>
                  <p style={{ color: '#6b7280' }}>Attendance Rate</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#4f46e5', fontSize: '32px', fontWeight: 'bold' }}>
                    {stats.present}
                  </p>
                  <p style={{ color: '#6b7280' }}>Present</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#ef4444', fontSize: '32px', fontWeight: 'bold' }}>
                    {stats.absent}
                  </p>
                  <p style={{ color: '#6b7280' }}>Absent</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Attendance History</h2>
              {attendance.length > 0 ? (
                <table style={{ width: '100%', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Recorded By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => {
                      const color = getStatusColor(record.status);
                      return (
                        <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px' }}>
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                background: color.bg,
                                color: color.text,
                                textTransform: 'uppercase',
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>{record.remarks || '-'}</td>
                          <td style={{ padding: '12px' }}>{record.recordedBy || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p style={{ marginTop: '20px' }}>No attendance records found</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default AttendancePage;
