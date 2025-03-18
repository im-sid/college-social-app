import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProfileCardMini from './ProfileCardMini'; // Import the ProfileCardMini component
import "../styles/profile.css"; // Import the CSS file

const Profile = () => {
  const [user, setUser] = useState(null); // User profile data
  const [posts, setPosts] = useState([]); // Posts created by the user
  const [acquaintances, setAcquaintances] = useState([]); // Acquaintances of the user
  const [view, setView] = useState('posts'); // State to toggle between posts and acquaintances
  const navigate = useNavigate();
  let errorShown = false; // Flag to track if an error has been shown

  // Fetch user profile, posts, and acquaintances on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to log in to view your profile.');
          return;
        }

        // Fetch user profile
        const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setUser(profileResponse.data);

          // Fetch user-specific posts
          const postsResponse = await axios.get(`http://localhost:5000/api/posts?userId=${profileResponse.data._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPosts(postsResponse.data);

          // Fetch user's acquaintances
          const acquaintancesResponse = await axios.get(`http://localhost:5000/api/users/acquaintances`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAcquaintances(acquaintancesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error.response?.data || error.message);

        // Only show the alert if there's a genuine error
        if (error.response && error.response.status >= 400 && !errorShown) {
          alert(error.response.data.message || 'Failed to fetch profile data');
          errorShown = true;
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditProfile = () => {
    navigate('/edit-profile'); // Navigate to the edit profile page
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p>Loading...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Top Section: User Details */}
      <div className="user-details">
        {/* Profile Picture */}
        <img
          src={user.profilePicture || 'https://via.placeholder.com/150'}
          alt="Profile"
        />

        {/* User Details */}
        <h2>{user.username || 'Unknown User'}</h2>
        <p>Email: {user.email || 'Not provided'}</p>
        <p>Branch: {user.branch?.name || 'Not specified'}</p>
        <p>
          Skills:{' '}
          {Array.isArray(user.skills) && user.skills.length > 0
            ? user.skills.map((skill) => skill.name).join(', ')
            : 'No skills added'}
        </p>
        <p>Register Number: {user.registerNumber || 'Not available'}</p>

        {/* Edit Profile Button */}
        <button className="edit-profile-btn" onClick={handleEditProfile}>
          Edit Profile
        </button>
      </div>

      {/* Bottom Section: Toggle Between Posts and Acquaintances */}
      <div className="toggle-buttons">
        <button
          className={`toggle-button ${view === 'posts' ? 'active' : ''}`}
          onClick={() => setView('posts')}
        >
          My Posts
        </button>
        <button
          className={`toggle-button ${view === 'acquaintances' ? 'active' : ''}`}
          onClick={() => setView('acquaintances')}
        >
          Acquaintances
        </button>
      </div>

      {/* Conditional Rendering of Posts or Acquaintances */}
      <div className="posts-acquaintances">
        {view === 'posts' ? (
          <>
            <h3>My Posts</h3>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="post-item">
                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
                  <p className="tags">Tags: {post.tags.join(', ')}</p>
                </div>
              ))
            ) : (
              <p className="no-data">No posts available.</p>
            )}
          </>
        ) : (
          <>
            <h3>Acquaintances</h3>
            {acquaintances.length > 0 ? (
              acquaintances.map((acquaintance) => (
                <ProfileCardMini key={acquaintance._id} user={acquaintance} />
              ))
            ) : (
              <p className="no-data">No acquaintances available.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;