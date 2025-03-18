import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('');
  const [skills, setSkills] = useState([]);
  const [registerNumber, setRegisterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // For inline error messages
  const [branches, setBranches] = useState([]); // Fetched from backend
  const [skillOptions, setSkillOptions] = useState([]); // Fetched from backend
  const navigate = useNavigate();

  // Fetch branches and skills on component mount
  useEffect(() => {
    const fetchBranchesAndSkills = async () => {
      try {
        const branchesResponse = await axios.get('http://localhost:5000/api/branches');
        const skillsResponse = await axios.get('http://localhost:5000/api/skills');

        setBranches(branchesResponse.data);
        setSkillOptions(skillsResponse.data);
      } catch (error) {
        console.error('Error fetching branches and skills:', error.message);
        alert('Failed to load branches and skills. Please try again.');
      }
    };

    fetchBranchesAndSkills();
  }, []);

  // Input Validation Functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    if (!isStrongPassword(password)) {
      setErrors({
        password: 'Password must be at least 8 characters long and include an uppercase letter and a number.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
        branch, // Send branch ID
        skills, // Send skill IDs
        registerNumber,
      });

      alert('Registration successful! Please log in.');
      setIsLogin(true); // Switch to login form after registration
    } catch (error) {
      console.error('Registration failed:', error.response?.data.message);
      if (error.response?.data.message === 'User already exists') {
        setErrors({ email: 'This email is already registered.' });
      } else {
        alert(error.response?.data.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!isValidEmail(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token); // Save token for authentication
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error.response?.data.message);
      if (error.response?.data.message === 'Invalid credentials') {
        setErrors({ email: 'Invalid email or password' });
      } else {
        alert(error.response?.data.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {/* Toggle Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setIsLogin(true)}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: isLogin ? '#007bff' : '#f0f0f0',
            color: isLogin ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            backgroundColor: !isLogin ? '#007bff' : '#f0f0f0',
            color: !isLogin ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Register
        </button>
      </div>

      {/* Login Form */}
      {isLogin && (
        <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
          <h2>Login</h2>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px' }}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
          <br />
          <label htmlFor="password">Password:</label>
          <br />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px' }}
          />
          {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
          <br />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', marginTop: '10px' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {!isLogin && (
        <form onSubmit={handleRegister} style={{ display: 'inline-block', textAlign: 'left' }}>
          <h2>Register</h2>
          <label htmlFor="username">Username:</label>
          <br />
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px' }}
          />
          <br />
          <label htmlFor="email">Email:</label>
          <br />
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px' }}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
          <br />
          <label htmlFor="password">Password:</label>
          <br />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px' }}
          />
          {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
          <br />
          {/* Branch Dropdown */}
          <label htmlFor="branch">Branch:</label>
          <br />
          <select
            id="branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px' }}
          >
            <option value="">Select your branch</option>
            {branches.map((branchOption) => (
              <option key={branchOption._id} value={branchOption._id}>
                {branchOption.name}
              </option>
            ))}
          </select>
          <br />
          {/* Skills Multi-Select */}
          <label htmlFor="skills">Skills (Hold Ctrl/Cmd to select multiple):</label>
          <br />
          <select
            id="skills"
            multiple
            value={skills}
            onChange={(e) => {
              const selectedSkills = Array.from(e.target.selectedOptions, (option) => option.value);
              setSkills(selectedSkills);
            }}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px', height: '100px' }}
          >
            {skillOptions.map((skill) => (
              <option key={skill._id} value={skill._id}>
                {skill.name}
              </option>
            ))}
          </select>
          <br />
          <p>Selected Skills: {skills.map((skillId) => skillOptions.find((s) => s._id === skillId)?.name).join(', ') || 'None'}</p>
          <br />
          <label htmlFor="registerNumber">Register Number:</label>
          <br />
          <input
            id="registerNumber"
            type="text"
            placeholder="Register Number"
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
            required
            style={{ padding: '10px', margin: '10px 0', width: '300px' }}
          />
          <br />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', marginTop: '10px' }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Auth;