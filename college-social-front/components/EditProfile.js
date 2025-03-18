import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/EditProfile.css'; // Import the CSS file

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    branch: '', // Store branch ID
    skills: [], // Store skill IDs
    registerNumber: '',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]); // Fetched from backend
  const [skills, setSkills] = useState([]); // Fetched from backend
  const navigate = useNavigate();

  // Fetch current user profile data and predefined branches/skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to log in to edit your profile.');
          return;
        }

        // Fetch user profile
        const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { username, email, branch, skills, registerNumber, profilePicture } = profileResponse.data;

        // Fetch branches and skills
        const branchesResponse = await axios.get('http://localhost:5000/api/branches');
        const skillsResponse = await axios.get('http://localhost:5000/api/skills');

        setBranches(branchesResponse.data);
        setSkills(skillsResponse.data);

        // Update form data
        setFormData({
          username,
          email,
          branch: branch?._id || '', // Use branch ID
          skills: skills?.map((skill) => skill._id) || [], // Use skill IDs
          registerNumber,
          profilePicture,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        alert(error.response?.data.message || 'Failed to fetch data');
      }
    };

    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle skills selection
  const handleSkillsChange = (e) => {
    const selectedSkills = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prevData) => ({
      ...prevData,
      skills: selectedSkills,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to update your profile.');
        return;
      }
      // Prepare the data to send
      const updatedData = {
        username: formData.username,
        email: formData.email,
        branch: formData.branch, // Branch ID
        skills: formData.skills, // Array of skill IDs
        registerNumber: formData.registerNumber,
        profilePicture: formData.profilePicture,
      };
      console.log('Sending data:', updatedData); // Log the outgoing data for debugging
      await axios.put('http://localhost:5000/api/auth/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated successfully!');
      navigate('/profile'); // Redirect back to the profile page
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      alert(error.response?.data.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-container">
        <p>Loading...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* Username */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Branch */}
        <div className="form-group">
          <label htmlFor="branch">Branch</label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            required
          >
            <option value="">Select a branch</option>
            {branches.map((branchOption) => (
              <option key={branchOption._id} value={branchOption._id}>
                {branchOption.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div className="form-group">
          <label htmlFor="skills">Skills (Hold Ctrl/Cmd to select multiple)</label>
          <select
            id="skills"
            name="skills"
            multiple
            value={formData.skills}
            onChange={handleSkillsChange}
          >
            {skills.map((skillOption) => (
              <option key={skillOption._id} value={skillOption._id}>
                {skillOption.name}
              </option>
            ))}
          </select>
        </div>

        {/* Register Number */}
        <div className="form-group">
          <label htmlFor="registerNumber">Register Number</label>
          <input
            type="text"
            id="registerNumber"
            name="registerNumber"
            value={formData.registerNumber}
            onChange={handleChange}
          />
        </div>

        {/* Profile Picture */}
        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture URL</label>
          <input
            type="text"
            id="profilePicture"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;