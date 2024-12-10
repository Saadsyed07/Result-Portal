// createStudent.js
const bcrypt = require('bcryptjs');
const pool = require('./database'); // Assumes database.js is set up to connect to PostgreSQL

const createStudent = async (rollNumber, password, name) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO students (roll_number, password, name) VALUES ($1, $2, $3)',
            [rollNumber, hashedPassword, name]
        );
        console.log('Student created successfully');
    } catch (err) {
        console.error('Error creating student:', err);
    } finally {
        pool.end();
    }
};

// Replace '12345', 'password123', 'John Doe' with the student's actual roll number, password, and name
createStudent('12345', 'password123', 'Syed Saad');
