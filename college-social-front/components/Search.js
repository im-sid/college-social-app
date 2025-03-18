import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProfileCardMini from './ProfileCardMini'; // Import the ProfileCardMini component
import '../styles/Search.css'; // Import the CSS file

const Search = () => {
  const [query, setQuery] = useState(''); // Search query
  const [results, setResults] = useState(null); // Search results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) {
      alert('Please enter a search query.');
      return;
    }

    setLoading(true);
    setError(null); // Reset error state

    try {
      const token = localStorage.getItem('token'); // Optional: Include token for authenticated searches
      const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log('Search Results:', response.data); // Debugging log
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error.response?.data || error.message);
      setError(error.response?.data.message || 'Failed to fetch search results');
      alert(error.response?.data.message || 'An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      {/* Search Input */}
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Display Results */}
      {error && <p className="error-message">{error}</p>}

      {results && (
        <div className="search-results">
          {/* Users Section */}
          {results.users.length > 0 && (
            <div className="result-section">
              <h3>Users</h3>
              {results.users.map((user) => (
                <ProfileCardMini key={user._id} user={user} />
              ))}
            </div>
          )}

          {/* Posts Section */}
          {results.posts.length > 0 && (
            <div className="result-section">
              <h3>Posts</h3>
              {results.posts.map((post) => (
                <div key={post._id} className="search-item">
                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
                  <p className="tags">Tags: {post.tags.join(', ')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tags Section */}
          {results.tags.length > 0 && (
            <div className="result-section">
              <h3>Tags</h3>
              <div className="tag-list">
                {results.tags.map((tag, index) => (
                  <span key={index} className="tag-item">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {!results.posts.length && !results.users.length && !results.tags.length && (
            <p className="no-results">No results found for "{query}".</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;