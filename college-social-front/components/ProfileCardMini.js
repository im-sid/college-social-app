// ProfileCardMini.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfileCardMini.css';

const ProfileCardMini = ({ user }) => {
  return (
    <Link to={`/profile/${user._id}`} className="profile-card-mini">
      {/* Profile Picture */}
      <img
        src={user.profilePicture || 'https://via.placeholder.com/40'}
        alt={`${user.username}'s profile`}
        className="mini-avatar"
      />
      {/* Username */}
      <strong>{user.username}</strong>
    </Link>
  );
};

export default ProfileCardMini;