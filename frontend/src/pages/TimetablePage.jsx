import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { academicService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';
import { Calendar, Clock, BookOpen, User } from 'lucide-react';

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
        <div className="page-header">
          <h1>Class Timetable</h1>
          <p>View your class schedule and subjects</p>
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

        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading timetable...</div>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <Calendar size={20} />
            {error}
          </div>
        ) : timetable ? (
          <>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="stat-icon-wrapper" style={{ background: '#667eea' }}>
                  <BookOpen size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>{timetable.class.name}</h2>
                  <p style={{ color: '#6b7280', marginTop: '4px', margin: 0 }}>Grade: {timetable.class.grade}</p>
                </div>
              </div>
            </div>

            {days.map((day) => {
              const daySchedule = getScheduleByDay(day);
              if (daySchedule.length === 0) return null;

              return (
                <div key={day} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Calendar size={20} color="#667eea" />
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#667eea' }}>{day}</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {daySchedule.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px',
                          background: '#fafafa',
                          borderRadius: '12px',
                          border: '1px solid #f0f0f0',
                          transition: 'all 0.2s ease',
                        }}
                        className="timetable-item"
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <BookOpen size={16} color="#667eea" />
                            <p style={{ fontWeight: '600', fontSize: '16px', margin: 0, color: '#111827' }}>
                              {item.subject}
                            </p>
                          </div>
                          {item.teacher && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={14} color="#6b7280" />
                              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                                {item.teacher}
                              </p>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={16} color="#667eea" />
                          <p
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#667eea',
                              margin: 0,
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
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 20px' }}>No timetable available</p>
          </div>
        )}
      </div>
    </>
  );
}

export default TimetablePage;
