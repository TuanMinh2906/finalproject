import React, { useState, useEffect } from 'react';
import './style/Calendar.css';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

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
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const calendarId = localStorage.getItem('calendarId');
      const token = localStorage.getItem('token');

      if (!calendarId || !token) {
        console.warn('Missing calendarId or token');
        return;
      }

      try {
        const res = await fetch(`http://localhost:8003/api/calendar/${calendarId}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const mapped = data.map((note) => ({
          title: note.title,
          date: note.assignedDate,
          description: note.content,
          category: note.subject || 'General',
          location: note.location || '',
          attendees: note.attendees || '',
          reminder: note.reminder || 0,
          allDay: note.allDay || false,
          completed: note.completed || false,
        }));

        setEvents(mapped);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    fetchEvents();
  }, [setEvents]);

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
    setEditedEvent((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
    const title = (event.title || '').toLowerCase();
    const category = (event.category || '').toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || category === categoryFilter.toLowerCase();
    const notHiddenByCompleted = !hideCompleted || !event.completed;
    return matchesSearch && matchesCategory && notHiddenByCompleted;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = filteredEvents.filter(event => new Date(event.date).toISOString().split('T')[0] === todayStr);
  const otherEvents = filteredEvents.filter(event => new Date(event.date).toISOString().split('T')[0] !== todayStr);

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString();
  };

  const completedCount = events.filter((e) => e.completed).length;
  const notCompletedCount = events.filter((e) => !e.completed).length;

  const pieData = [
    { name: 'Completed', value: completedCount },
    { name: 'Not Completed', value: notCompletedCount },
  ];
  const pieColors = ['#4CAF50', '#F44336'];

  const renderEventRow = (event, index) => {
    if (editingIndex === index) {
      return (
        <div key={index} className="calendar-row editing-row">
          <input type="checkbox" name="completed" checked={editedEvent.completed} onChange={handleEditChange} className="edit-checkbox" />
          <input type="text" name="title" value={editedEvent.title} onChange={handleEditChange} className="edit-input title-input" />
          <input type="datetime-local" name="date" value={formatDateForInput(editedEvent.date)} onChange={handleEditChange} className="edit-input date-input" />
          <textarea name="description" value={editedEvent.description} onChange={handleEditChange} className="edit-textarea description-textarea" rows={1} />
          <input type="text" name="location" value={editedEvent.location} onChange={handleEditChange} className="edit-input location-input" />
          <input type="text" name="attendees" value={editedEvent.attendees} onChange={handleEditChange} className="edit-input participants-input" />
          <select name="category" value={editedEvent.category} onChange={handleEditChange} className="edit-input" style={{ width: '130px' }}>
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
      <div key={index} className="calendar-row">
        <div className="col status-col">
          <input type="checkbox" checked={event.completed || false} onChange={() => toggleCompleted(index)} />
        </div>
        <div className="col title-col event-title" title={event.title} onClick={() => setModalEvent(event)} style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>{event.title}</div>
        <div className="col date-col">{formatDisplayDate(event.date)}</div>
        <div className="col description-col">{event.description || '-'}</div>
        <div className="col location-col">{event.location || '-'}</div>
        <div className="col participants-col">{event.attendees || '-'}</div>
        <div className="col category-col">{event.category || '-'}</div>
        <div className="col actions-col">
          <button onClick={() => handleEditClick(index)} className="btn edit-btn">Edit</button>
          <button onClick={() => handleDelete(index)} className="btn delete-btn">Delete</button>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">Your Events</h2>

      <div className="calendar-stats">
        <span>✅ Completed: {completedCount}</span>
        <span>❌ Not Completed: {notCompletedCount}</span>
      </div>

      <div style={{ margin: '2rem auto', maxWidth: 400 }}>
        <h4 style={{ textAlign: 'center' }}>Event Completion Status</h4>
        <PieChart width={350} height={300}>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* FILTER BAR BẮT ĐẦU Ở ĐÂY */}
      <div className="filter-bar">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">📂 All categories</option>
          <option value="work">💼 Work</option>
          <option value="personal">🏡 Personal</option>
          <option value="meeting">📅 Meeting</option>
          <option value="birthday">🎉 Birthday</option>
        </select>

        <input
          type="text"
          placeholder="🔍 Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={() => setHideCompleted(!hideCompleted)} className="btn">
          {hideCompleted ? '👁 Show completed' : '🙈 Hide completed'}
        </button>
      </div>

      {(todayEvents.length > 0 || otherEvents.length > 0) ? (
        <>
          {todayEvents.length > 0 && (
            <>
              <h3 style={{ marginTop: '2rem', color: 'red' }}>🔴 Today's Events</h3>
              {todayEvents.map((event) => renderEventRow(event, events.indexOf(event)))}
            </>
          )}

          {otherEvents.length > 0 && (
            <>
              <h3 style={{ marginTop: '2rem', color: '#333' }}>📅 Other Events</h3>
              {otherEvents.map((event) => renderEventRow(event, events.indexOf(event)))}
            </>
          )}
        </>
      ) : (
        <p className="no-events">No events found.</p>
      )}

      {modalEvent && (
        <div className="modal-overlay" onClick={() => setModalEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalEvent.title}</h3>
            <p><strong>Date:</strong> {formatDisplayDate(modalEvent.date)}</p>
            <p><strong>Description:</strong></p>
            <p>{modalEvent.description || 'No description'}</p>
            <p><strong>Location:</strong> {modalEvent.location || 'No location'}</p>
            <p><strong>Attendees:</strong> {modalEvent.attendees || 'None'}</p>
            <p><strong>Category:</strong> {modalEvent.category || 'None'}</p>
            <button onClick={() => setModalEvent(null)} className="btn close-modal-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
