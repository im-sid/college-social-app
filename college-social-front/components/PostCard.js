import React, { useState } from 'react';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import './PostCard.css';

const PostCard = ({ post, fetchPosts }) => {
  const [showComments, setShowComments] = useState(false);

  const toggleComments = () => {
    setShowComments((prev) => !prev);
  };

  return (
    <div className="post-card">
      {/* User Info */}
      <div className="user-info">
        <img
          src={post.user.profilePicture || 'https://via.placeholder.com/40'}
          alt={`${post.user.username}'s profile`}
        />
        <strong>{post.user.username}</strong>
      </div>

      {/* Post Title */}
      <h3 className="title">{post.title}</h3>

      {/* Post Content */}
      <p className="description">{post.description}</p>

      {/* Tags */}
      <div className="tags">
        {post.tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="actions">
        <LikeButton postId={post._id} likesCount={post.likes.length} fetchPosts={fetchPosts} />
        <button onClick={toggleComments} className="comment-button">
          {showComments ? 'Hide Comments' : `Comment (${post.comments.length})`}
        </button>
      </div>

      {/* Comments Section */}
      <CommentSection
        postId={post._id}
        comments={post.comments}
        fetchPosts={fetchPosts}
        isVisible={showComments}
      />
    </div>
  );
};

export default PostCard;