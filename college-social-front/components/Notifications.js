import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched notifications:', response.data);
        setNotifications(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (index) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to mark notifications as read.');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/notifications/${index}`,
        { read: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedNotifications = [...notifications];
      updatedNotifications[index].read = true;
      setNotifications(updatedNotifications);

      console.log('Notification marked as read:', response.data);
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
      alert('Failed to mark notification as read: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const confirmAcquaintance = async (senderId, index) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to confirm acquaintance requests.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/users/confirm-acquaintance/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the notification from the UI after confirming
      const updatedNotifications = notifications.filter((_, i) => i !== index);
      setNotifications(updatedNotifications);

      console.log('Acquaintance confirmed:', response.data);
      alert('Acquaintance confirmed successfully!');
    } catch (error) {
      console.error('Error confirming acquaintance:', error.response?.data || error.message);
      // If the error is "No pending request from this user", remove the notification anyway
      if (error.response?.data?.message === 'No pending request from this user') {
        const updatedNotifications = notifications.filter((_, i) => i !== index);
        setNotifications(updatedNotifications);
        alert('This request is no longer valid and has been removed.');
      } else {
        alert('Failed to confirm acquaintance: ' + (error.response?.data?.message || 'Server error'));
      }
    }
  };

  const rejectAcquaintance = async (senderId, index) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in to reject acquaintance requests.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/users/reject-acquaintance/${senderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the notification from the UI after rejecting
      const updatedNotifications = notifications.filter((_, i) => i !== index);
      setNotifications(updatedNotifications);

      console.log('Acquaintance rejected:', response.data);
      alert('Acquaintance request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting acquaintance:', error.response?.data || error.message);
      // If the error is "No pending request from this user", remove the notification anyway
      if (error.response?.data?.message === 'No pending request from this user') {
        const updatedNotifications = notifications.filter((_, i) => i !== index);
        setNotifications(updatedNotifications);
        alert('This request is no longer valid and has been removed.');
      } else {
        alert('Failed to reject acquaintance: ' + (error.response?.data?.message || 'Server error'));
      }
    }
  };

  const likesAndComments = notifications.filter(
    (notification) => notification.type === 'like' || notification.type === 'comment'
  );
  const acquaintanceRequests = notifications.filter(
    (notification) => notification.type === 'acquaintance_request'
  );

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="notifications">
      <h2>Notifications</h2>

      <div className="notification-section">
        <h3>Likes and Comments</h3>
        {likesAndComments.length > 0 ? (
          likesAndComments.map((notification, index) => {
            const originalIndex = notifications.findIndex((n) => n === notification);
            return (
              <div key={originalIndex} className={`notification ${notification.read ? 'read' : 'unread'}`}>
                <img
                  src={notification.sender.profilePicture || 'https://via.placeholder.com/40'}
                  alt={`${notification.sender.username}'s profile`}
                />
                <div className="notification-content">
                  <p className="notification-message">
                    {notification.message ||
                      `${notification.sender.username} ${
                        notification.type === 'like' ? 'liked your post' : 'commented on your post'
                      }`}
                  </p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
                {!notification.read && (
                  <button onClick={() => markAsRead(originalIndex)} className="mark-read-btn">
                    Mark as Read
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p>No likes or comments yet.</p>
        )}
      </div>

      <div className="notification-section">
        <h3>Acquaintance Requests</h3>
        {acquaintanceRequests.length > 0 ? (
          acquaintanceRequests.map((notification, index) => {
            const originalIndex = notifications.findIndex((n) => n === notification);
            return (
              <div key={originalIndex} className={`notification ${notification.read ? 'read' : 'unread'}`}>
                <img
                  src={notification.sender.profilePicture || 'https://via.placeholder.com/40'}
                  alt={`${notification.sender.username}'s profile`}
                />
                <div className="notification-content">
                  <p className="notification-message">
                    {notification.message || `${notification.sender.username} sent you an acquaintance request`}
                  </p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
                <div className="action-buttons">
                  <button
                    onClick={() => confirmAcquaintance(notification.sender._id, originalIndex)}
                    className="confirm-btn"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => rejectAcquaintance(notification.sender._id, originalIndex)}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No acquaintance requests yet.</p>
        )}
      </div>
    </div>
  );
};

export default Notifications;