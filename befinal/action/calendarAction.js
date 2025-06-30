const Calendar = require('../schema/calendarSchema');
const Note = require('../schema/noteSchema');
const { encrypt, decrypt } = require('../security/crypto'); // Import the encryption/decryption functions

const calendarGetNote = async (req, res) => {
    try {
        // Tìm note theo noteId và calendarId (đảm bảo đúng note trong calendar tương ứng)
        const note = await Note.findOne({
            _id: req.params.noteId,
            calendarId: req.params.calendarId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Giải mã dữ liệu
        const decryptedTitle = decrypt(note.title);
        const decryptedContent = decrypt(note.content);
        const decryptedSubject = decrypt(note.subject);

        res.status(200).json({
            title: decryptedTitle,
            content: decryptedContent,
            subject: decryptedSubject,
            assignedDate: note.assignedDate,
            assignedDay: note.assignedDay
        });
    } catch (err) {
        console.log('Error in calendarGetNote:', err);
        res.status(500).json({ error: 'Failed to retrieve note' });
    }
};

const calendarSaveNote = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        if (!userId) {
            return res.status(400).json({ error: 'Missing UserID' });
        }

        const calendarId = req.params.calendarId || req.body.calendarId;
        if (!calendarId) {
            return res.status(400).json({ error: 'Missing calendarId' })
        }

        // Encrypt các trường cần thiết
        const encryptedTitle = encrypt(req.body.title);
        const encryptedContent = encrypt(req.body.content);
        const encryptedSubject = encrypt(req.body.subject);

        // Tạo note mới trong collection Note
        const newNote = new Note({
            userId: userId,
            title: encryptedTitle,
            content: encryptedContent,
            subject: encryptedSubject,
            assignedDate: req.body.assignedDate,
            assignedDay: req.body.assignedDay,
            calendarId: req.params.calendarId // nếu muốn liên kết note với calendar
        });

        await newNote.save();

        // Nếu bạn muốn trả về dữ liệu đã giải mã hoặc id note
        res.status(201).json({
            message: 'Note saved to notes collection',
            noteId: newNote._id,
            title: req.body.title,  // trả về bản gốc chưa mã hóa
            assignedDate: req.body.assignedDate,
            calendarId: req.params.calendarId
        });
    } catch (err) {
        console.error('Error saving note:', err);
        res.status(500).json({ error: 'Failed to save note' });
    }
};

const calendarGetAllNotes = async (req, res) => {
    try {
        const calendarId = req.params.calendarId;

        //calendarId check exist
        const calendar = await Calendar.findById(calendarId);
if (!calendar) {
            return res.status(404).json({ message: "Calendar not found" })
        }

        const notes = await Note.find({ calendarId });
        // if there's no note among the calendar

        if (!notes || notes.length === 0) {
            return res.status(404).json({ message: "No notes were found in this calendar" })
        }

        // note content decryption
        const decryptedNotes = notes.map(note => ({
            _id: note._id,
            title: decrypt(note.title),
            content: decrypt(note.content),
            subject: decrypt(note.subject),
            assignedDate: note.assignedDate,
            assignedDay: note.assignedDay
        }));
        res.status(200).json(decryptedNotes);
    } catch (err) {
        console.error('Error in getting all notes in calendarAction.js: ', err);
        res.status(500).json({ error: "Server internal error" })
    }
}

const calendarDeleteNote = async (req, res) => {
    try {
        const { calendarId, noteId } = req.params;
        const userId = req.user?.id || req.user?._id; // đảm bảo userId được lấy đúng

        console.log('===> DELETE request:', { calendarId, noteId, userId });

        // check if note existed in calendar
        const note = await Note.findOne({ _id: noteId, calendarId });

        if (!note) {
            console.log('Note không tồn tại trong calendar');
            return res.status(404).json({ message: "Note not found in this calendar" });
        }

        // Nếu có kiểm tra quyền người dùng thì xử lý ở đây
        if (note.userId.toString() !== userId?.toString()) {
            console.log('Không có quyền xoá note');
            return res.status(403).json({ message: "Not authorized to delete this note" });
        }

        await Note.deleteOne({ _id: noteId });

        console.log('Đã xoá note thành công');
        res.status(200).json({ message: "Note deleted successfully" });

    } catch (err) {
        console.error("Error in deleting note:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const calendarGetByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        const calendar = await Calendar.findOne({ userId });
        if (!calendar) {
            return res.status(404).json({ message: 'Calendar not found for this user' });
        }

        res.status(200).json({ calendarId: calendar._id });
    } catch (err) {
        console.error('Error in calendarGetByUserId:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = {
    calendarGetNote,
    calendarSaveNote,
    calendarGetAllNotes,
    calendarDeleteNote,
    calendarGetByUserId  
};