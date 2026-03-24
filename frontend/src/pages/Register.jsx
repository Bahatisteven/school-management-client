import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const { register } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const strength = {
      0: { text: '', color: '' },
      1: { text: 'Very Weak', color: '#ef4444' },
      2: { text: 'Weak', color: '#f97316' },
      3: { text: 'Fair', color: '#eab308' },
      4: { text: 'Good', color: '#22c55e' },
      5: { text: 'Strong', color: '#16a34a' },
    };

    return { score, ...strength[score] };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSuccess('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const backendErrors = {};
        err.response.data.details.forEach(detail => {
          const field = detail.param || detail.path;
          if (field) {
            backendErrors[field] = detail.msg || detail.message;
          }
        });
        setFieldErrors(backendErrors);
      } else if (err.response?.data?.error) {
        setFieldErrors({ general: err.response.data.error });
      } else {
        setFieldErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join our school management platform</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {fieldErrors.general && (
            <div style={styles.alertError}>
              <svg style={styles.alertIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {fieldErrors.general}
            </div>
          )}

          {success && (
            <div style={styles.alertSuccess}>
              <svg style={styles.alertIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                First Name <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.firstName ? styles.inputError : {})
                }}
                disabled={loading}
                placeholder="First name"
              />
              {fieldErrors.firstName && (
                <span style={styles.errorText}>{fieldErrors.firstName}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Last Name <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.lastName ? styles.inputError : {})
                }}
                disabled={loading}
                placeholder="Last name"
              />
              {fieldErrors.lastName && (
                <span style={styles.errorText}>{fieldErrors.lastName}</span>
              )}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Email Address <span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(fieldErrors.email ? styles.inputError : {})
              }}
              disabled={loading}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <span style={styles.errorText}>{fieldErrors.email}</span>
            )}
          </div>

          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.phoneNumber ? styles.inputError : {})
                }}
                disabled={loading}
                placeholder="+250..."
              />
              {fieldErrors.phoneNumber && (
                <span style={styles.errorText}>{fieldErrors.phoneNumber}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Role <span style={styles.required}>*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.input}
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={styles.input}
                disabled={loading}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Password <span style={styles.required}>*</span>
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.password ? styles.inputError : {}),
                  paddingRight: '40px'
                }}
                disabled={loading}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={styles.eyeIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={styles.eyeIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formData.password && (
              <div style={styles.strengthMeter}>
                <div style={styles.strengthBarContainer}>
                  <div
                    style={{
                      ...styles.strengthBar,
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                {passwordStrength.text && (
                  <span style={{ ...styles.strengthText, color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </span>
                )}
              </div>
            )}
            {fieldErrors.password && (
              <span style={styles.errorText}>{fieldErrors.password}</span>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Confirm Password <span style={styles.required}>*</span>
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.confirmPassword ? styles.inputError : {}),
                  paddingRight: '40px'
                }}
                disabled={loading}
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={styles.eyeIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={styles.eyeIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span style={styles.errorText}>{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg style={styles.spinner} viewBox="0 0 24 24">
                  <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '48px',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '600px',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    display: 'block',
    fontSize: '13px',
    color: '#ef4444',
    marginTop: '6px',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'color 0.2s',
  },
  eyeIcon: {
    width: '20px',
    height: '20px',
  },
  strengthMeter: {
    marginTop: '8px',
  },
  strengthBarContainer: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    transition: 'all 0.3s ease',
    borderRadius: '2px',
  },
  strengthText: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '4px',
  },
  alertError: {
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#991b1b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  alertSuccess: {
    padding: '12px 16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    color: '#166534',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  alertIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  submitButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  submitButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
  },
  spinnerCircle: {
    opacity: 0.25,
  },
  spinnerPath: {
    opacity: 0.75,
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#6b7280',
  },
  link: {
    color: '#667eea',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Register;
