import React, { useState } from 'react';
import './style/Calendar.css';

const Calendar = ({ events, setEvents }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedEvent, setEditedEvent] = useState({
    title: '',
    date: '',
    description: '',
    location: '',
    attendees: '',
    completed: false,
    category: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalEvent, setModalEvent] = useState(null);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const isoStr = date.toISOString();
    return isoStr.substring(0, 16);
  };

  const handleDelete = (index) => {
    const newEvents = [...events];
    newEvents.splice(index, 1);
    setEvents(newEvents);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditedEvent({ ...events[index] });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setEditedEvent((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditedEvent((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEdit = () => {
    if (!editedEvent.title.trim()) {
      alert('Title cannot be empty');
      return;
    }
    if (!editedEvent.date || isNaN(new Date(editedEvent.date).getTime())) {
      alert('Please enter a valid date');
      return;
    }
    const newEvents = [...events];
    newEvents[editingIndex] = editedEvent;
    setEvents(newEvents);
    setEditingIndex(null);
  };

  const toggleCompleted = (index) => {
    const newEvents = [...events];
    newEvents[index].completed = !newEvents[index].completed;
    setEvents(newEvents);
  };

  // *** Filter với chuẩn hóa chữ thường để filter category hoạt động chuẩn ***
  const filteredEvents = events.filter((event) => {
    const title = (event.title || event.eventName || '').toLowerCase();
    const category = (event.category || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString();
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Your Events</h2>

      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        style={{
          marginBottom: '12px',
          padding: '8px 12px',
          fontSize: '1rem',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '200px',
        }}
      >
        <option value="all">All categories</option>
        <option value="work">Work</option>
        <option value="personal">Personal</option>
        <option value="meeting">Meeting</option>
        <option value="birthday">Birthday</option>
      </select>

      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {filteredEvents.length === 0 ? (
        <p className="no-events">No events found.</p>
      ) : (
        <div>
          <div className="calendar-header">
            <div className="col status-col">Done</div>
            <div className="col title-col">Title</div>
            <div className="col date-col">Date</div>
            <div className="col description-col">Description</div>
            <div className="col location-col">Location</div>
            <div className="col participants-col">Attendees</div>
            <div className="col category-col">Category</div>
            <div className="col actions-col">Actions</div>
          </div>

          {filteredEvents.map((event, index) => {
            const originalIndex = events.indexOf(event);

            if (editingIndex === originalIndex) {
              return (
                <div key={originalIndex} className="calendar-row editing-row">
                  <input
                    type="checkbox"
                    name="completed"
                    checked={editedEvent.completed}
                    onChange={handleEditChange}
                    className="edit-checkbox"
                    title="Mark as completed"
                  />
                  <input
                    type="text"
                    name="title"
                    value={editedEvent.title}
                    onChange={handleEditChange}
                    placeholder="Title"
                    className="edit-input title-input"
                    autoFocus
                  />
                  <input
                    type="datetime-local"
                    name="date"
                    value={formatDateForInput(editedEvent.date)}
                    onChange={handleEditChange}
                    className="edit-input date-input"
                  />
                  <textarea
                    name="description"
                    value={editedEvent.description}
                    onChange={handleEditChange}
                    placeholder="Description"
                    rows={1}
                    className="edit-textarea description-textarea"
                  />
                  <input
                    type="text"
                    name="location"
                    value={editedEvent.location}
                    onChange={handleEditChange}
                    placeholder="Location"
                    className="edit-input location-input"
                  />
                  <input
                    type="text"
                    name="attendees"
                    value={editedEvent.attendees}
                    onChange={handleEditChange}
                    placeholder="Emails (comma separated)"
                    className="edit-input participants-input"
                  />
                  <select
                    name="category"
                    value={editedEvent.category}
                    onChange={handleEditChange}
                    className="edit-input"
                    style={{ width: '130px' }}
                  >
                    <option value="">Select category</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="meeting">Meeting</option>
                    <option value="birthday">Birthday</option>
                  </select>

                  <div className="actions-col actions-buttons">
                    <button onClick={handleSaveEdit} className="btn save-btn">Save</button>
                    <button onClick={() => setEditingIndex(null)} className="btn cancel-btn">Cancel</button>
                  </div>
                </div>
              );
            }

            return (
              <div key={originalIndex} className="calendar-row">
                <div className="col status-col">
                  <input
                    type="checkbox"
                    checked={event.completed || false}
                    onChange={() => toggleCompleted(originalIndex)}
                    title="Mark as completed"
                  />
                </div>
                <div
                  className="col title-col event-title"
                  title={event.title || event.eventName}
                  onClick={() => setModalEvent(event)}
                  style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
                >
                  {event.title || event.eventName}
                </div>
                <div className="col date-col">{formatDisplayDate(event.date || event.eventDate)}</div>
                <div className="col description-col" title={event.description}>
                  {event.description || '-'}
                </div>
                <div className="col location-col" title={event.location || '-'}>{event.location || '-'}</div>
                <div className="col participants-col" title={event.attendees || '-'}>{event.attendees || '-'}</div>
                <div className="col category-col" title={event.category || '-'}>{event.category || '-'}</div>
                <div className="col actions-col">
                  <button onClick={() => handleEditClick(originalIndex)} className="btn edit-btn">Edit</button>
                  <button onClick={() => handleDelete(originalIndex)} className="btn delete-btn">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalEvent && (
        <div className="modal-overlay" onClick={() => setModalEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalEvent.title || modalEvent.eventName}</h3>
            <p><strong>Date:</strong> {formatDisplayDate(modalEvent.date || modalEvent.eventDate)}</p>
            <p><strong>Description:</strong></p>
            <p>{modalEvent.description || modalEvent.eventDescription || 'No description'}</p>
            <p><strong>Location:</strong> {modalEvent.location || 'N/A'}</p>
            <p><strong>Attendees (emails):</strong></p>
            <ul>
              {(modalEvent.attendees || '')
                .split(',')
                .map((email, i) => (
                  <li key={i}>{email.trim()}</li>
                ))}
            </ul>
            <p><strong>Category:</strong> {modalEvent.category || 'N/A'}</p>
            <button onClick={() => setModalEvent(null)} className="btn close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
