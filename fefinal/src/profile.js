import React, { useState, useEffect } from 'react';
import './style/Profile.css';
import axios from 'axios';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userName: '',
    email: '',
    birthday: '',
    avatar: 'https://via.placeholder.com/150',
    timezone: '',
    notifications: 'On',
    linkedAccounts: '',
    language: 'English',
    privacy: 'Public',
    bio: '',
  });

  const [friends, setFriends] = useState([]);
  const [newFriendLink, setNewFriendLink] = useState('');
  const [events, setEvents] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;

    // Fetch user info
    axios.get(`http://localhost:8003/api/users/${userId}`)
      .then((res) => {
        const data = res.data;
        setUserInfo({
          userName: data.userName || '',
          email: data.email || '',
          birthday: data.birthday || '',
          avatar: data.profilePicture || 'https://via.placeholder.com/150',
          timezone: data.timezone || '',
          notifications: data.notifications || 'On',
          linkedAccounts: data.linkedAccounts || '',
          language: data.language || 'English',
          privacy: data.privacy || 'Public',
          bio: data.bio || '',
        });
        setFriends(data.bio?.split(', ') || []);
      })
      .catch((err) => console.error('Failed to load user:', err));

    // Fetch calendar events
    const fetchEvents = async () => {
      const calendarId = localStorage.getItem('calendarId');
      const token = localStorage.getItem('token');

      if (!calendarId || !token) {
        console.warn('Missing calendarId or token');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:8003/api/calendar/${calendarId}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = res.data.map((note) => ({
          title: note.title,
          date: note.assignedDate,
          description: note.content,
          category: note.subject || 'General',
          location: note.location || '',
          attendees: note.attendees || '',
        }));

        setEvents(mapped);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    fetchEvents();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axios.post('http://localhost:8003/api/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserInfo((prev) => ({ ...prev, avatar: res.data.avatarUrl }));
    } catch (err) {
      console.error('Upload avatar failed:', err);
    }
  };

  const handleAddFriend = () => {
    if (!newFriendLink.trim()) return;
    const updatedFriends = [...friends, newFriendLink.trim()];
    setFriends(updatedFriends);
    setUserInfo((prev) => ({
      ...prev,
      bio: updatedFriends.join(', '),
    }));
    setNewFriendLink('');
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:8003/api/users/${userId}`, {
        ...userInfo,
        profilePicture: userInfo.avatar,
        bio: friends.join(', '),
      });
      setIsEditing(false);
      alert('Your information has been updated!');
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  };

  return (
    <div className="profile-container">
      <h2 style={{ color: '#2f4f2f', textAlign: 'center', marginBottom: '20px' }}>👤 Personal Profile</h2>
      <div className="profile-layout">
        {/* Profile Section */}
        <div className="profile-card">
          <img src={userInfo.avatar} alt="Avatar" className="avatar" />

          {isEditing ? (
            <div className="form">
              <label>Username</label>
              <input type="text" name="userName" value={userInfo.userName} onChange={handleChange} />

              <label>Email</label>
              <input type="email" name="email" value={userInfo.email} onChange={handleChange} />

              <label>Birthday</label>
              <input type="date" name="birthday" value={userInfo.birthday} onChange={handleChange} />

              <label>Time Zone</label>
              <input type="text" name="timezone" value={userInfo.timezone} onChange={handleChange} />

              <label>Notifications</label>
              <select name="notifications" value={userInfo.notifications} onChange={handleChange}>
                <option value="On">On</option>
                <option value="Off">Off</option>
              </select>

              <label>Linked Accounts</label>
              <input type="text" name="linkedAccounts" value={userInfo.linkedAccounts} onChange={handleChange} />

              <label>Language</label>
              <select name="language" value={userInfo.language} onChange={handleChange}>
                <option value="English">English</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Other">Other</option>
              </select>

              <label>Privacy</label>
              <select name="privacy" value={userInfo.privacy} onChange={handleChange}>
                <option value="Public">Public</option>
                <option value="Friends">Friends</option>
                <option value="Private">Private</option>
              </select>

              <label>Avatar Image</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />

              <label>Add Friend (Social Link)</label>
              <input
                type="url"
                placeholder="https://facebook.com/username"
                value={newFriendLink}
                onChange={(e) => setNewFriendLink(e.target.value)}
              />
              <button onClick={handleAddFriend} disabled={!newFriendLink.trim()}>
                Add Friend
              </button>

              <div className="buttons">
                <button className="save" onClick={handleSave}>Save</button>
                <button className="cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="info">
              <p><strong>👤 Username:</strong> {userInfo.userName}</p>
              <p><strong>📧 Email:</strong> {userInfo.email}</p>
              <p><strong>🎂 Birthday:</strong> {userInfo.birthday}</p>
              <p><strong>🌍 Time Zone:</strong> {userInfo.timezone}</p>
              <p><strong>🔔 Notifications:</strong> {userInfo.notifications}</p>
              <p><strong>🔗 Linked Accounts:</strong> {userInfo.linkedAccounts}</p>
              <p><strong>🌐 Language:</strong> {userInfo.language}</p>
              <p><strong>🔒 Privacy:</strong> {userInfo.privacy}</p>
              <p><strong>🧑‍🤝‍🧑 Friends (Bio):</strong> {userInfo.bio || 'No friends added yet.'}</p>

              <h3 style={{ marginTop: '20px', color: '#2f4f2f' }}>🌿 Friends List</h3>
              {friends.length > 0 ? (
                <ul>
                  {friends.map((link, i) => (
                    <li key={i}>
                      <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No friends added yet.</p>
              )}

              <button className="edit" onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div className="schedule-section">
          <h3>🗓️ Schedule</h3>
          {events.length === 0 ? (
            <p>No events added yet.</p>
          ) : (
            <ul>
              {events.map((event, i) => {
                const datetime = new Date(event.date).toLocaleString();
                return (
                  <li key={i}>
                    <strong>{event.title}</strong> | {datetime} | {event.category}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
