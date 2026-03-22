import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { academicService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';

function TimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedChild]);

  const loadData = async () => {
    setLoading(true);
    setError('');
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
        const timetableData = await academicService.getTimetable(childId);
        setTimetable(timetableData.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error loading timetable');
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getScheduleByDay = (day) => {
    if (!timetable || !timetable.schedule) return [];
    return timetable.schedule.filter((item) => item.day === day);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '30px' }}>Class Timetable</h1>

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

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : timetable ? (
          <>
            <div className="card">
              <h2>{timetable.class.name}</h2>
              <p style={{ color: '#6b7280', marginTop: '5px' }}>Grade: {timetable.class.grade}</p>
            </div>

            {days.map((day) => {
              const daySchedule = getScheduleByDay(day);
              if (daySchedule.length === 0) return null;

              return (
                <div key={day} className="card">
                  <h3 style={{ marginBottom: '15px', color: '#4f46e5' }}>{day}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {daySchedule.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '15px',
                          background: '#f9fafb',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '5px' }}>
                            {item.subject}
                          </p>
                          {item.teacher && (
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>
                              Teacher: {item.teacher}
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p
                            style={{
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#4f46e5',
                            }}
                          >
                            {item.startTime} - {item.endTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="card">
            <p>No timetable available</p>
          </div>
        )}
      </div>
    </>
  );
}

export default TimetablePage;
