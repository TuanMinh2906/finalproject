import React, { useState } from 'react';
import './style/Profile.css';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    birthday: '2000-01-01',
    avatar: 'https://via.placeholder.com/150',
    timezone: 'GMT+7',
    notifications: 'On',
    linkedAccounts: 'Google',
    language: 'English',
    privacy: 'Public',
    bio: '', // bio giới thiệu sẽ chứa các link bạn bè
  });

  // Quản lý danh sách bạn bè (lưu link mạng xã hội)
  const [friends, setFriends] = useState([]);

  // Quản lý danh sách sự kiện (events)
  const [events, setEvents] = useState([]);

  // State form event mới
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [newFriendLink, setNewFriendLink] = useState(''); // input link bạn mới

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (avatarFile) {
        URL.revokeObjectURL(avatarFile);
      }
      const avatarURL = URL.createObjectURL(file);
      setUserInfo((prev) => ({ ...prev, avatar: avatarURL }));
      setAvatarFile(avatarURL);
    }
  };

  // Thêm bạn mới vào danh sách friends
  const handleAddFriend = () => {
    if (newFriendLink.trim() === '') return;
    setFriends((prev) => [...prev, newFriendLink.trim()]);

    // Cập nhật bio hiển thị các link bạn bè cách nhau dấu phẩy
    setUserInfo((prev) => ({
      ...prev,
      bio: [...friends, newFriendLink.trim()].join(', '),
    }));
    setNewFriendLink('');
  };

  // Hàm thay đổi dữ liệu form event mới
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm event mới vào danh sách events
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title.trim() === '' || newEvent.date.trim() === '') {
      alert('Please enter event title and date.');
      return;
    }
    setEvents((prev) => [...prev, newEvent]);
    setNewEvent({ title: '', date: '', time: '' });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Your information has been updated!');
    // Upload avatar to server here if needed
  };

  return (
    <div className="profile-container">
      <h2>Personal Profile</h2>
      <div className="profile-layout">
        {/* Left column: Personal info */}
        <div className="profile-card">
          <img src={userInfo.avatar} alt="Avatar" className="avatar" />

          {isEditing ? (
            <div className="form">
              <label>Name</label>
              <input type="text" name="name" value={userInfo.name} onChange={handleChange} />

              <label>Email</label>
              <input type="email" name="email" value={userInfo.email} onChange={handleChange} />

              <label>Birthday</label>
              <input type="date" name="birthday" value={userInfo.birthday} onChange={handleChange} />

              <label>Time Zone</label>
              <input type="text" name="timezone" value={userInfo.timezone} onChange={handleChange} />

              <label>Notification Settings</label>
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

              <label>Privacy Settings</label>
              <select name="privacy" value={userInfo.privacy} onChange={handleChange}>
                <option value="Public">Public</option>
                <option value="Friends">Friends</option>
                <option value="Private">Private</option>
              </select>

              <label>Avatar Image</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />

              <hr />

              {/* Phần thêm bạn bè */}
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

              <hr />

              {/* Phần thêm event mới */}
              <h3>Add New Event</h3>
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleEventChange}
                placeholder="Event title"
              />

              <label>Date</label>
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={handleEventChange}
              />

              <label>Time</label>
              <input
                type="time"
                name="time"
                value={newEvent.time}
                onChange={handleEventChange}
              />

              <button onClick={handleAddEvent} style={{ marginTop: '0.5rem' }}>
                Add Event
              </button>

              <div className="buttons" style={{ marginTop: '1rem' }}>
                <button className="save" onClick={handleSave}>Save</button>
                <button className="cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="info">
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Birthday:</strong> {userInfo.birthday}</p>
              <p><strong>Time Zone:</strong> {userInfo.timezone}</p>
              <p><strong>Notification Settings:</strong> {userInfo.notifications}</p>
              <p><strong>Linked Accounts:</strong> {userInfo.linkedAccounts}</p>
              <p><strong>Language:</strong> {userInfo.language}</p>
              <p><strong>Privacy Settings:</strong> {userInfo.privacy}</p>

              <p><strong>Bio (Friends Links):</strong> {userInfo.bio || 'No friends added yet.'}</p>

              <h3>Friends List</h3>
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

        {/* Right column: Schedules */}
        <div className="schedule-section">
          <h3>Schedule</h3>
          {events.length === 0 ? (
            <p>No events added yet.</p>
          ) : (
            <ul>
              {events.map((event, i) => (
                <li key={i}>
                  🕘 {event.time || 'All day'} - {event.date} - {event.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
