import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import './style/Homepage.css';

function Homepage({ events, setEvents }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // 👈 Thêm state cho Dark Mode

  const handleDeleteEvent = (eventToDelete) => {
    const updatedEvents = events.filter((event) => event !== eventToDelete);
    setEvents(updatedEvents);
    if (activeIndex !== null) setActiveIndex(null);
  };

  const handleEditEvent = (index) => {
    navigate('/add-event', {
      state: {
        eventToEdit: events[index],
        index: index,
      },
    });
  };

  const togglePopup = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div className="event-custom">
        <b>{eventInfo.event.title}</b>
      </div>
    );
  };

  return (
    <div className={`homepage ${isDarkMode ? 'dark-mode' : ''}`}>
      <main className="homepage-content" style={{ display: 'flex' }}>
        {/* Sidebar bên trái */}
        <aside
          className="sidebar"
          style={{
            width: '25%',
            padding: '1rem',
            borderRight: '1px solid #ccc',
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          <h2>Your Events</h2>

          {/* 🔘 Nút chuyển đổi Light/Dark mode đặt lên trên */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="toggle-mode-button"
            style={{ marginBottom: '1rem' }}
          >
            {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>

          {/* 🟢 Nút thêm sự kiện */}
          <button
            onClick={() => navigate('/add-event')}
            className="add-event-button"
            style={{ marginBottom: '1rem' }}
          >
            Add Event
          </button>

          {events.length > 0 ? (
            events.map((event, index) => (
              <div
                key={index}
                className="event-item"
                style={{ marginBottom: '1rem', position: 'relative' }}
              >
                <div
                  onClick={() => togglePopup(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4>{event.title}</h4>
                  <p style={{ fontSize: '0.85rem' }}>
                    {new Date(event.date).toLocaleString()}
                  </p>
                </div>

                {activeIndex === index && (
                  <div
                    className="event-popup"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      padding: '10px',
                      width: '90%',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      zIndex: 100,
                    }}
                  >
                    <p>
                      <strong>Description:</strong>{' '}
                      {event.description || 'No description'}
                    </p>
                    <p>
                      <strong>Location:</strong>{' '}
                      {event.location || 'No location'}
                    </p>
                    <p>
                      <strong>Attendees:</strong>{' '}
                      {event.attendees || 'None'}
                    </p>
                    <p>
                      <strong>Reminder:</strong> {event.reminder} mins before
                    </p>
                    <p>
                      <strong>All Day:</strong> {event.allDay ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <strong>Category:</strong> {event.category}
                    </p>
                    <button
                      onClick={() => handleEditEvent(index)}
                      className="edit-button"
                      style={{ marginRight: '0.5rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No events yet. Add some!</p>
          )}
        </aside>

        {/* Calendar bên phải */}
        <section
          className="calendar-section"
          style={{ width: '75%', padding: '1rem' }}
        >
          <h2>Calendar View</h2>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.map((e) => ({
              title: e.title,
              date: e.date,
            }))}
            dateClick={(info) => {
              const title = prompt('Enter event title:');
              if (title) {
                const newEvent = {
                  title,
                  date: info.dateStr,
                  description: '',
                };
                setEvents([...events, newEvent]);
              }
            }}
            displayEventTime={false}
            eventContent={renderEventContent}
            eventDisplay="block"
          />
        </section>
      </main>
    </div>
  );
}

export default Homepage;
