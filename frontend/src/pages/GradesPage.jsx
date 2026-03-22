import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { academicService, studentService } from '../services';
import { useAuth } from '../utils/AuthContext';

function GradesPage() {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedChild]);

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
        <h1 style={{ marginBottom: '30px' }}>Academic Grades</h1>

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
        ) : (
          <>
            <div className="card">
              <h2>Overall Performance</h2>
              <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
                <div>
                  <p style={{ color: '#6b7280', marginBottom: '5px' }}>Total Grades</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4f46e5' }}>
                    {grades.length}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', marginBottom: '5px' }}>Average Score</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                    {calculateAverage()}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>All Grades</h2>
              {grades.length > 0 ? (
                <table style={{ width: '100%', marginTop: '20px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Score</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Grade</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Exam Type</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Term</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Teacher</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{grade.subject}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '18px' }}>
                          {grade.score}%
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            color: grade.score >= 70 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {grade.grade}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: '#f3f4f6',
                            }}
                          >
                            {grade.examType || 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{grade.term || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{grade.teacher || 'N/A'}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                          {new Date(grade.recordedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ marginTop: '20px' }}>No grades recorded yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default GradesPage;
