const express = require('express');
const app = express();

const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoute = require("./routes/auth");
const seedRoute = require("./routes/seed");
const tutorRoute = require("./routes/tutor");
const studentsRoute = require("./routes/students");
const schoolPupilRoute = require("./routes/pupils");

dotenv.config();
app.use(cors());
app.use(bodyParser.json());



app.use("/api/auth", authRoute);
app.use("/seed", seedRoute);
app.use("/api/students", studentsRoute);
app.use("/api/tutor", tutorRoute);
app.use("/api/school_pupils", schoolPupilRoute);





const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

