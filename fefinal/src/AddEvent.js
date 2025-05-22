// src/AddEvent.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './style/AddEvent.css'; // Tách riêng CSS để dễ quản lý

function AddEvent({ onSave }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventToEdit, index } = location.state || {};
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    description: '',
    location: '',
    attendees: '',
    reminder: '10',
    allDay: false,
    category: 'Work',
  });

  useEffect(() => {
    if (eventToEdit) {
      setEventData(eventToEdit);
    }
  }, [eventToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(eventData, index);
    navigate('/home');
  };

  return (
    <div className="form-container">
      <h2>{eventToEdit ? '📝 Edit Event' : '➕ Add New Event'}</h2>
      <form className="event-form" onSubmit={handleSubmit}>
        <label>Title*</label>
        <input
          name="title"
          type="text"
          value={eventData.title}
          onChange={handleChange}
          required
        />

        <label>Date & Time*</label>
        <input
          name="date"
          type="datetime-local"
          value={eventData.date}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleChange}
          rows={3}
        />

        <label>Location</label>
        <input
          name="location"
          type="text"
          value={eventData.location}
          onChange={handleChange}
        />

        <label>Attendees (comma-separated)</label>
        <input
          name="attendees"
          type="text"
          placeholder="e.g. alice@example.com, bob@gmail.com"
          value={eventData.attendees}
          onChange={handleChange}
        />

        <label>Reminder (minutes before)</label>
        <select name="reminder" value={eventData.reminder} onChange={handleChange}>
          <option value="5">5 mins</option>
          <option value="10">10 mins</option>
          <option value="30">30 mins</option>
          <option value="60">1 hour</option>
        </select>

        <label>
          <input
            name="allDay"
            type="checkbox"
            checked={eventData.allDay}
            onChange={handleChange}
          />
          All-day event
        </label>

        <label>Category</label>
        <select name="category" value={eventData.category} onChange={handleChange}>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Birthday">Birthday</option>
        </select>

        <button type="submit">
          {eventToEdit ? '✅ Update Event' : '✅ Add Event'}
        </button>
      </form>
    </div>
  );
}

export default AddEvent;
