import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import './style/Homepage.css';

function Homepage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
          id: note._id,
          title: note.title,
          date: note.assignedDate,
          description: note.content,
          category: note.subject || 'General',
          location: note.location || '',
          attendees: note.attendees || '',
          reminder: note.reminder || 0,
          allDay: note.allDay || false,
        }));

        setEvents(mapped);
      } catch (error) {
        console.error('Error loading events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventToDelete) => {
    const calendarId = localStorage.getItem('calendarId');
    const token = localStorage.getItem('token');

    if (!calendarId || !token || !eventToDelete.id) {
      console.warn('Missing calendarId, token, or event ID');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8003/api/calendar/${calendarId}/notes/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Xoá thất bại:', data.message || 'Không rõ lỗi');
        return;
      }

      const updatedEvents = events.filter((event) => event.id !== eventToDelete.id);
      setEvents(updatedEvents);
      setActiveIndex(null);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu xoá:', err);
    }
  };

  const handleEditEvent = (index) => {
    navigate('/add-event', {
      state: {
        eventToEdit: events[index],
        index: index,
      },
    });
  };

  const handleDuplicateEvent = (event) => {
    const startDate = new Date(event.date);
    const month = startDate.getMonth();
    const days = [];
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    const duplicatedEvents = days.map((day) => ({
      ...event,
      date: day.toISOString().split('T')[0],
    }));

    setEvents([...events, ...duplicatedEvents]);
    setActiveIndex(null);
  };

  const handleRepeatEvent = (event) => {
    const originalDate = new Date(event.date);
    const repeatedEvents = [];

    for (let i = 1; i <= 3; i++) {
      const newDate = new Date(originalDate);
      newDate.setDate(originalDate.getDate() + i * 7);
      repeatedEvents.push({
        ...event,
        date: newDate.toISOString().split('T')[0],
      });
    }

    setEvents([...events, ...repeatedEvents]);
    setActiveIndex(null);
  };

  const togglePopup = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const renderEventContent = (eventInfo) => (
    <div className="event-custom">
      <b>{eventInfo.event.title}</b>
    </div>
  );

  const handleEventDrop = (info) => {
    const updatedEvents = events.map((event) => {
      if (
        event.title === info.event.title &&
        new Date(event.date).toISOString().slice(0, 10) === info.oldEvent?.startStr
      ) {
        return { ...event, date: info.event.startStr };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const handleCalendarEventClick = (info) => {
    const clickedEvent = info.event;
    const foundEvent = events.find((ev) =>
      ev.title === clickedEvent.title &&
      new Date(ev.date).toISOString().slice(0, 10) === clickedEvent.startStr
    );
    setSelectedEvent(foundEvent || null);
  };

  const handleDuplicateFromModal = () => {
    if (!selectedEvent) return;

    const startDate = new Date(selectedEvent.date);
    const month = startDate.getMonth();

    const days = [];
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    const duplicatedEvents = days.map((day) => ({
      ...selectedEvent,
      date: day.toISOString().split('T')[0],
    }));

    setEvents([...events, ...duplicatedEvents]);
    setSelectedEvent(null);
  };

  return (
    <div className={`homepage ${isDarkMode ? 'dark-mode' : ''}`}>
      <main className="homepage-content">
        <aside className="sidebar">
          <h2>Your Events</h2>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="darkmode-button">
            {isDarkMode ? '☀ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
          </button>
          <button onClick={() => navigate('/add-event')} className="add-event-button">
            ➕ Add Event
          </button>
          {events.length > 0 ? (
            events.map((event, index) => (
              <div key={index} className="event-item" onClick={() => togglePopup(index)}>
                <h4>{event.title}</h4>
                <p>{new Date(event.date).toLocaleString()}</p>
                {activeIndex === index && (
                  <div className="event-popup">
                    <p><strong>Description:</strong> {event.description || 'No description'}</p>
                    <p><strong>Location:</strong> {event.location || 'No location'}</p>
                    <p><strong>Attendees:</strong> {event.attendees || 'None'}</p>
                    <p><strong>Reminder:</strong> {event.reminder} mins before</p>
                    <p><strong>All Day:</strong> {event.allDay ? 'Yes' : 'No'}</p>
                    <p><strong>Category:</strong> {event.category}</p>
                    <div className="event-popup-buttons">
                      <button onClick={() => handleEditEvent(index)} className="edit-button">✏ Edit</button>
                      <button onClick={() => handleDuplicateEvent(event)} className="duplicate-button">📄 Duplicate</button>
                      <button onClick={() => handleDeleteEvent(event)} className="delete-button">🗑 Delete</button>
                      <button onClick={() => handleRepeatEvent(event)} className="repeat-button">🔁 Repeat</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No events yet. Add some!</p>
          )}
        </aside>
        <section className="calendar-section">
          <h2>Calendar View</h2>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            editable={true}
            events={events}
            eventClick={handleCalendarEventClick}
            eventDrop={handleEventDrop}
            dateClick={(info) => {
              const title = prompt('Enter event title:');
              if (title) {
                const newEvent = {
                  title,
                  date: info.dateStr,
                  description: '',
                  category: 'General',
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
      {selectedEvent && (
        <div className="event-modal">
          <div className="modal-content">
            <h3>{selectedEvent.title}</h3>
            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleString()}</p>
            <p><strong>Description:</strong> {selectedEvent.description || 'No description'}</p>
            <p><strong>Location:</strong> {selectedEvent.location || 'N/A'}</p>
            <p><strong>Attendees:</strong> {selectedEvent.attendees || 'None'}</p>
            <p><strong>Reminder:</strong> {selectedEvent.reminder || 0} mins</p>
            <p><strong>All Day:</strong> {selectedEvent.allDay ? 'Yes' : 'No'}</p>
            <p><strong>Category:</strong> {selectedEvent.category || 'None'}</p>
            <div className="event-popup-buttons">
              <button onClick={handleDuplicateFromModal} className="duplicate-button">📄 Duplicate</button>
              <button onClick={() => handleDeleteEvent(selectedEvent)} className="delete-button">🗑 Delete</button>
              <button onClick={() => setSelectedEvent(null)} className="close-button">❌ Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
