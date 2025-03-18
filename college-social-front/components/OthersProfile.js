import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ProfileCardMini from './ProfileCardMini';
import "../styles/OthersProfile.css";

const OthersProfile = () => {
  const { userId } = useParams(); // Get the userId from the URL
  const [user, setUser] = useState(null); // User profile data
  const [posts, setPosts] = useState([]); // Posts created by the user
  const [acquaintances, setAcquaintances] = useState([]); // Acquaintances of the user
  const [view, setView] = useState('posts'); // State to toggle between posts and acquaintances
  const [isAcquaintance, setIsAcquaintance] = useState(false); // Check if the current user is an acquaintance
  const [hasPendingRequest, setHasPendingRequest] = useState(false); // Check if there's a pending request
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch user profile, posts, and acquaintances on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to log in to view this profile.');
          return;
        }
        // Fetch user profile
        const profileResponse = await axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setUser(profileResponse.data);
          // Fetch user-specific posts
          const postsResponse = await axios.get(`http://localhost:5000/api/posts?userId=${profileResponse.data._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPosts(postsResponse.data);
          // Fetch acquaintances of the viewed user
          const acquaintancesResponse = await axios.get(`http://localhost:5000/api/users/${userId}/acquaintances`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAcquaintances(acquaintancesResponse.data);
          // Fetch logged-in user's acquaintances and pending requests
          const currentUserResponse = await axios.get(`http://localhost:5000/api/users/acquaintances`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const currentUser = currentUserResponse.data;
          // Check if the viewed user is already an acquaintance
          const currentUserAcquaintances = currentUser.acquaintances.map((a) => a._id);
          setIsAcquaintance(currentUserAcquaintances.includes(userId));
          // Check if there's a pending request to the viewed user
          const currentUserPendingRequests = currentUser.pendingRequests.map((r) => r._id);
          setHasPendingRequest(currentUserPendingRequests.includes(userId));
          setLoading(false); // Stop loading
        }
      } catch (error) {
        console.error('Error fetching profile data:', error.response?.data || error.message);
        alert(error.response?.data.message || 'Failed to fetch profile data');
        setLoading(false); // Stop loading
      }
    };
    fetchProfileData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Handle sending an acquaintance request
  const handleSendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to send an acquaintance request.');
        return;
      }
      // Send the acquaintance request
      const response = await axios.post(
        `http://localhost:5000/api/users/send-acquaintance-request/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setHasPendingRequest(true); // Update state to reflect the pending request
        alert('Acquaintance request sent successfully!');
      }
    } catch (error) {
      console.error('Error sending acquaintance request:', error.response?.data || error.message);
      alert(error.response?.data.message || 'Failed to send acquaintance request');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p>Loading...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <p>User not found.</p>
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
          alt={`${user.username}'s profile`}
          className="profile-picture"
        />
        {/* User Details */}
        <h2>{user.username}</h2>
        <p>Email: {user.email}</p>
        <p>Branch: {user.branch?.name || 'Not specified'}</p>
        <p>
          Skills:{' '}
          {Array.isArray(user.skills) && user.skills.length > 0
            ? user.skills.map((skill) => skill.name).join(', ')
            : 'No skills added'}
        </p>
        {/* Buttons Based on Relationship Status */}
        {!isAcquaintance && !hasPendingRequest && (
          <button onClick={handleSendRequest} className="add-acquaintance-btn">
            Send Acquaintance Request
          </button>
        )}
        {hasPendingRequest && <p className="pending-request">Pending Request Sent</p>}
        {isAcquaintance && <p className="already-acquaintance">Already an Acquaintance</p>}
      </div>
      {/* Bottom Section: Toggle Between Posts and Acquaintances */}
      <div className="toggle-buttons">
        <button
          className={`toggle-button ${view === 'posts' ? 'active' : ''}`}
          onClick={() => setView('posts')}
        >
          Posts
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
            <h3>Posts</h3>
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

export default OthersProfile;