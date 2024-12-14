require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs')
const path = require("path");
const resultsData = require('./results.json'); // Load JSON data

const app = express();
const PORT = 3000;

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
}))
app.set("views", path.join(__dirname, "views")); // Adjust path if needed
app.set("view engine", "ejs");



// Set EJS as templating engine
app.set('view engine', 'ejs');

// Default hashed password for all students
const defaultPasswordHash = bcrypt.hashSync('12345', 10);

// Routes
app.get('/', (req, res) => res.render('index'));

// Student login page
app.get('/student-login', (req, res) => res.render('student_login'));

// Admin login page
app.get('/admin-login', (req, res) => res.render('admin_login'));

// Student login handling
app.post('/login/student', (req, res) => {
    const { prn, password } = req.body;

    console.log(`Received PRN: ${prn}, Password: ${password}`); // Debugging

    // Check if the PRN exists in results.json
    const studentData = resultsData.find(student => student.PRN === prn);

    if (!studentData) {
        console.log(`PRN ${prn} not found in JSON data`);
        return res.send('Invalid PRN or password');
    }

    // Verify PRN and password
    if (bcrypt.compareSync(password, defaultPasswordHash)) {
        console.log('Password match successful');

        // Set session and redirect to student dashboard
        req.session.studentId = prn;
        req.session.studentData = studentData; // Store student data in session
        res.redirect('/student/dashboard');
    } else {
        console.log('Password mismatch');
        res.send('Invalid PRN or password');
    }
});

// Student dashboard
app.get('/student/dashboard', (req, res) => {
    if (!req.session.studentId) {
        return res.redirect('/student-login');
    }

    const studentData = req.session.studentData;
    const studentResults = [];
    const labResults = [];

    // Regular subjects
    const subjects = [
        'BTCOC401 Design & Analysis of Algorithms',
        'BTCOC402 Operating Systems',
        'BTHM403 Basic Human Rights',
        'BTBSC404/BTBS404 Probability and Statistics',
        'BTES405 Digital Logic Design & Microprocessors'
    ];

    // Lab subjects
    const labSubjects = [
        'BTCOL406 Operating Systems & Python Programming Lab',
        'BTCOS407 Seminar-II'
    ];

    let emptyIndex = 1; // Start from 1 for `__EMPTY_<index>` after the first subject

    // Process regular subjects
   // Process regular subjects
subjects.forEach((subject, idx) => {
    const subjectCode = subject.split(' ')[0]; // Extract subject code (e.g., 'BTCOC401')
    const subjectName = subject.split(' ').slice(1).join(' '); // Extract the subject name (e.g., 'Design & Analysis of Algorithms')

    // Ensure that subjectCode is always valid or fallback to 'N/A' if not available
    const fullSubjectKey = `${subjectCode} ${subjectName}`;
    const validSubjectCode = subjectCode || 'N/A';
    const credits = studentData[fullSubjectKey] || 'N/A';  // Default to 'N/A' if not found

    if (idx === 0) {
        // First subject: handle CA marks from `__EMPTY` and others from `__EMPTY_<index>`
        studentResults.push({
            subjectCode: validSubjectCode,  // Use the fallback or valid code
            subjectName: subjectName,
            credits: credits,
            caMarks: studentData[`__EMPTY`] || 'N/A',
            midMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            eseMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            graceMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            totalMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            grade: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
        });
   
    } else {
        studentResults.push({
            subjectCode: validSubjectCode,  // Use the fallback or valid code
            subjectName: subjectName,
            credits: credits,
            caMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            midMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            eseMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            graceMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            totalMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            grade: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
        });
    }
});


    // Reset the index for lab subjects
    emptyIndex = 30; // Adjust this based on the position of lab subjects in the data

    // Process lab subjects
    labSubjects.forEach(subject => {
        const subjectCode = subject.split(' ')[0];
        const subjectName = subject.split(' ').slice(1).join(' '); // Remove the code
        const fullSubjectKey = `${subjectCode} ${subjectName}`;
    
    const credits = studentData[fullSubjectKey] || 'N/A';  // Default to 'N/A' if not found


        labResults.push({
            subjectCode: subjectCode,
            subjectName: subjectName,
            credits: credits,
            caMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            midMarks: 'N/A', // Lab subjects don't have midMarks
            eseMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            graceMarks: 'N/A', // Lab subjects don't have grace marks
            totalMarks: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
            grade: studentData[`__EMPTY_${emptyIndex++}`] || 'N/A',
        });
    });

    // Render the dashboard with the processed data
    res.render('student_dashboard', {
        name: studentData["Student Name"] || 'N/A',
        prn: studentData.PRN || 'N/A',
        results: studentResults,
        labResults: labResults,
        sgpa: studentData.SGPA || 'N/A',
        credits: studentData["Total Credits"] || 'N/A',
        cumulativeCredits: 37, // Replace with actual cumulative data if available
        cumulativeGradePoints: 126, // Replace with actual cumulative data if available
        cgpa: studentData.SGPA || 'N/A', // Adjust if CGPA exists in a different key
    });
});


// route for student page
app.get('/student', (req, res) => {
    // Check if the student is logged in
    if (!req.session.studentId) {
        return res.redirect('/student-login');
    }

    // Get the student data from the session
    const studentData = req.session.studentData;

    // Use student data from session to populate the view
    const studentInfo = {
        name: studentData["Student Name"] || 'N/A',
        prn: studentData.PRN || 'N/A',
        programme: 'Bachelor of Technology (Computer Science and Engineering)',
        semester: 'IV',
    };

    // Render the 'student' view, passing the student info
    res.render('student', { student: studentInfo });
});







// Admin dashboard (dummy route for now)
app.get('/admin/dashboard', (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin-login');
    }

    // Retrieve all results for admin view (could be further customized)
    res.render('admin_dashboard', { results: resultsData });
});

app.post('/contact/submit', (req, res) => {
    const { name, mobile, message } = req.body;
  
    // Validate if required fields are provided
    if (!name || !mobile || !message) {
      return res.status(400).send('<p>All fields are required!</p><a href="/">Go back</a>');
    }
  
    // Define the file path where form data will be saved
    const filePath = path.join(__dirname, 'contact_data.txt');
  
    // Prepare the data to be saved (you can format it as desired)
    const formData = `Name: ${name}\nMobile: ${mobile}\nMessage: ${message}\n\n`;
  
    // Append the form data to the file
    fs.appendFile(filePath, formData, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('<p>Failed to save contact data. Please try again later.</p><a href="/">Go back</a>');
      }
  
      // Respond with success message
      res.send(`
        <div style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
          <h2>Thank you for contacting us!</h2>
          <p>Your message has been received. We will contact you shortly.</p>
          <a href="/" style="padding: 10px 20px; background-color: #5025D1; color: white; text-decoration: none; border-radius: 5px;">Go back</a>
        </div>
      `);
    });
  });

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
