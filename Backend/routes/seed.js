const router = require("express").Router();
const { db, sch, stf } = require('../config/db'); // replace 'yourModuleName' with the actual path to the module


router.get('/insert', (req, res) =>{
  db.query('INSERT INTO AdminAuthorizationm SET ?', {
    email:"admin@gmail.com",  
    password :"1234",
  },(err) => {
    if (err) throw new Error(err);
    console.log('1 record inserted');
    res.end();
  })
})




module.exports = router;
