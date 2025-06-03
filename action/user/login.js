const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../schema/userSchema');

const secret = process.env.JWT_SECRET || 'your-secret-key';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra xem có user không
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // So sánh password nhập vào và passwordHash trong DB
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash); 
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Tạo JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, userName: user.userName },
            secret,
            { expiresIn: '3h' }
        );

        res.json({
            message: 'Login successful',
            token: token,
        });
    } catch (err) {
        console.error('login.js error 500: ', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = login;
