import React, { useState } from 'react';

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
    setEditedEvent((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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

  const filteredEvents = events.filter((event) => {
    const title = (event.title || event.eventName || '').toLowerCase();
    const category = (event.category || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString();
  };

  return (
    <div>
      <h2>Your Events</h2>

      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
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
      />

      {filteredEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div>
          <div>
            <div>Done</div>
            <div>Title</div>
            <div>Date</div>
            <div>Description</div>
            <div>Location</div>
            <div>Attendees</div>
            <div>Category</div>
            <div>Actions</div>
          </div>

          {filteredEvents.map((event, index) => {
            const originalIndex = events.indexOf(event);

            if (editingIndex === originalIndex) {
              return (
                <div key={originalIndex}>
                  <input
                    type="checkbox"
                    name="completed"
                    checked={editedEvent.completed}
                    onChange={handleEditChange}
                  />
                  <input
                    type="text"
                    name="title"
                    value={editedEvent.title}
                    onChange={handleEditChange}
                    placeholder="Title"
                  />
                  <input
                    type="datetime-local"
                    name="date"
                    value={formatDateForInput(editedEvent.date)}
                    onChange={handleEditChange}
                  />
                  <textarea
                    name="description"
                    value={editedEvent.description}
                    onChange={handleEditChange}
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    name="location"
                    value={editedEvent.location}
                    onChange={handleEditChange}
                    placeholder="Location"
                  />
                  <input
                    type="text"
                    name="attendees"
                    value={editedEvent.attendees}
                    onChange={handleEditChange}
                    placeholder="Emails (comma separated)"
                  />
                  <select
                    name="category"
                    value={editedEvent.category}
                    onChange={handleEditChange}
                  >
                    <option value="">Select category</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="meeting">Meeting</option>
                    <option value="birthday">Birthday</option>
                  </select>
                  <button onClick={handleSaveEdit}>Save</button>
                  <button onClick={() => setEditingIndex(null)}>Cancel</button>
                </div>
              );
            }

            return (
              <div key={originalIndex}>
                <input
                  type="checkbox"
                  checked={event.completed || false}
                  onChange={() => toggleCompleted(originalIndex)}
                />
                <span onClick={() => setModalEvent(event)}>
                  {event.title || event.eventName}
                </span>
                <span>{formatDisplayDate(event.date || event.eventDate)}</span>
                <span>{event.description || '-'}</span>
                <span>{event.location || '-'}</span>
                <span>{event.attendees || '-'}</span>
                <span>{event.category || '-'}</span>
                <button onClick={() => handleEditClick(originalIndex)}>Edit</button>
                <button onClick={() => handleDelete(originalIndex)}>Delete</button>
              </div>
            );
          })}
        </div>
      )}

      {modalEvent && (
        <div onClick={() => setModalEvent(null)}>
          <div onClick={(e) => e.stopPropagation()}>
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
            <button onClick={() => setModalEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
