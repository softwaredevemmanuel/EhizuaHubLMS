const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const shortid = require('shortid');
const nodemailer = require('nodemailer');
require('dotenv').config();

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< SCHOOL PUPILS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


// .................................SCHOOL PUPIL LOGIN ...........................................
router.post('/login', async (req, res) => {
    const { email, id, selectSchool } = req.body;
    const words = selectSchool.split(' ');
    const school = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  
  
  
    sch.query(`SELECT * FROM ${school} WHERE email = ?`, [email], async (err, result) => {
  
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
  
  
      if (result.length === 0) {
        return res.status(401).json({ message: 'Wrong Email or Password' });
      }
  
  
  
      if (result[0].isVerified === 0) {
        return res.status(400).json({ message: 'Please verify your account.. Or contact Ehizua Hub Admin for assistance' });
      }
  
      if (result[0].emailToken === null && result[0].isVerified === 0) {
        return res.status(404).json("Your account has been suspended. Please contact Ehizua Hub Admin.");
      }
      if (!id === result[0].password) {
        return res.status(404).json({ message: "Wrong Email or Password." });
  
      }
      const name = (`${result[0].firstName} ${result[0].lastName}`);
      const course1 = (result[0].course1);
      const course2 = (result[0].course2);
      const course3 = (result[0].course3);
      const course4 = (result[0].course4);
      const course5 = (result[0].course5);
      const payload = { id: result[0]._id };
      const token = createToken(payload);
      res.json({ token: token, user: name, authHeader: result[0].id, course1: course1, course2: course2, course3: course3, course4: course4, course5: course5 });
  
    });
  });
  
  
  // .................................... PUPILS COURSE CONTENT ...............................
  router.get('/course-content', async (req, res) => {
  
    const { email, school } = req.headers;
    const words = school.split(' ');
    const schoolSelected = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  
    try {
      sch.query(`SELECT * FROM ${schoolSelected} WHERE email = ? AND school = ?`, [email, schoolSelected], async (err, response) => {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }
  
        // if (response[0].emailToken === null && response[0].isVerified === 0) {
        //   return res.status(404).json("Your account has been suspended. Please contact Ehizua Hub Admin.");
        // }
  
  
  
        let course1;
        let course2;
        let course3;
        let course4;
        let course5;
  
        if (response[0].course1) {
          course1 = response[0].course1;
        }
  
        if (response[0].course2) {
          course2 = response[0].course2;
        }
  
        if (response[0].course3) {
          course3 = response[0].course3;
        }
  
        if (response[0].course4) {
          course4 = response[0].course4;
        }
  
        if (response[0].course5) {
          course5 = response[0].course5;
        }
  
  
  
  
  
        sch.query('SELECT * FROM Contents WHERE course1 = ?', [course1], async (err, content1) => {
          sch.query('SELECT * FROM Contents WHERE course2 = ?', [course2], async (err, content2) => {
            sch.query('SELECT * FROM Contents WHERE course3 = ?', [course3], async (err, content3) => {
              sch.query('SELECT * FROM Contents WHERE course4 = ?', [course4], async (err, content4) => {
                sch.query('SELECT * FROM Contents WHERE course5 = ?', [course5], async (err, content5) => {
  
                  return res.status(200).json({ content1, content2, content3, content4, content5 });
                })
              })
            })
          })
        })
      })
  
  
  
    } catch (error) {
      console.error('Error retrieving course content:', error);
      return res.status(500).json({ message: 'An error occurred while retrieving course content' });
    }
  });



module.exports = router;
