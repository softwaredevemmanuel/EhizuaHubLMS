const router = require("express").Router();
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const shortid = require('shortid');
require('dotenv').config();
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<TUTOR>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


// ..........................TEST ROUTER ..................................
router.get('/test', async (req, res) => {
  return res.json("Test router is working..........");

})
// ..........................TUTOR  VERIFICATION EMAIL ..................................
router.post('/verify-tutor-email', async (req, res) => {
  try {
    const { emailToken, email } = req.body;

    if (!emailToken) {
      return res.status(404).json("EmailToken not found...");
    }

    db.query('SELECT * FROM Tutors WHERE email = ?', [email], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }

      if (result.length === 0) {
        return res.status(404).json("Tutor not found.");
      }


      if (result[0].isVerified === 1) {
        return res.status(400).json('Email has already been verified.');
      }

      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json("Your account has been suspended. Please contact Ehizua Hub Admin.");
      }

      // Update the emailToken and isVerified fields
      const updatedEmailToken = null;
      const isVerified = 1;
      const updateSql = `
          UPDATE Tutors
          SET emailToken = ?, isVerified = ?
          WHERE email = ?
        `;


      db.query(updateSql, [updatedEmailToken, isVerified, email], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        res.status(200).json(`Your Email (${email}) has been verified successfully.`);
      });
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

// .............................. TUTOR LOGIN ....................................
router.post('/tutor-login', async (req, res) => {
  const { email, id } = req.body;


  db.query('SELECT * FROM Tutors WHERE email = ?', [email], async (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }


    if (result.length === 0) {
      return res.status(401).json({ message: 'Wrong Email or Password' });
    }

    const validated = await bcrypt.compare(id, result[0].id);

    if (result[0].emailToken === null && result[0].isVerified === 0) {
      return res.status(404).json({ message: "Your account has been suspended. Please contact Ehizua Hub Admin." });
    }

    if (result[0].isVerified === 0) {
      return res.status(400).json({ message: 'Please verify your account.. Or contact Ehizua Hub Admin for assistance' });
    }


    if (!validated) {
      return res.status(404).json({ message: "Wrong Email or Password." });

    }
    const name = (`${result[0].first_name} ${result[0].last_name}`);
    const course = (result[0].course);
    const payload = { id: result[0]._id };
    const token = createToken(payload);

    res.json({ token: token, tutor: name, tutor_authorization: result[0].id, course: course, office: result[0].office, email: email });

  });
});


// ...........................TUTOR FORGET PASSWORD ..........................
router.post('/tutor_forgot_password', async (req, res) => {
  const { email } = req.body;
  try {
    db.query('SELECT * FROM Tutors WHERE email = ?', [email], async (err, result) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }
      // If there are no users with that email address in our database then we have to tell the client they don't exist!

      if (result.length === 0) {
        return res.status(401).json({ error: 'No Tutor with Email found' });
      }
      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json({ error: 'Your account has been suspended. Please contact Ehizua Hub Admin.' });
      }
      first_name = result[0].first_name
      last_name = result[0].last_name


      const salt = await bcrypt.genSalt(10);
      // Generate a unique ID based on email and name
      const id = `${email.substring(0, 2)}${shortid.generate()}${first_name.substring(0, 2)}`;
      const hashedPass = await bcrypt.hash(id, salt);


      // Update the emailToken and isVerified fields
      const updatedId = hashedPass;
      const updateSql = `
         UPDATE Tutors
         SET id = ?
         WHERE email = ?
       `;
      db.query(updateSql, [updatedId, email], async (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }


        // ..........Send Email to Tutor ............
        async function sendEmail() {
          const transporter = nodemailer.createTransport({
            host: 'mail.softwaredevemma.ng',
            port: 465,
            secure: true,
            auth: {
              user: 'main@softwaredevemma.ng',
              pass: 'bYFx.1zDu968O.'
            }

          });


          const info = await transporter.sendMail({
            from: 'Ehizua Hub <main@softwaredevemma.ng>',
            to: email,
            subject: 'Password Reset',
            html: `<p>Hello ${first_name} ${last_name} your Tutor Login password has been reset successfully

                <h2>Your New Log in details are : </h2>
                <p> Email: ${email} </p>
                <p> Password: ${id} </p>`,

          })
          console.log("message sent: " + info.messageId);
        }

        await sendEmail();



        res.status(200).json(`Password has been sent to ${email}. `);

      });

    });

  } catch {
    return res.json('Something went wrong')
  }

})


// ............................. TUTOR CREATE CURRICULUM .................................
router.post('/create-curriculum', (req, res) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Curriculum (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course VARCHAR(255) NOT NULL,
      mainTopic VARCHAR(255) NOT NULL,
      subTopic VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP NOT NULL
    );
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error(err);
      throw new Error('Error creating table');
    }
  });

  const { authHeader, course, mainTopic, subTopic } = req.body;

  db.query('SELECT * FROM Tutors WHERE id = ?', [authHeader], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'Unauthorised to view this page. Please Login' });
    }

    if (result[0].emailToken === null && result[0].isVerified === 0) {
      return res.status(404).json({ error: 'Your account has been suspended. Please contact Ehizua Hub Admin.' });
    }

    if (result[0].isVerified === 0) {
      return res.status(400).json({ error: 'Please verify your account or contact Ehizua Hub Admin for assistance' });
    }



    db.query('SELECT * FROM Curriculum WHERE mainTopic = ? AND course = ?', [mainTopic, course], async (err, curriculum) => {
      if (curriculum.length > 0) {
        return res.status(401).json({ message: `${mainTopic} Topic already exists` });

      } else {

        // Now, you can insert data into the Curriculum table
        const insertDataQuery = `
              INSERT INTO Curriculum (course, mainTopic, subTopic)
              VALUES (?, ?, ?);
            `;

        const values = [course, mainTopic, subTopic];

        db.query(insertDataQuery, values, (err) => {
          if (err) {
            console.error(err);
            throw new Error('Error inserting data');
          }
          return res.json({ message: `${mainTopic} curriculum created successfully` });
        });
      }
    })
  })


});

// ............................. GET CURRICULUM MAINTOPIC.................................
router.get('/maintopic', (req, res) => {
  const course = req.headers.course;

  db.query('SELECT * FROM Curriculum WHERE course = ?', [course], async (err, curriculum) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching curriculum data' });
    }


    // Extract MainTopic values from the curriculum data
    const main_topics = JSON.parse(JSON.stringify(curriculum));

    res.json({ message: main_topics });
  });
});

// ............................. GET CURRICULUM SUBTOPIC.................................
router.get('/subtopic', (req, res) => {
  const course = req.headers.course;
  const mainTopic = req.headers.main_topic;

  db.query('SELECT * FROM Curriculum WHERE course = ? AND mainTopic = ?', [course, mainTopic], async (err, curriculum) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching curriculum data' });
    }


    // Extract subTopic values from the curriculum data
    const topics = JSON.parse(JSON.stringify(curriculum));
    subTopic = topics[0].subTopic
    const arrayOfItems = subTopic.split(', ');

    res.json({ subTopics: arrayOfItems });
  });
});


// ............................. TUTOR CREATE CONTENT .................................
router.post('/create-content', async (req, res) => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mainTopic VARCHAR(255) NOT NULL,
    subTopic VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL
  );
`;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error(err);
      throw new Error('Error creating table');
    }
  });
  const { authHeader, main_topic, content, course, sub_topic } = req.body;

  try {
    db.query('SELECT * FROM Tutors WHERE id = ?', [authHeader], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.length == 0) {
        return res.status(401).json({ error: 'Unauthorised to view this page. Please Login' });
      }

      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json({ error: 'Your account has been suspended. Please contact Ehizua Hub Admin.' });
      }

      if (result[0].isVerified == 0) {
        return res.status(400).json({ error: 'Please verify your account or contact Ehizua Hub Admin for assistance' });
      }



      // Check if the Content with the same Main Topic and Sub Topic already exists
      db.query('SELECT * FROM Contents WHERE mainTopic = ? AND subTopic = ?', [main_topic, sub_topic], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        if (result.length !== 0) {
          return res.status(400).json({ error: 'Topic already exists' });
        }


        const sql = `
        INSERT INTO Contents (mainTopic, content, course, subTopic)
        VALUES (?, ?, ?, ?)
      `;

        db.query(sql, [main_topic, content, course, sub_topic], async (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
          }

          return res.json({ message: 'Content created successfully', content: result });
        });
      });

    })

  } catch (error) {
    return res.status(500).json({ message: 'Error creating content' });
  }


});


// .......................... TUTOR GET COURSE CONTENT ..........................................
router.get('/course-content', async (req, res) => {
  const authHeader = req.headers.authheader;
  const course = req.headers.course;

  try {
    db.query('SELECT * FROM Tutors WHERE id = ?', [authHeader], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Unauthorised to view this page. Please Login' });
      }

      if (result[0].isVerified === 0) {
        return res.status(400).json({ error: 'Please verify your account or contact Ehizua Hub Admin for assistance' });
      }

      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json({ error: 'Your account has been suspended. Please contact Ehizua Hub Admin.' });
      }

      db.query('SELECT * FROM Contents WHERE course = ?', [course], async (err, content) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error fetching course content' });
        }
        return res.json({ content });
      });

    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unauthorized!! Please login to view courses' });
  }
});


// .................................... GET TUTOR STUDENTS ..........................................
router.get('/api/tutor/students', async (req, res) => {
  const authHeader = req.headers.authheader;
  const course = req.headers.course;

  try {
    db.query('SELECT * FROM Tutors WHERE id = ?', [authHeader], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Unauthorised to view this page. Please Login' });
      }

      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json({ error: 'Your account has been suspended. Please contact Ehizua Hub Admin.' });
      }

      if (result[0].isVerified === 0) {
        return res.status(400).json({ error: 'Please verify your account or contact Ehizua Hub Admin for assistance' });
      }



      db.query('SELECT * FROM Students WHERE course = ?', [course], async (err, students) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error fetching course content' });
        }
        return res.json({ students });
      });

    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unauthorized!! Please login to view courses' });
  }
});


// ....................................TUTOR CREATE QUESTION..........................................
router.post('/create-questions', async (req, res) => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course VARCHAR(255) NOT NULL,
    mainTopic VARCHAR(255) NOT NULL,
    subTopic VARCHAR(255) NOT NULL,
    question VARCHAR(255) NOT NULL,
    ans1 VARCHAR(255) NOT NULL,
    ans2 VARCHAR(255) NOT NULL,
    ans3 VARCHAR(255) NOT NULL,
    ans4 VARCHAR(255) NOT NULL,
    correctAns VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP NOT NULL
  );
`;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error(err);
      throw new Error('Error creating table');
    }
  });
  const { authHeader, course, mainTopic, subTopic, question, ans1, ans2, ans3, ans4, correctAns, } = req.body;

  try {
    db.query('SELECT * FROM Tutors WHERE id = ?', [authHeader], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.length == 0) {
        return res.status(401).json({ error: 'Unauthorised to view this page. Please Login' });
      }

      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json({ error: 'Your account has been suspended. Please contact Ehizua Hub Admin.' });
      }

      if (result[0].isVerified == 0) {
        return res.status(400).json({ error: 'Please verify your account or contact Ehizua Hub Admin for assistance' });
      }


      db.query('SELECT * FROM Questions WHERE question = ? AND mainTopic = ?', [question, mainTopic, subTopic], async (err, result) => {
        if (result.length > 0) {
          return res.status(400).json({ error: 'Question already exists! Set another' });

        } else {
          // Create a new content with the tutor's course
          const sql = `INSERT INTO Questions (course, mainTopic, subTopic, question, ans1, ans2, ans3, ans4, correctAns)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          db.query(sql, [course, mainTopic, subTopic, question, ans1, ans2, ans3, ans4, correctAns], async (err, newContent) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Internal Server Error');
            }
            return res.json({ message: 'Question created successfully', question: newContent });

          })
        }


      })

    })

  } catch (error) {
    return res.status(500).json({ message: 'Error creating content' });
  }
});


// .................................TUTOR APPLY FOR LEAVE ...................................
router.post('/leave-application', async (req, res) => {
  const leaveRequest = req.body


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

    db.query('SELECT * FROM Tutors WHERE email = ?', [leaveRequest.email], async (err, result) => {
      const allocatedLeave = result[0].sickLeave
      const daysRemaining = result[0].sickLeaveTaken

      db.query('SELECT * FROM LeaveApplication', async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }


        const sql = `
              INSERT INTO LeaveApplication (fullName, email, location, department, numberOfDays, leaveStartDate, leaveEndDate, purposeOfLeave, allocatedLeave, daysRemaining)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;


        db.query(sql, [leaveRequest.name, leaveRequest.email, leaveRequest.office, leaveRequest.course, leaveRequest.formData.selectedDays, leaveRequest.formData.leaveStartDate, leaveRequest.formData.leaveEndDate, leaveRequest.formData.purposeOfLeave, allocatedLeave, daysRemaining], async (err, result) => {

          if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
          }

          return res.json({ message: 'Request sent successfully' });
        });
      });
    })

  } catch (error) {
    return res.status(500).json({ message: 'Error creating content' });
  }

})




  module.exports = router;
