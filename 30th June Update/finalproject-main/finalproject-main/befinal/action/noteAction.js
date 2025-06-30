const { title } = require('process');
const Note = require('../schema/noteSchema');   
const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-cbc'; 
const key = Buffer.from(process.env.CRYPTO_KEY, 'hex') //Load crypto key from .env variables
const iv = crypto.randomBytes(16); // Initialization vector for encryption

// Encryption function
function encrypt (text){
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex')
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // Store IV with encrypted data
}

// Decryption function
function decrypt(text){
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Save note encrypted file to database
const saveNote = async(req, res)=>{
    try{
        const encryptedTitle = encrypt(req.body.title);
        const encryptedContent = encrypt(req.body.content);
        const encryptedSubject = encrypt(req.body.subject);
        
        const newNote = new Note({
            title: encryptedTitle,
            content: encryptedContent,
            subject: encryptedSubject,
            assignedDate: req.body.assignedDate,
            userId: req.body.userId
        });

        await newNote.save();
        console.log(newNote);
        res.json({message: 'Note saved'});
    }catch(err){
        console.log('Error in Note save in noteAction: ', err);
        res.status(500).json({error: 'Failed to save note'});
    }
};

// Retrieve and decrypt note 
const getNote = async (req, res)=>{
    try{
        const note = await Note.findById(req.params.id);
        const decryptedTitle = decrypt(note.title);
        const decryptedSubject = decrypt(note.subject);
        const decryptedContent = decrypt(note.content);

        res.json({
            title: decryptedTitle,
            subject: decryptedSubject,
            content: decryptedContent,
            userId: note.userId
        });
    }catch(err){
        console.log('Error in getNote function in noteAction: ', err);
        res.status(500).json({error: 'Failed to retrieve note'})
    }
}

// Update note
const updateNote = async (req, res) => {
    try {
        const {id} = req.params;
        const {title, content, subject} = req.body;

        //Encrypt data after updating
        const encryptedTitle = encrypt(title);
        const encryptedContent = encrypt(content);
        const encryptedSubject = encrypt(subject);

        //Update in db
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            {   title: encryptedTitle, 
                content: encryptedContent, 
                subject: encryptedSubject,
                updatedAt: new Date()
            },
            {new: true}
        );
        res.json(updatedNote);
    } catch (err) {
        console.log('Error in updateNote function in noteAction: ', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
};

//Delete note
const deleteNote = async (req, res) =>{
    try{
        const {id} = req.params;
        await Note.findByIdAndDelete(id);
        res.json({message: 'Note deleted'});
    }catch(err){
        console.log('Error in deleting note in noteAction: ', err);
        res.status(500).json({error: 'Fail to delete'})
    }
}

module.exports = {
    saveNote, 
    getNote,    
    updateNote,
    deleteNote,

};