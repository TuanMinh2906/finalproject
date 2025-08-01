// 📄 Chart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Button, TextField, Select, MenuItem,
  Checkbox, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider,
  CircularProgress, useMediaQuery, useTheme
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EventNote, Category, BarChart } from '@mui/icons-material';

const Chart = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');
        const calendarId = localStorage.getItem('calendarId');
        if (!token || !calendarId) return;

        const res = await axios.get(`http://localhost:8003/api/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data);
      } catch (err) {
        console.error('Error loading notes:', err);
      }
    };
    fetchNotes();
  }, []);

  const handleToggleCheckbox = async (idx) => {
    const note = events[idx];
    if (!note) return;
    setLoading(true);
    try {
      await axios.patch(`http://localhost:8003/api/notes/${note._id}/toggle`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const res2 = await axios.get(`http://localhost:8003/api/notes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(res2.data);

      if (!note.isDone) {
        const newIndex = res2.data.findIndex(n => n._id === note._id);
        setSelectedEventIndex(newIndex);
        setConfirmDialogOpen(true);
      }
    } catch (err) {
      console.error('Failed to toggle done:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (selectedEventIndex == null) return;
    const note = events[selectedEventIndex];
    try {
      await axios.delete(`http://localhost:8003/api/notes/${note._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const filtered = events.filter((_, i) => i !== selectedEventIndex);
      setEvents(filtered);
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
    setConfirmDialogOpen(false);
    setSelectedEventIndex(null);
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setSelectedEventIndex(null);
  };

  const handleViewEvent = async (eventId) => {
    try {
      const res = await axios.get(`http://localhost:8003/api/notes/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const note = res.data;
      setModalEvent({
        _id: note._id,
        title: note.title,
        assignedDate: note.assignedDate,
        location: note.location || '',
        participants: note.participants || [],
        reminder: note.reminder || 10,
        allDay: note.allDay !== undefined ? note.allDay : true,
        subject: note.subject || 'General',
        contentBlocks: note.contentBlocks || []
      });
    } catch (err) {
      console.error('Failed to load event details:', err);
    }
  };

  const filteredEvents = events.filter(e => {
    if (!e.title || !e.assignedDate) return false;
    if (searchTerm && !e.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter !== 'all' && e.subject?.toLowerCase() !== categoryFilter) return false;
    if (hideCompleted && e.isDone) return false;
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEvents = filteredEvents.filter(e => new Date(e.assignedDate).toISOString().split('T')[0] === todayStr);
  const otherEvents = filteredEvents.filter(e => new Date(e.assignedDate).toISOString().split('T')[0] !== todayStr);

  const completedCount = events.filter(e => e.isDone).length;
  const notCompletedCount = events.filter(e => !e.isDone).length;
  const pieData = [
    { name: 'Completed', value: completedCount },
    { name: 'Not Completed', value: notCompletedCount }
  ];
  const pieColors = ['#1976d2', '#e53935'];

  const formatDate = (d) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? 'Invalid' : dt.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderEventRow = (event, idx) => (
    <Paper key={event._id} sx={{
      p: 2, mb: 2,
      backgroundColor: event.isDone ? '#e3f2fd' : '#fff',
      borderLeft: `5px solid ${event.isDone ? '#1976d2' : '#e53935'}`,
      borderRadius: 2,
      boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)', backgroundColor: '#f4f6f8' }
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={1}>
          <Checkbox checked={event.isDone} onChange={() => handleToggleCheckbox(idx)} />
        </Grid>
        <Grid item xs={10} sm={3}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventNote fontSize="small" /> {event.title}
            {event.isDone && <Typography variant="caption" color="primary">✅ Done</Typography>}
          </Typography>
          <Typography variant="body2" color="text.secondary">{formatDate(event.assignedDate)}</Typography>
          <Typography variant="body2" color="text.disabled">
            {event.isDone ? 'This task is completed' : 'Pending'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Typography variant="body2"><Category fontSize="small" /> {event.subject}</Typography>
          {event.contentBlocks?.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              📝 {typeof event.contentBlocks[0]?.data === 'object'
                ? event.contentBlocks[0]?.data?.text?.slice(0, 100)
                : String(event.contentBlocks[0]?.data).slice(0, 100)}...
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={3} display="flex" justifyContent={isMobile ? 'flex-start' : 'flex-end'}>
          <Button variant="outlined" size="small" onClick={() => handleViewEvent(event._id)}>View</Button>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ pl: '80px', pr: 2, pt: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{
        textAlign: 'center', mb: 3, color: '#1976d2', fontWeight: 700,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1
      }}>
        <BarChart /> Chart View
      </Typography>

      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={4}>
          <Select fullWidth value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <MenuItem value="all">📂 All types</MenuItem>
            <MenuItem value="work">💼 Work</MenuItem>
            <MenuItem value="personal">🏡 Personal</MenuItem>
            <MenuItem value="meeting">🗓️ Meeting</MenuItem>
            <MenuItem value="birthday">🎉 Birthday</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth placeholder="🔍 Search by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
          <Button variant="contained" color="primary" fullWidth onClick={() => setHideCompleted(!hideCompleted)}>
            {hideCompleted ? '👁 Show Completed' : '🙈 Hide Completed'}
          </Button>
          {hideCompleted && <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>{completedCount} completed events hidden</Typography>}
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" gutterBottom>📈 Completion Ratio</Typography>
        <PieChart width={350} height={300}>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label isAnimationActive>
            {pieData.map((entry, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Box>

      {loading && <Box textAlign="center"><CircularProgress /></Box>}

      <Divider textAlign="left" sx={{ mb: 2 }}>🔴 Today's Events</Divider>
      {todayEvents.map((e) => renderEventRow(e, events.findIndex(n => n._id === e._id)))}

      <Divider textAlign="left" sx={{ mt: 4, mb: 2 }}>📅 Other Events</Divider>
      {otherEvents.map((e) => renderEventRow(e, events.findIndex(n => n._id === e._id)))}

      {/* View Modal */}
      <Dialog open={!!modalEvent} onClose={() => setModalEvent(null)} fullWidth maxWidth="sm">
        <DialogTitle>{modalEvent?.title}</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom><strong>Date:</strong> {formatDate(modalEvent?.assignedDate)}</Typography>
          <Typography gutterBottom><strong>Subject:</strong> {modalEvent?.subject || 'None'}</Typography>
          <Typography gutterBottom sx={{ mt: 2 }}><strong>Location:</strong> {modalEvent?.location || 'N/A'}</Typography>

          <Typography gutterBottom>
            <strong>Participants:</strong>{' '}
            {Array.isArray(modalEvent?.participants) && modalEvent.participants.length > 0
              ? modalEvent.participants.map((p, i) => (
                <span key={i}>{p.username || p.email || p._id}{i < modalEvent.participants.length - 1 ? ', ' : ''}</span>
              ))
              : 'None'}
          </Typography>

          <Typography gutterBottom><strong>Reminder:</strong> {modalEvent?.reminder || 10} mins</Typography>
          <Typography gutterBottom><strong>All Day:</strong> {modalEvent?.allDay ? 'Yes' : 'No'}</Typography>

          <Typography gutterBottom sx={{ mt: 2 }}><strong>Tasks:</strong></Typography>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {modalEvent?.contentBlocks?.length > 0 ? (
              modalEvent.contentBlocks.map((block, index) => (
                <Paper
                  key={index}
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
                  <Typography sx={{ whiteSpace: 'pre-line' }}>
                    {typeof block.data === 'object' ? block.data?.text : String(block.data)}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">No tasks available.</Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalEvent(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>🎉 Completed</DialogTitle>
        <DialogContent>
          <Typography>Delete this completed task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Keep</Button>
          <Button onClick={handleDeleteConfirmed} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chart;
