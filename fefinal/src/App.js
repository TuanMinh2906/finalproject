import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
      <Route path="/profile" element={<Profile events={events} />} />
      <Route path="/add-event" element={<AddEvent onSave={handleAddEvent} />} />
      <Route path="/calendar" element={<Calendar events={events} setEvents={setEvents} />} />
    </Routes>
  );
}

function App() {
  const [events, setEvents] = useState([]);

  const handleAddEvent = (eventData, index) => {
    if (typeof index === 'number') {
      const updatedEvents = [...events];
      updatedEvents[index] = eventData;
      setEvents(updatedEvents);
    } else {
      setEvents((prevEvents) => [...prevEvents, eventData]);
    }
  };

  return (
    <GoogleOAuthProvider clientId="913335909200-u33o9h0b9rl2aj8vqb97r3de3hk33h92.apps.googleusercontent.com">
      <Router>
        <LayoutWithNavbar>
          <AppRoutes events={events} setEvents={setEvents} handleAddEvent={handleAddEvent} />
        </LayoutWithNavbar>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
