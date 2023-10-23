const router = require("express").Router();
// const {AdminAuthorization, Student, Tutor} = require('../models/Admin')
const shortid = require('shortid');
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { db, sch, stf } = require('../config/db'); // replace 'yourModuleName' with the actual path to the module
const {isAdmin, createToken} = require('../middleware/auth')




  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<ADMIN>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//   router.get('/isadmin', isAdmin, async (req, res) =>{
//     const authHeader = req.headers;
//     console.log(authHeader)
//     return res.json({message: 'Authorised'})
//   })

// ...............................  ADMIN LOGIN .......................................
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    db.query('SELECT * FROM AdminAuthorization WHERE email = ? AND password = ?', [email, password], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      if (result.length === 0) {
        // No matching record found, indicating incorrect email or password
        res.status(401).json({ error: 'Incorrect email or password' });
        return;
      }
  
      const payload = { id: crypto.randomBytes(16).toString("hex") };
      const token = createToken(payload);
  
      res.json({ token: token, admin_authorization: payload });
    });
  });
  
  
  // ............................. ADMIN REGISTER SCHOOL ................................
  router.post('/create-school', async (req, res) => {
    const { schoolName, course1, course2, course3, course4, course5, monday, tuesday, wednesday, thursday, friday, saturday, email, phone, course, duration, courseFee, amountPaid, schoolAddress } = req.body;
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS PartnerSchools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      schoolName VARCHAR(255) NOT NULL,
      course1 VARCHAR(255) NOT NULL,
      course2 VARCHAR(255) NOT NULL,
      course3 VARCHAR(255) NOT NULL,
      course4 VARCHAR(255) NOT NULL,
      course5 VARCHAR(255) NOT NULL,
      monday VARCHAR(255) NOT NULL,
      tuesday VARCHAR(255) NOT NULL,
      wednesday VARCHAR(255) NOT NULL,
      thursday VARCHAR(255) NOT NULL,
      friday VARCHAR(255) NOT NULL,
      saturday VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      duration VARCHAR(255) NOT NULL,
      courseFee VARCHAR(255) NOT NULL,
      amountPaid VARCHAR(255) NOT NULL,
      schoolAddress VARCHAR(255) NOT NULL
    );
  `;
  
    sch.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
    // Check if the student with the same email already exists
    sch.query(`SELECT * FROM PartnerSchools WHERE schoolName = ?`, [schoolName], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (result.length !== 0) {
        return res.status(400).json({ message: 'School with Name already exists' });
      }
  
  
      const total = courseFee - amountPaid;
      const sql = `
        INSERT INTO PartnerSchools (schoolName, course1, course2, course3, course4, course5, monday, tuesday, wednesday, thursday, friday, saturday, email, phone, duration, courseFee, amountPaid, schoolAddress)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      sch.query(sql, [schoolName, course1, course2, course3, course4, course5, monday, tuesday, wednesday, thursday, friday, saturday, email, phone, duration, courseFee, amountPaid, schoolAddress], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
  
        // Create and send an email in an async function
        // async function sendEmail() {
        //   const transporter = nodemailer.createTransport({
        //     host: 'mail.softwaredevemma.ng',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //       user: 'main@softwaredevemma.ng',
        //       pass: 'bYFx.1zDu968O.'
        //     }
        //   });
  
        //   const info = await transporter.sendMail({
        //     from: 'Ehizua Hub <main@softwaredevemma.ng>',
        //     to: email,
        //     subject: 'Login Details',
        //     html: `<p>Hello ${firstName} ${lastName}, verify your email by clicking on this link.. </p>
        //     <a href='${process.env.CLIENT_URL}/verify-student-email?emailToken=${emailToken}&email=${email}'> Verify Your Email </a>
        //     <h2>Your Subsequent Student Log in details are : </h2>
        //     <p> Email: ${email} </p>
        //     <p> Password: ${id} </p>`,
        //   });
  
        //   console.log("message sent: " + info.messageId);
        // }
  
        // Call the async function to send the email
        // await sendEmail();
  
        return res.json({ message: 'School created successfully', school: { schoolName, course1, course2, course3, course4, course5, monday, tuesday, wednesday, thursday, friday, saturday, email, course, phone, duration, courseFee, amountPaid, schoolAddress } });
      });
    });
  });
  
  // ............................. ADMIN GET LIST OF SCHOOLS ................................
  router.get('/partner-schools', async (req, res) => {
  
    sch.query('SELECT * FROM PartnerSchools', async (err, result) => {
      return res.json({ message: result });
  
    })
  })
  
  // ............................. ADMIN REGISTER SCHOOL STUDENT ................................
  router.post('/register-school-student', async (req, res) => {
    const { selectSchool, firstName, lastName, level, course1, course2, course3, course4, course5, year, term, guardiansPhone } = req.body;
    const words = selectSchool.split(' ');
  
    // Capitalize the first letter of each word and join them without spaces
    const school = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${school} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      school VARCHAR(255) NOT NULL,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      level VARCHAR(255) NOT NULL,
      course1 VARCHAR(255) NOT NULL,
      course2 VARCHAR(255) NOT NULL,
      course3 VARCHAR(255) NOT NULL,
      course4 VARCHAR(255) NOT NULL,
      course5 VARCHAR(255) NOT NULL,
      year VARCHAR(255) NOT NULL,
      term VARCHAR(255) NOT NULL,
      guardiansPhone VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      emailToken VARCHAR(255) NOT NULL,
      isVerified BOOLEAN NOT NULL DEFAULT false
  
      );
  `;
  
    sch.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
  
    // Check if the student with the same email already exists
    sch.query(`SELECT * FROM ${school} WHERE firstName = ? AND lastName = ? AND level = ?`, [firstName, lastName, level], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (result.length !== 0) {
        return res.status(400).json({ message: 'Student already exists' });
      }
  
  
      const countQuery = `SELECT COUNT(*) AS studentCount FROM ${school}`;
  
      sch.query(countQuery, async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        // Extract the student count from the result
        const studentCount = result[0].studentCount + 1;
  
  
  
        const domain = `ehizuahub.com`
        const email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${studentCount}@${domain}`
  
        // Generate a unique ID based on email and name
        const salt = await bcrypt.genSalt(10);
        const password = `${email.substring(0, 2)}${shortid.generate()}${firstName.substring(0, 2)}`;
        const hashedPass = await bcrypt.hash(password, salt);
  
        let emailToken = crypto.randomBytes(64).toString("hex");
  
  
        const sql = `
        INSERT INTO ${school} (school, firstName, lastName, level, course1, course2, course3, course4, course5, year, term, guardiansPhone, email, password, emailToken)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
        sch.query(sql, [school, firstName, lastName, level, course1, course2, course3, course4, course5, year, term, guardiansPhone, email, password, emailToken], async (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
          }
  
  
          return res.json({ message: 'Student created successfully' });
        });
      })
  
  
  
    });
  });
  
  
  // ............................. ADMIN REGISTER EHIZUA STUDENT ................................
  router.post('/create-student', async (req, res) => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Students (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      id VARCHAR(255) NOT NULL,
      course VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      profilePicture VARCHAR(255) NOT NULL DEFAULT 0,
      guardiansPhone VARCHAR(255) NOT NULL,
      duration VARCHAR(255) NOT NULL,
      courseFee VARCHAR(255) NOT NULL,
      amountPaid VARCHAR(255) NOT NULL,
      balance VARCHAR(255) NOT NULL,
      certificateApproved BOOLEAN NOT NULL DEFAULT 0,
      homeAddress VARCHAR(255) NOT NULL,
      isVerified BOOLEAN NOT NULL DEFAULT 0,
      emailToken VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP NOT NULL
    );
    `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error(err);
      throw new Error('Error creating table');
    }
  });
  
    const { firstName, lastName, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, homeAddress } = req.body;
  
  
    // Check if the student with the same email already exists
    db.query('SELECT * FROM Students WHERE email = ?', [email], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (result.length !== 0) {
        return res.status(400).json({ message: 'Student with email already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const id = `${email.substring(0, 2)}${shortid.generate()}${firstName.substring(0, 2)}`;
      const hashedPass = await bcrypt.hash(id, salt);
  
      // Generate a unique ID based on email and name
      const total = courseFee - amountPaid;
      let balance = total;
      let emailToken = crypto.randomBytes(64).toString("hex");
  
      const sql = `
        INSERT INTO Students (firstName, lastName, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, balance, homeAddress, id, emailToken)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      db.query(sql, [firstName, lastName, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, balance, homeAddress, hashedPass, emailToken], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
  
        // // Create and send an email in an async function
        // async function sendEmail() {
        //   const transporter = nodemailer.createTransport({
        //     host: 'mail.softwaredevemma.ng',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //       user: 'main@softwaredevemma.ng',
        //       pass: 'bYFx.1zDu968O.'
        //     }
        //   });
  
        //   const info = await transporter.sendMail({
        //     from: 'Ehizua Hub <main@softwaredevemma.ng>',
        //     to: email,
        //     subject: 'Login Details',
        //     html: `<p>Hello ${firstName} ${lastName}, verify your email by clicking on this link.. </p>
        //     <a href='${process.env.CLIENT_URL}/verify-student-email?emailToken=${emailToken}&email=${email}'> Verify Your Email </a>
        //     <h2>Your Subsequent Student Log in details are : </h2>
        //     <p> Email: ${email} </p>
        //     <p> Password: ${id} </p>`,
        //   });
  
        //   console.log("message sent: " + info.messageId);
        // }
  
        // // Call the async function to send the email
        // await sendEmail();
        console.log(id)
  
        return res.json({ message: 'Student created successfully', user: { id, firstName, lastName, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, balance, homeAddress, emailToken } });
      });
    });
  });
  
  // .............................. ADMIN GET ALL EHIZUA STUDENTS ..........................................
  router.get('/students', (req, res) => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Students (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      id VARCHAR(255) NOT NULL,
      course VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      profilePicture VARCHAR(255) NOT NULL DEFAULT 0,
      guardiansPhone VARCHAR(255) NOT NULL,
      duration VARCHAR(255) NOT NULL,
      courseFee VARCHAR(255) NOT NULL,
      amountPaid VARCHAR(255) NOT NULL,
      balance VARCHAR(255) NOT NULL,
      certificateApproved BOOLEAN NOT NULL DEFAULT 0,
      homeAddress VARCHAR(255) NOT NULL,
      isVerified BOOLEAN NOT NULL DEFAULT 0,
      emailToken VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP NOT NULL
    );
    `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error(err);
      throw new Error('Error creating table');
    }
  });
    try {
      db.query('SELECT _id, firstName, lastName, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, balance, homeAddress, certificateApproved, isVerified, createdAt FROM Students', async (err, students) => {
        if (err) {
          console.error('Error retrieving students:', err); // Log the error
          return res.status(500).json({ message: 'Error retrieving students' });
        }
        return res.json({ students });
      });
    } catch (error) {
      console.error('Error retrieving students:', error); // Log the error
      return res.status(500).json({ message: 'Error retrieving students' });
    }
  });
  
  // ............................. ADMIN EDIT EHIZUA STUDENT ................................
  router.put('/update-student/:id', async (req, res) => {
    const studentId = req.params.id; // Get the student's ID from the route parameter
    const { firstName, lastName, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, homeAddress, certificate, isVerified } = req.body;
  
    // Update the student's information in the database
    const sql = `
      UPDATE Students
      SET
        firstName = ?,
        lastName = ?,
        email = ?,
        course = ?,
        phone = ?,
        guardiansPhone = ?,
        duration = ?,
        courseFee = ?,
        amountPaid = ?,
        homeAddress = ?,
        certificateApproved = ?,
        isVerified = ?
      WHERE _id = ?
    `;
  
    
    db.query(
      sql,
      [firstName, lastName, email, course, phone, guardiansPhone, duration, courseFee, amountPaid, homeAddress, certificate, isVerified, studentId],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        // Check if the student was found and updated
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Student not found' });
        }
  
        // Send a response indicating success
        return res.json({ message: 'Student updated successfully' });
      }
    );
  });
  
  
  // ............................ADMIN CREATE TUTOR ............................
  router.post('/create-tutor', async (req, res) => {
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Tutors (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      office VARCHAR(255) NOT NULL,
      course VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      sickLeave VARCHAR(255) NOT NULL,
      id VARCHAR(255) NOT NULL,
      emailToken VARCHAR(255) NOT NULL,
      HMO VARCHAR(255) NOT NULL DEFAULT 10,
      homeAddress VARCHAR(255) NOT NULL,
      isVerified BOOLEAN NOT NULL DEFAULT 0,
      createdAt TIMESTAMP NOT NULL
    );
    `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error(err);
      throw new Error('Error creating table');
    }
  });
  
    const { first_name, last_name, email, office, course, phone, sick_leave, homeAddress } = req.body;
  
    // Check if the student with the same email already exists
  
    db.query('SELECT * FROM Tutors WHERE email = ?', [email], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (result.length !== 0) {
        return res.status(400).json({ message: 'Tutor with email already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;
      const hashedPass = await bcrypt.hash(id, salt);
  
      // Generate a unique ID based on email and name
      let emailToken = crypto.randomBytes(64).toString("hex");
  
      const sql = `
          INSERT INTO Tutors (first_name, last_name, email, office, course, phone, sickLeave, id, emailToken, homeAddress)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
  
  
      db.query(sql, [first_name, last_name, email, office, course, phone, sick_leave, hashedPass, emailToken, homeAddress], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
  
        // // Create and send an email in an async function
        // async function sendEmail() {
        //   const transporter = nodemailer.createTransport({
        //     host: 'mail.softwaredevemma.ng',
        //     port: 465,
        //     secure: true,
        //     auth: {
        //       user: 'main@softwaredevemma.ng',
        //       pass: 'bYFx.1zDu968O.'
        //     }
        //   });
  
        //   const info = await transporter.sendMail({
        //     from: 'Ehizua Hub <main@softwaredevemma.ng>',
        //     to: email,
        //     subject: 'Login Details',
        //     html: `<p>Hello ${first_name} ${last_name}, verify your email by clicking on this link.. </p>
        //       <a href='${process.env.CLIENT_URL}/verify-tutor-email?emailToken=${emailToken}&email=${email}'> Verify Your Email </a>
        //       <h2>Your Subsequent Tutor Log in details are : </h2>
        //       <p> Email: ${email} </p>
        //       <p> Password: ${id} </p>`,
        //   });
  
        //   console.log("message sent: " + info.messageId);
        // }
  
        // // Call the async function to send the email
        // await sendEmail();
  
        console.log(id)
  
        return res.json({ message: 'Tutor created successfully', user: { id, first_name, last_name, email, course, phone, emailToken } });
      });
    });
  
  });
  
  // ............................ADMIN CREATE A NEW UPSKILL COURSE ............................
  
  router.post('/create-course', async (req, res) => {
    const { course } = req.body;
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Courses (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      course VARCHAR(255) NOT NULL
    );
  `;
  
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
  
    // Check if the Course with the same name already exists
  
    db.query('SELECT * FROM Courses WHERE course = ?', [course], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (result.length !== 0) {
        return res.status(400).json({ message: 'Course with name already exists' });
      }
  
  
      const sql = `
          INSERT INTO Courses (course)
          VALUES (?)
        `;
  
  
      db.query(sql, [course], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        return res.json({ message: `${course} created successfully` });
      });
    });
  
  });
  
  // ............................ADMIN CREATE A NEW SCHOOL COURSE ............................
  
  router.post('/create-subject', async (req, res) => {
    const { course } = req.body;
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Courses (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      course VARCHAR(255) NOT NULL
    );
  `;
  
    sch.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
  
    // Check if the Course with the same name already exists
  
    sch.query('SELECT * FROM Courses WHERE course = ?', [course], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (result.length !== 0) {
        return res.status(400).json({ message: 'Course with name already exists' });
      }
  
  
      const sql = `
          INSERT INTO Courses (course)
          VALUES (?)
        `;
  
  
      sch.query(sql, [course], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        return res.json({ message: `${course} created successfully` });
      });
    });
  
  });
  
  // ............................. ADMIN GET LIST OF UPSKILL COURSES ................................
  router.get('/all_upskill_courses', async (req, res) => {
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Courses (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      course VARCHAR(255) NOT NULL
    );
  `;
  
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
  
    db.query('SELECT * FROM Courses', async (err, result) => {
      return res.json({ message: result });
  
    })
  })
  
  // ............................. ADMIN GET LIST OF SCHOOL SUBJECTS ................................
  router.get('/all_school_subject', async (req, res) => {
  
    sch.query('SELECT * FROM Courses', async (err, result) => {
  
      return res.json({ message: result });
  
    })
  })
  
  // .............................. ADMIN GET ALL TUTOR DETAILS ..........................................
  
  router.get('/tutors', (req, res) => {
  
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Tutors (
        _id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        office VARCHAR(255) NOT NULL,
        course VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        sickLeave VARCHAR(255) NOT NULL,
        id VARCHAR(255) NOT NULL,
        emailToken VARCHAR(255) NOT NULL,
        HMO VARCHAR(255) NOT NULL DEFAULT 10,
        homeAddress VARCHAR(255) NOT NULL,
        isVerified BOOLEAN NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL
      );
      `;
  
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
  
    try {
      db.query('SELECT * FROM Tutors', async (err, tutors) => {
        if (err) {
          console.error('Error retrieving tutors:', err); // Log the error
          return res.status(500).json({ message: 'Error retrieving tutors' });
        }
  
        return res.json({ tutors });
      });
    } catch (error) {
      console.error('Error retrieving tutors:', error); // Log the error
      return res.status(500).json({ message: 'Error retrieving tutors' });
    }
  });
  
  // ............................. ADMIN EDIT TUTOR ................................
  router.put('/update-tutor/:id', async (req, res) => {
    const tutorId = req.params.id; // Get the student's ID from the route parameter
    const { firstName, lastName, email, course, phone, sickLeave, homeAddress, isVerified } = req.body;
  
    // Update the Tutors's information in the database
    const sql = `
      UPDATE Tutors
      SET
        first_name = ?,
        last_name = ?,
        email = ?,
        course = ?,
        phone = ?,
        sickLeave = ?,
        homeAddress = ?,
        isVerified = ?
      WHERE _id = ?
    `;
  
  
  
    db.query(
      sql,
      [firstName, lastName, email, course, phone, sickLeave, homeAddress, isVerified, tutorId],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        // Check if the student was found and updated
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Tutor not found' });
        }
  
        // Send a response indicating success
        return res.json({ message: 'Tutor updated successfully' });
      }
    );
  });
  
  // ............................. ADMIN APPROVE CERTIFICATE ................................
  router.put('/approve-certificate/:id', async (req, res) => {
    const studentId = req.params.id; // Get the student's ID from the route parameter
  
    // Update the student's information in the database
    const sql = `
      UPDATE Students
      SET
      certificateApproved = ?
      WHERE _id = ?
    `;
  
    db.query(
      sql, ['1', studentId],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        // Check if the student was found and updated
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Student not found' });
        }
  
        // Send a response indicating success
        return res.json({ message: 'Students Certificate successfully Released' });
      }
    );
  });
  
  // ............................. ADMIN GET COURSE CONTENT ................................
  router.get('/student-course-content', async (req, res) => {
    const course = req.headers.course
  
    try {
  
      db.query('SELECT * FROM Contents WHERE course = ?', [course], async (err, content) => {
        return res.status(200).json({ content });
      })
  
    } catch (error) {
      console.error('Error retrieving course content:', error);
      return res.status(500).json({ message: 'An error occurred while retrieving course content' });
    }
  });
  
  // ............................. ADMIN GET COURSE SCORE ................................
  router.get('/student-score', async (req, res) => {
    const course = req.headers.course;
    const email = req.headers.email;
  
  
    db.query('SELECT * FROM Percentage WHERE course = ? AND email = ?', [course, email], async (err, score) => {
      return res.json({ message: score });
    })
  })
  
  
  // ............................. ADMIN REGISTER OFFICE ................................
  router.post('/register-office', async (req, res) => {
    const { officeName, officePhoneNumber, officeEmail, state, officeAddress } = req.body;
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Offices (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      officeName VARCHAR(255) NOT NULL,
      officePhone VARCHAR(255) NOT NULL,
      officeEmail VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      officeAddress VARCHAR(255) NOT NULL
    );
  `;
  
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
    // Check if the Office with the same Name already exists
    db.query(`SELECT * FROM Offices WHERE officeName = ?`, [officeName], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (result.length !== 0) {
        return res.status(400).json({ message: 'Office with Name already exists' });
      }
  
  
      const sql = `
        INSERT INTO Offices (officeName, officePhone, officeEmail, state, officeAddress)
        VALUES (?, ?, ?, ?, ?)
      `;
  
      db.query(sql, [officeName, officePhoneNumber, officeEmail, state, officeAddress], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        return res.json({ message: 'Office Registered successfully' });
      });
    });
  });
  
  
  // ............................. ADMIN GET LIST OF OFFICES ................................
  router.get('/all_offices', async (req, res) => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Offices (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      officeName VARCHAR(255) NOT NULL,
      officePhone VARCHAR(255) NOT NULL,
      officeEmail VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      officeAddress VARCHAR(255) NOT NULL
    );
  `;
  
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
  
    db.query('SELECT * FROM Offices', async (err, result) => {
      return res.json({ message: result });
  
    })
  })
  
  
  // ............................. ADMIN REJECT LEAVE REQUEST ................................
  router.put('/reject-leave-request/:id', async (req, res) => {
    const id = req.params.id;
  
    // Update the Tutors's information in the database
    const sql = `
      UPDATE LeaveApplication
      SET
      isApproved = ?
      WHERE _id = ?
    `;
  
    db.query(
      sql, ['2', id],
      async (err, result) => {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }
  
        // Check if the student was found and updated
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Student not found' });
        }
  
        // Send a response indicating success
        return res.json({ reject: 'Sick Leave Request Not Granted' });
      }
    );
  
  });
  
  
  // ............................. ADMIN APPROVE LEAVE REQUEST ................................
  router.put('/approve-leave-request/:id', async (req, res) => {
    const id = req.params.id;
  
    db.query('SELECT * FROM LeaveApplication WHERE _id = ?', [id], async (err, tutor) => {
      const numberOfDays = parseInt(tutor[0].numberOfDays)
      const email = tutor[0].email
      db.query('SELECT * FROM Tutors WHERE email = ?', [email], async (err, tutor) => {
        const leaveAllocated = parseInt(tutor[0].sickLeave)
        const leaveTaken = tutor[0].sickLeaveTaken
        const totalDays = parseInt(leaveTaken) + parseInt(numberOfDays)
        if (leaveAllocated < totalDays) {
          return res.status(404).json({
            notApprove: `
                  Staff has used ${leaveTaken} days out of ${leaveAllocated} days.
                  Adding ${numberOfDays} days leave will exceed his allocated leave`
          })
  
        } else {
          // Update the Tutors's information in the database
          const sql = `
                    UPDATE Tutors
                    SET
                    sickLeaveTaken = ?
                    WHERE email = ?
                `;
  
          db.query(sql, [totalDays, email], async (err, result) => {
            if (err) {
              return res.status(500).send('Internal Server Error');
            }
  
            // Check if the student was found and updated
            if (result.affectedRows === 0) {
              return res.status(404).json({ message: 'Tutor not found' });
            }
  
  
  
            const sql = `
                  UPDATE LeaveApplication
                  SET
                  isApproved = ?
                  WHERE _id = ?
                `;
  
            db.query(sql, ['1', id], async (err, result) => {
              if (err) {
                return res.status(500).send('Internal Server Error');
              }
  
              // Check if the student was found and updated
              if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Tutor not found' });
              }
  
  
              // Send a response indicating success
              return res.json({ approve: 'Sick Leave Request Granted' });
            }
            );
          }
          );
  
  
        }
  
      })
    })
  
  });
  
  // ..............................ADMIN GET ALL LEAVE REQUEST ..........................................
  router.get('/tutor-leave-request', (req, res) => {
  
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS LeaveApplication (
      _id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      department VARCHAR(255) NOT NULL,
      numberOfDays VARCHAR(255) NOT NULL,
      leaveStartDate VARCHAR(255) NOT NULL,
      leaveEndDate VARCHAR(255) NOT NULL,
      purposeOfLeave VARCHAR(255) NOT NULL,
      allocatedLeave VARCHAR(255) NOT NULL,
      daysRemaining VARCHAR(255) NOT NULL
    );
  `;
  
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error(err);
        throw new Error('Error creating table');
      }
    });
  
    try {
      db.query('SELECT * FROM LeaveApplication', async (err, leave) => {
        if (err) {
          console.error('Error retrieving tutors:', err); // Log the error
          return res.status(500).json({ message: 'Error retrieving tutors' });
        }
  
        return res.json({ leave });
      });
    } catch (error) {
      console.error('Error retrieving tutors:', error); // Log the error
      return res.status(500).json({ message: 'Error retrieving tutors' });
    }
  });
  



module.exports = router;
