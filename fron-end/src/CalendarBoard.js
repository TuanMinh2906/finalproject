import React, { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Paper, IconButton, Menu, MenuItem,
  Fade, Grow
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import AddEventForm from './EventForm';
import Sidebar from './Sidebar';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

function CalendarBoard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [open, setOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const calendarId = localStorage.getItem('calendarId');
  const token = localStorage.getItem('token');

  const isMenuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:8003/api/calendar/${calendarId}/notes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mappedEvents = res.data.map((note) => ({
        id: note._id,
        title: note.title,
        date: new Date(note.assignedDate).toLocaleDateString('en-CA'),
        description: note.content || '',
        location: note.location || '',
        participants: note.participants || [],
        reminder: note.reminder || 10,
        allDay: note.allDay !== undefined ? note.allDay : true,
        category: note.subject || 'General',
        contentBlocks: note.contentBlocks || []
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  }, [calendarId, token]);

  useEffect(() => {
    if (calendarId && token) fetchNotes();
  }, [calendarId, token, fetchNotes]);

  const handleDateClick = (arg) => {
    setSelectedDate(new Date(arg.dateStr));
    setAddEventOpen(true);
    setEditMode(false);
    setEventToEdit(null);
  };

  const handleAddEventClose = () => {
    setAddEventOpen(false);
    setSelectedDate(null);
    setEventToEdit(null);
    setEditMode(false);
  };

  const handleAddEventSuccess = () => {
    fetchNotes();
    handleAddEventClose();
  };

  const handleEventClick = async (info) => {
    const noteId = info.event.id;
    try {
      const res = await axios.get(
        `http://localhost:8003/api/calendar/${calendarId}/notes/${noteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const note = res.data;
      setSelectedEvent({
        id: note._id,
        title: note.title,
        description: note.contentBlocks?.map((block) =>
          block?.data?.text || ''
        ).join('\n') || 'No description',
        date: new Date(note.assignedDate).toISOString().split('T')[0],
        location: note.location || '',
        participants: note.participants || [],
        reminder: note.reminder || 10,
        allDay: note.allDay !== undefined ? note.allDay : true,
        subject: note.subject || 'None',
        contentBlocks: note.contentBlocks || []
      });
      setOpen(true);
    } catch (err) {
      console.error('Failed to load event details:', err);
    }
  };


  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedEvent) {
      setEditMode(true);
      setEventToEdit(selectedEvent);
      setAddEventOpen(true);
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await axios.delete(
        `http://localhost:8003/api/notes/${selectedEvent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
      handleClose();
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleDuplicateWeek = async () => {
    if (!selectedEvent) return;
    const baseDate = new Date(selectedEvent.date);
    const dayOfWeek = baseDate.getDay();
    for (let i = dayOfWeek + 1; i <= 6; i++) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + (i - dayOfWeek));
      const isoDate = new Date(Date.UTC(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      )).toISOString();
      try {
        await axios.post(`http://localhost:8003/api/notes`, {
          title: selectedEvent.title,
          assignedDate: isoDate,
          contentBlocks: selectedEvent.contentBlocks,
          location: selectedEvent.location,
          participants: selectedEvent.participants,
          subject: selectedEvent.subject,
          reminder: selectedEvent.reminder,
          allDay: selectedEvent.allDay,
          calendarId: calendarId
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error('Error duplicating event:', err);
      }
    }
    fetchNotes();
    handleClose();
  };

  const handleEventDrop = async (info) => {
    const { id } = info.event;
    const newDate = info.event.start;
    const utcDateString = new Date(
      Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate())
    ).toISOString();
    try {
      await axios.patch(
        `http://localhost:8003/api/notes/${id}/changeDate`,
        { assignedDate: utcDateString },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents((prev) =>
        prev.map((event) =>
          event.id === id ? { ...event, date: utcDateString.split('T')[0] } : event
        )
      );
    } catch (err) {
      console.error('Error updating event date:', err);
      info.revert();
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, padding: 3, minHeight: '100vh', backgroundColor: '#f9f9f9', marginLeft: '60px' }}>
        <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
          Planova
        </Typography>

        <Fade in={true} timeout={600}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              editable={true}
              eventDrop={handleEventDrop}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              displayEventTime={false}
              headerToolbar={{ start: '', center: 'title', end: 'prev today next' }}
              buttonText={{ today: 'Today' }}
              eventContent={(arg) => (
                <Box
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: 13,
                    fontWeight: 500,
                    backgroundColor: 'primary.light',
                    color: 'primary.dark',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 3,
                      backgroundColor: 'primary.main',
                      color: 'white',
                    }
                  }}
                >
                  {arg.event.title}
                </Box>
              )}
            />
          </Paper>
        </Fade>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth TransitionComponent={Transition}>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {selectedEvent?.title || 'Event Details'}
            <Box>
              <IconButton onClick={handleMenuOpen}><MoreVertIcon /></IconButton>
              <IconButton onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
              <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
                <MenuItem onClick={() => { handleEdit(); handleMenuClose(); }}>Edit</MenuItem>
                <MenuItem onClick={() => { handleDelete(); handleMenuClose(); }}>Delete</MenuItem>
                <MenuItem onClick={() => { handleDuplicateWeek(); handleMenuClose(); }}>Duplicate to Week</MenuItem>
              </Menu>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom><strong>Date:</strong> {new Date(selectedEvent?.date).toLocaleDateString()}</Typography>
            <Typography gutterBottom><strong>Subject:</strong> {selectedEvent?.subject || 'None'}</Typography>
            <Typography gutterBottom sx={{ mt: 2 }}><strong>Location:</strong> {selectedEvent?.location || 'N/A'}</Typography>

            <Typography gutterBottom>
              <strong>Participants:</strong>{' '}
              {Array.isArray(selectedEvent?.participants) && selectedEvent.participants.length > 0
                ? selectedEvent.participants.map((p, i) => (
                  <span key={i}>{p.username || p.email || p._id}{i < selectedEvent.participants.length - 1 ? ', ' : ''}</span>
                ))
                : 'None'}
            </Typography>

            <Typography gutterBottom><strong>Reminder:</strong> {selectedEvent?.reminder} mins</Typography>
            <Typography gutterBottom><strong>All Day:</strong> {selectedEvent?.allDay ? 'Yes' : 'No'}</Typography>
            <Typography gutterBottom sx={{ mt: 2 }}><strong>Tasks:</strong></Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {selectedEvent?.description?.split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                <Paper
                  key={idx}
                  elevation={2}
                  sx={{
                    p: 1.5,
                    pl: 2,
                    backgroundColor: 'grey.100',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    fontSize: 14
                  }}
                >
                  {line}
                </Paper>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={addEventOpen} onClose={handleAddEventClose} maxWidth="sm" fullWidth TransitionComponent={Transition}>
          <DialogTitle>{editMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          <DialogContent dividers>
            <AddEventForm
              selectedDate={selectedDate}
              calendarId={calendarId}
              onClose={handleAddEventClose}
              onAddSuccess={handleAddEventSuccess}
              initialData={eventToEdit}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default CalendarBoard;