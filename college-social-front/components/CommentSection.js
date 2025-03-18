import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CommentSection.css';

const CommentSection = ({ postId, comments, fetchPosts, isVisible }) => {
  const [commentText, setCommentText] = useState('');

  const handleComment = async () => {
    if (!commentText.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to comment.');
        return;
      }

      console.log('Posting comment to:', `http://localhost:5000/api/posts/${postId}/comment`, 'with text:', commentText);

      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Comment posted successfully:', response.data);
      setCommentText(''); // Clear input after success
      await fetchPosts(); // Refresh posts to show the new comment
    } catch (error) {
      console.error('Error commenting on post:', error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
        error.response?.status === 401
          ? 'Unauthorized. Please log in again.'
          : 'Failed to add comment. Please try again.'
      );
    }
  };

  if (!isVisible) return null; // Early return if not visible

  return (
    <div className="comment-section">
      {/* Comment Input Field */}
      <div className="comment-input">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button onClick={handleComment}>Post</button>
      </div>

      {/* Display Existing Comments */}
      {comments.length > 0 ? (
        <div className="comments-list">
          <strong>Comments:</strong>
          {comments.map((comment, index) => (
            <div key={index} className="comment-item">
              <img
                src={comment.user.profilePicture || 'https://via.placeholder.com/40'}
                alt={`${comment.user.username}'s profile`}
              />
              <div>
                <strong>{comment.user.username}</strong>
                <p>{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-comments">No comments yet.</p>
      )}
    </div>
  );
};

export default CommentSection;