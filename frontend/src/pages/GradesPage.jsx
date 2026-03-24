import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { academicService, studentService, notificationService } from '../services';
import { useAuth } from '../utils/AuthContext';
import { GraduationCap, TrendingUp, BookOpen } from 'lucide-react';

function GradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    markGradeNotificationsAsRead();
  }, [selectedChild]);

  const markGradeNotificationsAsRead = async () => {
    try {
      // Mark all grade-related notifications as read
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

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
        const gradesData = await academicService.getGrades(childId);
        setGrades(gradesData.data);
      }
    } catch (error) {
      console.error('Error loading grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    return (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(2);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Academic Grades</h1>
          <p>View your academic performance and grades</p>
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
            <div className="loading-text">Loading grades...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-2">
              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#667eea' }}>
                    <BookOpen size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Total Grades</h3>
                </div>
                <div className="stat-number">{grades.length}</div>
              </div>

              <div className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper" style={{ background: '#10b981' }}>
                    <TrendingUp size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="stat-title">Average Score</h3>
                </div>
                <div className="stat-number">{calculateAverage()}%</div>
              </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>All Grades</h2>
              {grades.length > 0 ? (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th style={{ textAlign: 'center' }}>Score</th>
                        <th style={{ textAlign: 'center' }}>Grade</th>
                        <th style={{ textAlign: 'center' }}>Exam Type</th>
                        <th>Term</th>
                        <th>Teacher</th>
                        <th style={{ textAlign: 'right' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grades.map((grade) => {
                        const isNew = new Date(grade.recordedDate) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                        return (
                          <tr key={grade.id} style={{ backgroundColor: isNew ? '#f0fdf4' : 'transparent' }}>
                            <td style={{ fontWeight: '600' }}>
                              {grade.subject}
                              {isNew && (
                                <span style={{
                                  marginLeft: '8px',
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  color: '#10b981',
                                  background: '#d1fae5',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase'
                                }}>
                                  New
                                </span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontSize: '16px', fontWeight: '600' }}>
                              {grade.score}%
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${grade.score >= 70 ? 'badge-success' : 'badge-danger'}`}>
                                {grade.grade}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge badge-info">
                                {grade.examType || 'N/A'}
                              </span>
                            </td>
                            <td>{grade.term || 'N/A'}</td>
                            <td>{grade.teacher || 'N/A'}</td>
                            <td style={{ textAlign: 'right', fontSize: '13px', color: '#6b7280' }}>
                              {new Date(grade.recordedDate).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 20px' }}>No grades recorded yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GradesPage;
