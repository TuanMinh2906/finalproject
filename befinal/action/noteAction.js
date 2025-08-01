const Note = require('../schema/noteSchema');
const { encrypt, decrypt } = require('../security/crypto');
const Calendar = require('../schema/calendarSchema')

// 🔹 Save new note
const saveNote = async (req, res) => {
    try {
        const { title, subject, contentBlocks, assignedDate, calendarId, participants } = req.body;
        const userId = req.user.id || req.user._id;

        const encryptedBlocks = contentBlocks.map(block => ({
            type: block.type,
            data: encrypt(JSON.stringify(block.data))
        }));

        // 1. Lưu note gốc vào calendar của người tạo
        const newNote = new Note({
            title: title ? encrypt(title) : '',
            subject: subject ? encrypt(subject) : '',
            contentBlocks: encryptedBlocks,
            assignedDate,
            userId,
            calendarId,
            participants: participants || []
        });

        await newNote.save();

        // 2. Tạo bản sao cho mỗi participant
        if (participants && Array.isArray(participants)) {
            for (const participantId of participants) {
                // Bỏ qua nếu participant chính là người tạo
                if (participantId.toString() === userId.toString()) continue;

                const participantCalendar = await Calendar.findOne({ userId: participantId });
                if (!participantCalendar) continue;

                const copiedNote = new Note({
                    title: newNote.title,
                    subject: newNote.subject,
                    contentBlocks: newNote.contentBlocks,
                    assignedDate,
                    userId: participantId,
                    calendarId: participantCalendar._id,
                    participants: [userId]  // Optional: chỉ lưu người mời
                });

                await copiedNote.save();
            }
        }

        res.status(201).json({ message: 'Note saved and shared successfully', noteId: newNote._id });
    } catch (err) {
        console.error('Error saving note:', err);
        res.status(500).json({ error: 'Failed to save note' });
    }
};


// 🔹 Get one note
const getNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).populate('participants', 'username email');
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        const isOwner = note.userId.toString() === userId.toString();
        const isParticipant = note.participants.map(p => p._id.toString()).includes(userId.toString());

        if (!isOwner && !isParticipant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const decryptedBlocks = note.contentBlocks.map(block => ({
            type: block.type,
            data: JSON.parse(decrypt(block.data))
        }));

        res.json({
            _id: note._id,
            title: decrypt(note.title),
            subject: decrypt(note.subject),
            assignedDate: note.assignedDate,
            isDone: note.isDone,
            calendarId: note.calendarId,
            participants: note.participants.map(p => ({
                _id: p._id,
                username: p.username,
                email: p.email
            })),
            contentBlocks: decryptedBlocks
        });
    } catch (err) {
        console.error('Error getting note:', err);
        res.status(500).json({ error: 'Failed to retrieve note' });
    }
};

// 🔹 Update note
const updateNote = async (req, res) => {
    try {
        const { title, subject, contentBlocks, assignedDate, participants } = req.body;
        const { id } = req.params;

        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (title !== undefined) note.title = title ? encrypt(title) : '';
        if (subject !== undefined) note.subject = subject ? encrypt(subject) : '';
        if (contentBlocks !== undefined) {
            note.contentBlocks = contentBlocks.map(block => ({
                type: block.type,
                data: encrypt(JSON.stringify(block.data))
            }));
        }
        if (assignedDate !== undefined) note.assignedDate = assignedDate;
        if (participants !== undefined) note.participants = participants;

        note.updatedAt = new Date();
        await note.save();

        res.json({ message: 'Note updated successfully' });
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
};

// 🔹 Delete note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await note.deleteOne();
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};

// 🔹 Get all notes of logged-in user
const getAllNotes = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const notes = await Note.find({
            $or: [
                { userId },
                { participants: userId }
            ]
        });

        const result = notes.map(note => ({
            _id: note._id,
            title: decrypt(note.title),
            subject: decrypt(note.subject),
            assignedDate: note.assignedDate,
            calendarId: note.calendarId,
            isDone: note.isDone
        }));

        res.json(result);
    } catch (err) {
        console.error('Error getting notes:', err);
        res.status(500).json({ error: 'Failed to retrieve notes' });
    }
};

// 🔹 Toggle isDone
const toggleIsDone = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });

        const userId = req.user.id || req.user._id;
        const isOwner = note.userId.toString() === userId.toString();
        const isParticipant = note.participants.map(p => p.toString()).includes(userId.toString());

        if (!isOwner && !isParticipant) {
            return res.status(403).json({ error: 'Access denied' });
        }

        note.isDone = !note.isDone;
        await note.save();

        res.json({ message: 'Note status updated', isDone: note.isDone });
    } catch (err) {
        console.error('Error toggling isDone:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// 🔹 Change note date
const changeNoteDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedDate } = req.body;

        if (!assignedDate) {
            return res.status(400).json({ error: 'Missing assignedDate' });
        }

        const note = await Note.findById(id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        const newDate = new Date(assignedDate);
        newDate.setUTCHours(0, 0, 0, 0);

        note.assignedDate = newDate;
        note.updatedAt = new Date();
        await note.save();

        res.status(200).json({
            message: 'Note date updated successfully',
            assignedDate: note.assignedDate
        });
    } catch (err) {
        console.error('Error updating note date:', err);
        res.status(500).json({ error: 'Failed to update note date' });
    }
};

// 🔹 Duplicate note to end of month
const duplicateNoteToEndOfMonth = async (req, res) => {
    try {
        const { id } = req.params;
        const { repeatInterval } = req.body;
        const userId = req.user.id || req.user._id;

        if (!repeatInterval || repeatInterval < 1 || repeatInterval > 7) {
            return res.status(400).json({ error: 'Invalid repeat interval (1-7 allowed)' });
        }

        const originalNote = await Note.findById(id);
        if (!originalNote) return res.status(404).json({ error: 'Original note not found' });

        if (originalNote.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const originalDate = new Date(originalNote.assignedDate);
        const endOfMonth = new Date(originalDate.getFullYear(), originalDate.getMonth() + 1, 0);

        let duplicatedCount = 0;
        let current = new Date(originalDate);
        current.setDate(current.getDate() + repeatInterval);

        while (current <= endOfMonth) {
            const duplicatedNote = new Note({
                title: originalNote.title,
                subject: originalNote.subject,
                contentBlocks: originalNote.contentBlocks,
                assignedDate: new Date(current),
                userId,
                calendarId: originalNote.calendarId,
                participants: originalNote.participants
            });

            await duplicatedNote.save();
            duplicatedCount++;
            current.setDate(current.getDate() + repeatInterval);
        }

        res.status(201).json({ message: `Duplicated ${duplicatedCount} notes to end of month.` });
    } catch (err) {
        console.error('Error duplicating note:', err);
        res.status(500).json({ error: 'Failed to duplicate note' });
    }
};



module.exports = {
    saveNote,
    getNote,
    updateNote,
    deleteNote,
    getAllNotes,
    toggleIsDone,
    changeNoteDate,
    duplicateNoteToEndOfMonth,
};