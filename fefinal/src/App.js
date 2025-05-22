// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import Register from './Register';
import Homepage from './Homepage';
import Profile from './profile';
import AddEvent from './AddEvent';
import Navbar from './Navbar';
import Calendar from './Calendar';
import './style/App.css';

function LayoutWithNavbar({ children }) {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/register'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}

function AppRoutes({ events, setEvents, handleAddEvent }) {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Homepage events={events} setEvents={setEvents} />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/add-event" element={<AddEvent onSave={handleAddEvent} />} />
      <Route path="/calendar" element={<Calendar events={events} setEvents={setEvents} />} />
    </Routes>
  );
}

function App() {
  const [events, setEvents] = useState([]);

  // Hàm này xử lý thêm mới hoặc cập nhật event dựa vào index
  const handleAddEvent = (eventData, index) => {
    if (typeof index === 'number') {
      // Cập nhật event ở vị trí index
      const updatedEvents = [...events];
      updatedEvents[index] = eventData;
      setEvents(updatedEvents);
    } else {
      // Thêm mới event
      setEvents((prevEvents) => [...prevEvents, eventData]);
    }
  };

  return (
    <Router>
      <LayoutWithNavbar>
        <AppRoutes events={events} setEvents={setEvents} handleAddEvent={handleAddEvent} />
      </LayoutWithNavbar>
    </Router>
  );
}

export default App;
