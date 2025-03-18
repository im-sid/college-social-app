import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ setView, fetchPosts }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/posts',
        { title, description, tags: tags.split(',').map((tag) => tag.trim()) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Post created successfully!');
      setView('home'); // Switch back to the home view
      fetchPosts(); // Refresh the posts feed
    } catch (error) {
      console.error('Error creating post:', error.response?.data.message);
      alert(error.response?.data.message || 'Failed to create post');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter post description"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              resize: 'vertical',
            }}
            rows="4"
            required
          ></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="tags" style={{ display: 'block', marginBottom: '5px' }}>
            Tags (comma-separated):
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., react, nodejs, mongodb"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setView('home')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;