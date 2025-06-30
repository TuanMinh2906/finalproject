const mongoose = require('mongoose');
const User = require('../../schema/userSchema');
const bcrypt = require('bcrypt');
const Calendar = require('../../schema/calendarSchema');
const noteSchema = require('../../schema/noteSchema');

// Functionalities
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users (getAllUsers) in userAction.js: ', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
}

//Create user function 
const createUser = async (req, res) => {
    try {
        const { userName, password, email, profilePicture, devices } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' }); // 409 Conflict
        }
        const passwordHash = await bcrypt.hash(password, 10); // remember to hash later
        const newUser = new User({
            userName,
            passwordHash,
            email,
            profilePicture: profilePicture || null,
            devices: devices || []
        });
        await newUser.save(); // create new User

        // create a calendar then attach with registering user
        const newCalendar = new Calendar({
            title: `${userName}'s Calendar`,
            description: `Default calendar for ${userName}`,
            userId: newUser._id
        })
        await newCalendar.save();

        newUser.calendarId = newCalendar._id;
        await newUser.save();
        res.status(200).json({ message: 'User created successfully' });

    } catch (err) {
        console.error('Error creating user in userAction file: ', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


//Get user by id
const getUserbyID = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        res.status(200).json(user)
    } catch (err) {
        console.log("Error retrieving user by ID in userAction: ", err.message)
        res.status(500).json({ message: "Error get user by ID" });
    }
}

//Update user profile
const userUpdate = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // return updated document
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Invalid ID to update' })
        }
        res.status(200).json(updatedUser)
    } catch (err) {
        console.log('Error in update user in userAction: ', err.message)
        res.status(500).json({ message: 'Error update user :(' })
    }
}

const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const deletedCalendar = await Calendar.findOneAndDelete({ userId: deletedUser._id });

        // Delete note and others
        if (deletedCalendar) {
            await noteSchema.deleteMany({ calendarId: deletedCalendar._id });
        }

        res.status(200).json({ message: "User and related data deleted successfully" });
    } catch (err) {
        console.log("Error deleting user:", err);
        res.status(500).json({ message: "An error occurred while deleting the user" });
    }
};


module.exports = {
    getAllUsers,
    createUser,
    getUserbyID,
    userUpdate,
    deleteUser,
};