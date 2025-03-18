import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/LikeButton.css';

const LikeButton = ({ postId, likesCount, fetchPosts }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(likesCount);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userId = localStorage.getItem('userId');
        const hasLiked = response.data.likes.includes(userId);
        setLiked(hasLiked);
        setLikes(response.data.likes.length);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    checkLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to like posts.');
        return;
      }

      if (liked) {
        await axios.delete(`http://localhost:5000/api/posts/${postId}/like`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikes(likes - 1);
        setLiked(false);
      } else {
        await axios.post(
          `http://localhost:5000/api/posts/${postId}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikes(likes + 1);
        setLiked(true);
      }
      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error.response?.data.message);
      alert(error.response?.data.message || 'Failed to toggle like');
    }
  };

  return (
    <button onClick={handleLike} className={`like-button ${liked ? 'liked' : ''}`}>
      <span className="heart-icon">{liked ? '❤️' : '🤍'}</span>
      <span className="likes-count">{likes}</span>
    </button>
  );
};

export default LikeButton;