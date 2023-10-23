const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const shortid = require('shortid');
const nodemailer = require('nodemailer');
require('dotenv').config();

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<STUDENT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  // .................................... TEST ROUTER ...............................
  router.get('/test', async (req, res) => {
    return res.status(200).json(`Your Email  has been verified successfully.`);
  });

// .......................... STUDENT VERIFICATION EMAIL ..................................
router.post('/verify-student-email', async (req, res) => {
    try {
      const { emailToken, email } = req.body;
  
      if (!emailToken) {
        return res.status(404).json("EmailToken not found...");
      }
  
      db.query('SELECT * FROM Students WHERE email = ?', [email], async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }
  
        if (result.length === 0) {
          return res.status(404).json("Student not found.");
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
          UPDATE Students
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
  
  // ................................. STUDENT LOGIN ...........................................
  router.post('/student-login', async (req, res) => {
    const { email, id } = req.body;
  
  
    db.query('SELECT * FROM Students WHERE email = ?', [email], async (err, result) => {
  
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
  
      if (result.length === 0) {
        return res.status(401).json({ message: 'Wrong Email or Password' });
      }
  
      const validated = await bcrypt.compare(id, result[0].id);
  
  
      if (result[0].isVerified === 0) {
        return res.status(400).json({ message: 'Please verify your account.. Or contact Ehizua Hub Admin for assistance' });
      }
  
      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json("Your account has been suspended. Please contact Ehizua Hub Admin.");
      }
      if (!validated) {
        return res.status(404).json({ message: "Wrong Email or Password." });
  
      }
      const name = (`${result[0].firstName} ${result[0].lastName}`);
      const course = (result[0].course);
      const payload = { id: result[0]._id };
      const token = createToken(payload);
      res.json({ token: token, user: name, authHeader: result[0].id, course: course });
  
    });
  });
  
  // ........................... STUDENT FORGET PASSWORD ..........................
  router.post('/student_forgot_password', async (req, res) => {
    const { email } = req.body;
    try {
      db.query('SELECT * FROM Students WHERE email = ?', [email], async (err, result) => {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }
        // If there are no users with that email address in our database then we have to tell the client they don't exist!
  
        if (result.length === 0) {
          return res.status(401).json('No Student with Email found');
        }
        firstName = result[0].firstName
        lastName = result[0].lastName
  
  
        const salt = await bcrypt.genSalt(10);
        // Generate a unique ID based on email and name
        const id = `${email.substring(0, 2)}${shortid.generate()}${firstName.substring(0, 2)}`;
        const hashedPass = await bcrypt.hash(id, salt);
  
        // Update the emailToken and isVerified fields
        const updatedId = hashedPass;
        const updateSql = `
           UPDATE Students
           SET id = ?
           WHERE email = ?
         `;
        db.query(updateSql, [updatedId, email], async (err, updateResult) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
          }
          console.log(id)
  
  
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
              html: `<p>Hello ${firstName} ${lastName} your student password has been reset successfully
  
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
  
  // .................................... STUDENT COURSE CONTENT ...............................
  router.get('/student-course-content', async (req, res) => {
  
    const authHeader = req.headers.authheader;
  
    try {
      db.query('SELECT * FROM Students WHERE id = ?', [authHeader], async (err, response) => {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }
  
        if (response[0].emailToken === null && response[0].isVerified === 0) {
          return res.status(404).json("Your account has been suspended. Please contact Ehizua Hub Admin.");
        }
  
        const course = response[0].course;
        db.query('SELECT * FROM Contents WHERE course = ?', [course], async (err, content) => {
          return res.status(200).json({ content });
        })
      })
  
    } catch (error) {
      console.error('Error retrieving course content:', error);
      return res.status(500).json({ message: 'An error occurred while retrieving course content' });
    }
  });
   
  // .................................... GET QUESTIONS ..........................................
  router.get('/api/students/questions', async (req, res) => {
    const authHeader = req.headers.authheader;
    const subTopic = req.headers.sub_topic;
    const course = req.headers.course;
    const email = req.headers.email;
    const yes = req.headers.yes;
  
  
    // Check if there is a valid authHeader, topic, course, and email
    if (!authHeader || !subTopic || !course || !email) {
      return res.status(400).json({ message: 'Missing required headers' });
    }
  
    db.query('SELECT * FROM Percentage WHERE subTopic = ? AND course = ? AND email = ?', [subTopic, course, email], async (err, response) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (response.length === 1 && response[0].score == 100) {
        return res.status(500).json({ retake: `You already got a 100% score in ${subTopic}. Do well to go to the next topic` });
  
      }
  
      if (response.length === 1 && response[0].score < 100 && response[0].score >= 70) {
        return res.status(500).json({ retake: `You exceeded the pass mark but you can do better` });
  
      }
      if (response.length === 1) {
        const currentTime = Date.now();
        const submissionTime = response[0].updatedAt;
        const timeDifference = currentTime - submissionTime;
        const oneMinuteInMillis = 1 * 60 * 100000; // 1 minute in milliseconds
  
        const timeLeftInMillis = oneMinuteInMillis - timeDifference;
        if (timeDifference > oneMinuteInMillis) {
          db.query('SELECT * FROM Students WHERE id = ?', [authHeader], async (err, studentResponse) => {
            if (err) {
              console.error('Error executing SQL query for student:', err);
              return res.status(500).json({ message: 'Internal server error' });
            }
            // Section to authenticate a student
  
            db.query('SELECT * FROM Questions WHERE subTopic = ? AND course = ?', [subTopic, course], async (err, questionsResponse) => {
              if (err) {
                console.error('Error executing SQL query for questions:', err);
                return res.status(500).json({ message: 'Internal server error' });
              }
  
              const questions = JSON.parse(JSON.stringify(questionsResponse));
  
              return res.json({ message: `${subTopic} Questions`, questions });
            });
          });
        } else {
          const minutesLeft = Math.floor(timeLeftInMillis / (60 * 1000));
          const hoursLeft = Math.floor(minutesLeft / 60)
          const hoursMinLeft = Math.floor(minutesLeft % 60)
          const secondsLeft = Math.ceil((timeLeftInMillis - minutesLeft * 60 * 1000) / 1000);
          const timeLeftMessage = `${minutesLeft} min ${secondsLeft} sec`;
          if (hoursLeft > 1) {
            return res.status(500).json({ message: `Kindly Retake this test after ${hoursLeft}hrs ${hoursMinLeft}mins. Do well to revise through the topic again` });
  
          } else {
            return res.status(500).json({ message: `Kindly Retake this test after ${hoursLeft}hr ${hoursMinLeft}mins. Do well to revise through the topic again` });
  
          }
  
        }
  
      } else {
        db.query('SELECT * FROM Students WHERE id = ?', [authHeader], async (err, studentResponse) => {
          if (err) {
            console.error('Error executing SQL query for student:', err);
            return res.status(500).json({ message: 'Internal server error' });
          }
          // Section to authenticate a student
  
          db.query('SELECT * FROM Questions WHERE subTopic = ? AND course = ?', [subTopic, course], async (err, questionsResponse) => {
            if (err) {
              console.error('Error executing SQL query for questions:', err);
              return res.status(500).json({ message: 'Internal server error' });
            }
  
            const questions = JSON.parse(JSON.stringify(questionsResponse));
  
            return res.json({ message: `${subTopic} Questions`, questions });
          });
        });
      }
    });
  });
   
  // .......................... RETAKE YES BUTTON ......................
  router.get('/api/students/retake', async (req, res) => {
    const subTopic = req.headers.sub_topic;
    const course = req.headers.course;
  
    db.query('SELECT * FROM Questions WHERE subTopic = ? AND course = ?', [subTopic, course], async (err, questionsResponse) => {
      if (err) {
        console.error('Error executing SQL query for questions:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      const questions = JSON.parse(JSON.stringify(questionsResponse));
  
      return res.json({ message: `${subTopic} Questions`, questions });
    });
  
  
  
  });
  
  // ....................SubmitedQuestion Students Question..........................................
  router.post('/api/students/submit_questions', async (req, res) => {
    const questionsArray = req.body; // Array of question objects
  
    try {
      const submittedQuestions = [];
  
      for (const { sub_topic, course, question, ans, email } of questionsArray) {
        db.query(
          'SELECT * FROM SubmittedQuestions WHERE subTopic = ? AND course = ? AND email = ? AND question = ?',
          [sub_topic, course, email, question],
          async (err, questionsResponse) => {
            if (err) {
              console.error('Error executing SELECT query:', err);
              return res.status(500).json({ message: 'Error submitting questions' });
            }
  
            if (questionsResponse.length > 0) {
  
              // Update the existing submission's ans field
              db.query(
                'UPDATE SubmittedQuestions SET ans = ? WHERE subTopic = ? AND course = ? AND email = ? AND question = ?',
                [ans, sub_topic, course, email, question],
                async (err, updateResponse) => {
                  if (err) {
                    console.error('Error executing UPDATE query:', err);
                    return res.status(500).json({ message: 'Error submitting questions' });
                  }
                  submittedQuestions.push(updateResponse);
                }
              );
  
  
            } else {
              // Insert a new submission
              db.query(
                'INSERT INTO SubmittedQuestions (subTopic, course, question, ans, email) VALUES (?, ?, ?, ?, ?)',
                [sub_topic, course, question, ans, email],
                async (err, insertResponse) => {
                  if (err) {
                    console.error('Error executing INSERT query:', err);
                    return res.status(500).json({ message: 'Error submitting questions' });
                  }
                  submittedQuestions.push(insertResponse);
                }
              );
            }
          }
        );
      }
  
  
      return res.json({ message: 'Questions submitted successfully', answers: submittedQuestions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error submitting questions' });
    }
  });
  
  
  // .................................... CALCULATE Test Score ..........................................
  router.get('/api/students/check_test_score', async (req, res) => {
    const authHeader = req.headers.authheader;
    const subTopic = req.headers.sub_topic;
    const course = req.headers.course;
    const email = req.headers.email;
  
    try {
      db.query('SELECT * FROM SubmittedQuestions WHERE subTopic = ? AND course = ? AND email = ?', [subTopic, course, email], async (err, authTopic) => {
        db.query('SELECT * FROM Questions WHERE subTopic = ? AND course = ?', [subTopic, course], (err, authAns) => {
          let score = 0;
  
          for (let i = 0; i < authTopic.length; i++) {
            if (
              authTopic[i]['question'] === authAns[i]['question'] &&
              authTopic[i]['ans'] === authAns[i]['correctAns']
            ) {
              score += 1;
  
              db.query('UPDATE SubmittedQuestions SET isPassed = 1 WHERE subTopic = ? AND course = ? AND email = ? AND question = ?',
                [authTopic[i]['subTopic'], authTopic[i]['course'], authTopic[i]['email'], authTopic[i]['question']],
                async (err, updateResponse) => {
                  // Handle the update response if needed
                }
              );
            } else {
              db.query('UPDATE SubmittedQuestions SET isPassed = 0 WHERE subTopic = ? AND course = ? AND email = ? AND question = ?',
                [authTopic[i]['subTopic'], authTopic[i]['course'], authTopic[i]['email'], authTopic[i]['question']],
                async (err, updateResponse) => {
                  // Handle the update response if needed
                }
              );
            }
          } // Loop ends
  
  
          const cal = (score / authTopic.length) * 100;
          const percentageScore = cal.toFixed(1);
          let myPercent = parseFloat(percentageScore) >= 70;
  
          db.query('SELECT * FROM Percentage WHERE subTopic = ? AND course = ? AND email = ?', [subTopic, course, email], async (err, percentage) => {
            if (percentage.length > 0) {
              const prevScore = parseFloat(percentage[0].score)
              const currentScore = parseFloat(percentageScore)
              // Update the existing percentage data
              db.query('SELECT * FROM RetakenPercentage WHERE subTopic = ? AND course = ? AND email = ?', [subTopic, course, email], async (err, retakenpercentage) => {
                if (retakenpercentage.length > 0) {
                  db.query(
                    'UPDATE RetakenPercentage SET score = ?, isPassed = ?, updatedAt = CURRENT_TIMESTAMP WHERE subTopic = ? AND course = ? AND email = ?',
                    [percentageScore, myPercent ? 1 : 0, subTopic, course, email],
                    async (err, updateResponse) => {
                      if (currentScore < prevScore) {
                        return res.json({ message: `previous score ${prevScore}, Current Score ${percentageScore}. This score will not be updated` });
  
                      } else {
  
                        db.query(
                          'UPDATE Percentage SET score = ?, isPassed = ?, updatedAt = CURRENT_TIMESTAMP WHERE subTopic = ? AND course = ? AND email = ?',
                          [percentageScore, myPercent ? 1 : 0, subTopic, course, email],
                          async (err, updateResponse) => {
  
                            // add a condition if need be
                          }
                        );
                      }
                    }
                  );
  
                } else {
                  db.query(
                    'INSERT INTO RetakenPercentage (subTopic, course, email, score, isPassed) VALUES (?, ?, ?, ?, ?)',
                    [subTopic, course, email, percentageScore, myPercent ? 1 : 0],
                    async (err, insertResponse) => {
                      if (prevScore < percentageScore) {
                        return res.json({ message: `previous score ${prevScore}, Current Score ${percentageScore}. This score will not be updated` });
  
                      } else {
                        db.query(
                          'UPDATE Percentage SET score = ?, isPassed = ?, updatedAt = CURRENT_TIMESTAMP WHERE subTopic = ? AND course = ? AND email = ?',
                          [percentageScore, myPercent ? 1 : 0, subTopic, course, email],
                          async (err, updateResponse) => {
  
                            // add a condition if need be
  
                          }
                        );
                      }
  
                    }
                  );
  
                }
              })
  
            } else {
              // Insert a new submission
              db.query(
                'INSERT INTO Percentage (subTopic, course, email, score, isPassed) VALUES (?, ?, ?, ?, ?)',
                [subTopic, course, email, percentageScore, myPercent ? 1 : 0],
                async (err, insertResponse) => {
  
                  // add a condition if need be
  
                }
              );
            }
          });
  
  
        });
  
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating or creating percentage' });
    }
  });
  
  
  // ............................ GET TEST SCORE .....................
  router.get('/api/students/student-score', async (req, res) => {
    const subTopic = req.headers.sub_topic;
    const course = req.headers.course;
    const email = req.headers.email;
  
  
    db.query('SELECT * FROM Percentage WHERE course = ? AND email = ? AND subTopic = ?', [course, email, subTopic], async (err, score) => {
      if (score.length > 0) {
        return res.json({ message: `${score[0].score}` });
  
      } else {
        return res.json({ message: `0` });
  
      }
    })
  })



module.exports = router;
