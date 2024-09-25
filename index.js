// SA14010001 - JanakiRam@2809

////////////////////////// IMPORT REQUIRED MODULES //////////////////////////
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";

////////////////// SERVER, PORT, SALTING ROUNDS, SESSION INTIALIZATION ////////////////////
const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    maxAge:1000 * 60 * 60 *10,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

//////////////////////// DATABASE CONNECTION ///////////////////////////
const databases = [
  {
    database: "LoginRegister",
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT 
  },
  {
    database: "Attendance",
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT 
  },
  {
    database: "ExamMarks",
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT 
  },
  {
    database: "FeeDetails",
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT 
  }
];

// MAP REQUIRED DATABSAE
const dbConnections = databases.map(dbConfig => {
  const db = new pg.Client(dbConfig);
  db.connect();
  return db;
});

////////////////////// GET & RENDER THE REQUIRED PAGES ///////////////////////

// HOME PAGE 
app.get("/", (req,res) =>{
    res.render("index.ejs");
});

// ABOUT US
app.get("/about", (req,res) =>{
    res.render("About.ejs");
});

// CONTACT PAGE
app.get("/contact", (req,res) =>{
    res.render("Contact.ejs");
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// REGISTER PAGE
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// RESET PASSWORD
app.get("/Resetpassword", (req, res) => {
  res.render("ResetPassword.ejs");
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// student profile page
app.get("/student", async (req, res) => {
  if (req.isAuthenticated()) {
    const table_name = `student_class_${parseInt(req.user.slice(6,8))}`;
    const student = await dbConnections[0].query(`SELECT * FROM ${table_name} WHERE student_id = $1`,[req.user]);
    res.render("student.ejs", { Details:student.rows[0] });
  } else {
    res.redirect("/login");
  }
});

// teacher profile page
app.get("/teacher", async (req, res) => {
  if (req.isAuthenticated()) {
    const teacher = await dbConnections[0].query(`SELECT * FROM teachers WHERE teacher_id = $1`,[req.user]); // Store teacher details in request object   
    res.render("teacher.ejs", { Details: teacher.rows[0]});
  } else {
    res.redirect("/login");
  }
});

// management profile page
app.get("/management", async (req, res) => {
  if (req.isAuthenticated()) {
    const management = await dbConnections[0].query(`SELECT * FROM management WHERE management_id = $1`,[req.user]);
    res.render("management.ejs", { Details: management.rows[0] });
  } else {
    res.redirect("/login");
  }
});

app.get("/student_details", async (req, res) => {
  let table;
  const classNumber = req.query['class'];
  table = `student_class_${classNumber}`;
  const result = await dbConnections[0].query(`SELECT student_id, DOB, gender, class_number, firstname, middle_lastname, fathername, mothername, address, email, tel_num FROM ${table} ORDER BY student_id`);
  res.render("student_details.ejs", {details: result.rows});
});

app.get("/teacher_details", async (req, res) => {
  const result = await dbConnections[0].query(`SELECT teacher_id, DOB, class_number, firstname, middle_lastname, fathername, mothername, address, email, tel_num FROM teachers ORDER BY teacher_id`);
  res.render("teacher_details.ejs", {details: result.rows});
});

app.get("/doudt", (req, res) => {

  res.render("doudt.ejs");
});

app.get("/fee", (req, res) => {

  res.render("fee.ejs");
});



app.get("/table", (req, res) => {
  
  res.render("table.ejs");
});
app.get("/table1", (req, res) => {
  
  res.render("table1.ejs");
});


////////////////////////// ATTENDANCE //////////////////////////////////////////

// student attendance
app.get("/student_attendance", async (req,res) => {
  if(req.isAuthenticated()){
    const student_attendance = await dbConnections[1].query(`SELECT * from class_${parseInt(req.user.slice(6,8))} where student_id = $1`,[req.user]);
    res.render("attendance.ejs", {attendance: student_attendance.rows[0]});
  }else{
    res.redirect("/login");
  }
});

// to view the students attendance of selected class
// to view the students attendance of selected class
app.get("/class_attendance", async (req,res) => {
  if(req.isAuthenticated()){
    let table;
    let person;
    const classNumber = req.query['class'];
    if(classNumber){
      table=classNumber;
      person = "management";
    }
    else{
      table=parseInt(req.user.slice(6,8));
      person = "teacher";
    }
    const class_attendance = await dbConnections[1].query(`select * from class_${table} ORDER BY student_id`);
    res.render("view_attendance.ejs",{class_attendance:class_attendance.rows, role : person});
  }else{
    res.redirect("/login");
  }
});


// to edit the students attendance of selected class 
// only class teacher have access to edit attendance
app.get("/edit_class_attendance", async (req, res)=>{
  if(req.isAuthenticated()){
    const table = `class_${parseInt(req.user.slice(6,8))}`;
    const result = await dbConnections[1].query(`SELECT * FROM ${table}`);
    res.render("edit_attendance.ejs",{student_info : result.rows});
  }else{
    res.redirect("/login");
  }
});

// add attendance
app.post("/add_attendance", async (req, res) => {
  if (req.isAuthenticated()) {
      const table = `class_${parseInt(req.user.slice(6, 8))}`;
      const prevAtt = await dbConnections[1].query(`SELECT telugu, hindi, english, workingdays FROM ${table}`);
      const att = prevAtt.rows;
      for (let i = 0; i < att.length; i++) {
          const teluguInput = parseInt(req.body[`tel_${i}`]) || 0;
          const hindiInput = parseInt(req.body[`hin_${i}`]) || 0;
          const englishInput = parseInt(req.body[`eng_${i}`]) || 0;
          const ID = req.body[`student_id_${i}`];
          
          const telugu = att[i].telugu + teluguInput;
          const hindi = att[i].hindi + hindiInput;
          const english = att[i].english + englishInput;
          const workingdays = att[i].workingdays + 1;
          
          await dbConnections[1].query(
              `UPDATE ${table} SET telugu = $1, hindi = $2, english = $3, workingdays = $4 where student_id = $5`,
              [telugu, hindi, english, workingdays, ID]
          );
      }
      res.redirect("/teacher");
  } else {
      res.redirect("/login");
  }
});


// edit single student attendance
app.get("/edit_student_attendance", async (req, res) =>{
  if(req.isAuthenticated()){
    res.render("edit_studentAttendance.ejs");
  }else{
    res.redirect("/login");
  }
});

app.post("/student_attendance", async (req, res) =>{
if (req.isAuthenticated()) {
  const table = `class_${parseInt(req.user.slice(6, 8))}`;
  const teluguInput = parseInt(req.body[`tel`]) || 0;
  const hindiInput = parseInt(req.body[`hin`]) || 0;
  const englishInput = parseInt(req.body[`eng`]) || 0;
  const ID = req.body[`student_id`];
  const prevAtt = await dbConnections[1].query(`SELECT telugu, hindi, english, workingdays FROM ${table} where student_id = $1`,[ID]);
  const att = prevAtt.rows[0];
      const telugu = parseInt(att.telugu) + teluguInput;
      const hindi = parseInt(att.hindi) + hindiInput;
      const english = parseInt(att.english) + englishInput;
      await dbConnections[1].query(
          `UPDATE ${table} SET telugu = $1, hindi = $2, english = $3 where student_id = $4`,
          [parseInt(telugu), parseInt(hindi), parseInt(english), ID]
      );
  res.redirect("/teacher");
} else {
  res.redirect("/login");
}
});

//////////////////////// END OF ATTENDANCE CODE /////////////////////////////////////


/////////////////////// EXAM MARKS //////////////////////////////////////////

app.get("/edit_finalTest_Marks", async (req, res)=>{
  if(req.isAuthenticated()){
    const table = `class_${parseInt(req.user.slice(6,8))}`;
    const result = await dbConnections[2].query(`SELECT student_id, student_name FROM ${table}  ORDER BY student_id;`);
    res.render("edit_FinalMarks.ejs",{student_finalExam : result.rows});
  }else{
    res.redirect("/login");
  }
});

app.get("/edit_unitTest_Marks", async (req, res)=>{
  if(req.isAuthenticated()){
    const table = `class_${parseInt(req.user.slice(6,8))}`;
    const result = await dbConnections[2].query(`SELECT student_id, student_name FROM ${table} ORDER BY student_id;`);
    res.render("edit_UnitMarks.ejs",{student_unitExam : result.rows});
  }else{
    res.redirect("/login");
  }
});

app.post("/add_finalTest_Marks", async (req, res) => {
  if (req.isAuthenticated()) {
    const table = `class_${parseInt(req.user.slice(6, 8))}`;
    const prevMarks = await dbConnections[2].query(`SELECT telugu_finaltest, hindi_finaltest, english_finaltest FROM ${table}`);
    const Marks = prevMarks.rows;
    for (let i = 0; i < Marks.length; i++) {
        const teluguMarks = parseInt(req.body[`tel_${i}`]) || 0;
        const hindiMarks = parseInt(req.body[`hin_${i}`]) || 0;
        const englishMarks = parseInt(req.body[`eng_${i}`]) || 0;
        const ID = req.body[`student_id_${i}`];
        
        await dbConnections[2].query(
            `UPDATE ${table} SET telugu_finaltest = $1, hindi_finaltest = $2, english_finaltest = $3 where student_id = $4`,
            [teluguMarks, hindiMarks, englishMarks, ID]
        );
    }
    res.redirect("/teacher");
  } else {
    res.redirect("/login");
  }
});

app.post("/add_unitTest_Marks", async (req, res) => {
  if (req.isAuthenticated()) {
    const table = `class_${parseInt(req.user.slice(6, 8))}`;
    const prevMarks = await dbConnections[2].query(`SELECT telugu_unittest, hindi_unittest, english_unittest FROM ${table}`);
    const Marks = prevMarks.rows;
    for (let i = 0; i < Marks.length; i++) {
        const teluguMarks = parseInt(req.body[`tel_${i}`]) || 0;
        const hindiMarks = parseInt(req.body[`hin_${i}`]) || 0;
        const englishMarks = parseInt(req.body[`eng_${i}`]) || 0;
        const ID = req.body[`student_id_${i}`];
        
        await dbConnections[2].query(
            `UPDATE ${table} SET telugu_unittest = $1, hindi_unittest = $2, english_unittest = $3 where student_id = $4`,
            [teluguMarks, hindiMarks, englishMarks, ID]
        );
    }
    res.redirect("/teacher");
} else {
    res.redirect("/login");
}
});

app.get("/view_classTest_Marks", async (req, res) => {
  if(req.isAuthenticated()){
    let table;
    let person;
    const classNumber = req.query['class'];
    if(classNumber){
      table=classNumber;
      person="management";
    }
    else{
      table=parseInt(req.user.slice(6,8));
      person="teacher";
    }
    const class_Marks = await dbConnections[2].query(`select * from class_${table} ORDER BY student_id;`);
    res.render("view_classMarks.ejs",{class_marks:class_Marks.rows, role:person});
  }else{
    res.redirect("/login");
  }
  
});


app.get("/view_studentTest_Marks", async (req, res) => {
  if(req.isAuthenticated()){
    const table = `class_${parseInt(req.user.slice(6,8))}`;
    const result = await dbConnections[2].query(`SELECT * FROM ${table} WHERE student_id = $1`, [req.user]);
    res.render("view_studentMarks.ejs", {student_marks : result.rows[0]});
  }else{
    res.redirect("/login");
  }
});


// edit single student marks
app.get("/edit_student_UnitMarks", async (req, res) =>{
  if(req.isAuthenticated()){
    res.render("edit_studentUnitTest.ejs");
  }else{
    res.redirect("/login");
  }
});

app.post("/student_unitTest_Marks", async (req, res)=>{
  if (req.isAuthenticated()) {
    const table = `class_${parseInt(req.user.slice(6, 8))}`;
        const teluguMarks = parseInt(req.body[`tel`]);
        const hindiMarks = parseInt(req.body[`hin`]);
        const englishMarks = parseInt(req.body[`eng`]);
        const ID = req.body[`student_id`];
        await dbConnections[2].query(
            `UPDATE ${table} SET telugu_unittest = $1, hindi_unittest = $2, english_unittest = $3 where student_id = $4`,
            [teluguMarks, hindiMarks, englishMarks, ID]
        );
    res.redirect("/teacher");
} else {
    res.redirect("/login");
}
});

app.get("/edit_student_FinalMarks", async (req, res) =>{
  if(req.isAuthenticated()){
    res.render("edit_studentFinalTest.ejs");
  }else{
    res.redirect("/login");
  }
});

app.post("/student_finalTest_Marks", async (req, res)=>{
  if (req.isAuthenticated()) {
        const table = `class_${parseInt(req.user.slice(6, 8))}`;
        const teluguMarks = parseInt(req.body[`tel`]);
        const hindiMarks = parseInt(req.body[`hin`]);
        const englishMarks = parseInt(req.body[`eng`]);
        const ID = req.body[`student_id`];
        await dbConnections[2].query(
            `UPDATE ${table} SET telugu_finaltest = $1, hindi_finaltest = $2, english_finaltest = $3 where student_id = $4`,
            [teluguMarks, hindiMarks, englishMarks, ID]
        );
        res.redirect("/teacher");
    }
  else {
    res.redirect("/login");
  }
});


/////////////////////// END OF EXAM MARKS CODE //////////////////////////////

////////////////////////// FEE PAYMENT (edited total) //////////////////////////

app.get("/student_fee", async (req, res) =>{
  if(req.isAuthenticated()){
     const ID = req.user;
     const table = `class_${parseInt(ID.slice(6,8))}`;
     const result = await dbConnections[3].query(`SELECT * from ${table} where student_id = $1`,[ID]);
    //  console.log(result.rows);
     res.render("student_fee.ejs",{fee_details : result.rows[0]});
  } else{
    res.redirect("/login");
  }
});

app.get("/student_fee_details", async (req, res) =>{
if(req.isAuthenticated()){
  const classNumber = req.query['class'];
  const class_Fee = await dbConnections[3].query(`select * from class_${classNumber} ORDER BY student_id;`);
  res.render("view_classFee.ejs",{class_FeeDetails:class_Fee.rows});
} else{
 res.redirect("/login");
}
});

app.get("/pay_Fee", async (req, res) => {
if(req.isAuthenticated()){
  res.render("deduct_fee.ejs");
} else {
  res.redirect("/login");
}
});

app.post("/detect_fee", async (req, res) => {
const ID = req.body.student_id;
const table = `class_${parseInt(ID.slice(6,8))}`;
let fee_details = await dbConnections[3].query(`SELECT * FROM ${table} WHERE student_id=$1`,[ID]);
// console.log(fee_details.rows[0].tution_fee);
let fee = fee_details.rows[0].tution_fee - req.body.student_fee;
if(fee >= 0){
  await dbConnections[3].query(
    `UPDATE ${table} SET tution_fee = $1 where student_id = $2`,
    [fee, ID]);
}
res.redirect("/management");
});


///////////////////////// FEE PAYMENT //////////////////////////

////////////////// REGISTER USER (CREATE NEW USER ACCOUNT) /////////////////////////
app.post("/register", async (req, res) => {
  const ID = req.body.id;
  const date = req.body.dob;
  const gender = req.body.gender;
  const firstname = req.body.firstname;
  const lastname = req.body.middle_lastname;
  const student_name = firstname+" "+lastname;
  const fathername = req.body.fathername;
  const mothername = req.body.mothername;
  const address = req.body.address;
  const email = req.body.email;
  const tel_num = req.body.tel_num;
  const password = req.body.password;
  const key = ID.slice(2,4);
  const class_number = parseInt(ID.slice(6,8));
  const table_name = `student_class_${class_number}`;
  const table = `class_${class_number}`;
  switch (key) {
    case "39":
      try {
        const checkResult = await dbConnections[0].query(`SELECT * FROM ${table_name} WHERE student_id = $1`, [
          ID
        ]);
    
        if (checkResult.rows.length > 0) {
          res.send("User already exists. Try logging in.");
        } else {
          bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
              console.error("Error hashing password:", err);
            } else {
              const result = await dbConnections[0].query( // student_details
                `INSERT INTO ${table_name} (student_id, dob, gender, firstName, middle_lastName, class_number, fathername, mothername, address, email, tel_num, login_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11, $12)  RETURNING *`,
                [ID, date, gender, firstname, lastname, class_number, fathername, mothername, address, email, tel_num, hash]
              );
               await dbConnections[1].query( // attendance database
                `INSERT INTO ${table} (student_id, student_name, telugu, hindi, english, workingdays) VALUES ($1, $2, $3, $4, $5, $6)`,
                [ID, student_name, 0, 0, 0, 0]
              );

               await dbConnections[2].query( // exam marks database
                `INSERT INTO ${table} (student_id,student_name, telugu_finaltest, hindi_finaltest, english_finaltest, telugu_unittest, hindi_unittest, english_unittest) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [ID, student_name, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ]
              );

               await dbConnections[3].query( // fee database
                `INSERT INTO ${table} (student_id,student_name, tution_fee) VALUES ($1, $2, $3)`,
                [ID, student_name, (500.0 * class_number) ]
              );

              const user = result.rows[0];
              req.login(user, (err) => {
                res.redirect("/login");
              });
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
      break;
      case "25":
        try {
          const checkResult = await dbConnections[0].query(`SELECT * FROM teachers WHERE teacher_id = $1`, [
            ID
          ]);
      
          if (checkResult.rows.length > 0) {
            res.send("User already exists. Try logging in.");
          } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
              if (err) {
                console.error("Error hashing password:", err);
              } else {
                const result = await dbConnections[0].query(
                  `INSERT INTO teachers (teacher_id, dob, gender, firstName, middle_lastName, class_number, fathername, mothername, address, email, tel_num, login_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11, $12)  RETURNING *`,
                  [ID, date, gender, firstname, lastname, class_number, fathername, mothername, address, email, tel_num, hash]
                );
                const user = result.rows[0];
                req.login(user, (err) => {
                  res.redirect("/login");
                });
              }
            });
          }
        } catch (err) {
          console.log(err);
        }
        break;
      case "14":
        try {
          const checkResult = await dbConnections[0].query(`SELECT * FROM management WHERE management_id = $1`, [
            ID
          ]);
      
          if (checkResult.rows.length > 0) {
            res.send("User already exists. Try logging in.");
          } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
              if (err) {
                console.error("Error hashing password:", err);
              } else {
                const result = await dbConnections[0].query(
                  `INSERT INTO management (management_id, dob, gender, firstName, middle_lastName, fathername, mothername, address, email, tel_num, login_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9, $10, $11)  RETURNING *`,
                  [ID, date, gender, firstname, lastname, fathername, mothername, address, email, tel_num, hash]
                );
                const user = result.rows[0];
                req.login(user, (err) => {
                  res.redirect("/login");
                });
              }
            });
          }
        } catch (err) {
          console.log(err);
        }
        break;
    default:
      res.send("User unable to register. Please enter valid ID");
      break;
  }
});

////////////////// LOGIN USER ////////////////////////////////
app.post(
  "/login",
  passport.authenticate("local"),
  async (req, res) => {
    // Extract user ID from authenticated user's details
    const ID= req.user.slice(2,4);
    // Switch statement to redirect users based on their user ID
    switch(ID) {
      case "39":
        res.redirect("/student");
        break;
      case "25":
        res.redirect("/teacher");
        break;
      case "14":
        res.redirect("/management");
        break;
      default:
        res.redirect("/"); // Redirect to homepage or any other default route
    }
  }
);

///////////////////// LOCAL STRATEGY CODE //////////////////////////
passport.use(
  new Strategy(async function verify(username, password, cb) {
      const key = username.slice(2,4);
      var userID = "";
      switch(key){
        case "39":
          try {
            const table_name = `student_class_${parseInt(username.slice(6,8))}`;
            const result = await dbConnections[0].query(`SELECT * FROM ${table_name} WHERE student_id = $1`,[username]);
            if (result.rows.length > 0) {
              const user = result.rows[0];
              const storedHashedPassword = user.login_key;
              bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                if (err) {
                  //Error with password check
                  console.error("Error comparing passwords:", err);
                  return cb(err);
                } else {
                  if (valid) {
                    //Passed password check
                    userID = user.student_id;
                    return cb(null, userID);
                  } else {
                    //Did not pass password check
                    return cb(null, false);
                  }
                }
              });
            } else {
              return cb("User not found");
            }
          } catch (err) {
            console.log(err);
          }
          break;
        case "25":
          try {
            const result = await dbConnections[0].query("SELECT * FROM teachers WHERE teacher_id = $1", [
              username,
            ]);
            if (result.rows.length > 0) {
              const user = result.rows[0];
              const storedHashedPassword = user.login_key;
              bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                if (err) {
                  //Error with password check
                  console.error("Error comparing passwords:", err);
                  return cb(err);
                } else {
                  if (valid) {
                    //Passed password check
                    userID = user.teacher_id;
                    return cb(null, userID);
                  } else {
                    //Did not pass password check
                    return cb(null, false);
                  }
                }
              });
            } else {
              return cb("User not found");
            }
          } catch (err) {
            console.log(err);
          }
          break;
        case "14":
          try {
            const result = await dbConnections[0].query("SELECT * FROM management WHERE management_id = $1", [
              username,
            ]);
            if (result.rows.length > 0) {
              const user = result.rows[0];
              const storedHashedPassword = user.login_key;
              bcrypt.compare(password, storedHashedPassword, (err, valid) => {
                if (err) {
                  //Error with password check
                  console.error("Error comparing passwords:", err);
                  return cb(err);
                } else {
                  if (valid) {
                    //Passed password check
                    userID = user.management_id;
                    return cb(null, userID);
                  } else {
                    //Did not pass password check
                    return cb(null, false);
                  }
                }
              });
            } else {
              return cb("User not found");
            }
          } catch (err) {
            console.log(err);
          }
          break;
        default:
          
        break;
      }
  })
);


passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

///////////////////// END OF PASSPORT SESSION CODE //////////////////////////

///////////////////////// RESET PASSWORD /////////////////////////////////////
app.post("/reset", async (req, res) => {
  const id = req.body.username;
  const newPassword = req.body.newpassword;
  const conformPassword = req.body.conformpassword;
  const key = id.slice(2,4);
  const table_name = `student_class_${id.slice(6,8)}`;
  switch (key) {
    case "39":
      const result = await dbConnections[0].query(`SELECT * FROM ${table_name} WHERE Student_id = $1`, [id]);
      if(result.rows.length > 0) {
        try {
          if(newPassword === conformPassword){
            bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
              if (err) {
                console.error("Error hashing password:", err);
              } else {
                await dbConnections[0].query(`UPDATE ${table_name} SET login_key = $1 WHERE student_id = $2`, [hash, id]);
                res.render("login.ejs");
              }
            });
          }

          else{
            res.render("ResetPassword.ejs")
          }
        } catch (error) {
          console.log(error);
        }
  }
  else{
    res.send("No user found with entered ID");
  }      
      break;
    case "25":
      result = await dbConnections[0].query("SELECT * FROM teachers WHERE teacher_id = $1", [id]);
    if(result.rows.length > 0) {
  try {
    if(newPassword === conformPassword){
      bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          await dbConnections[0].query("UPDATE teachers SET login_key = $1 WHERE teacher_id = $2", [hash, id]);
      res.render("login.ejs");
        }
      });
    }
    else{
      res.render("ResetPassword.ejs");
    }
  } catch (error) {
    console.log(error);
  }
}
else{
  res.send("No user found with entered ID");
}
    break;
    case "14":
      result = await dbConnections[0].query("SELECT * FROM management WHERE teacher_id = $1", [id]);
    if(result.rows.length > 0) {
  try {
    if(newPassword === conformPassword){
      bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          await dbConnections[0].query("UPDATE management SET login_key = $1 WHERE teacher_id = $2", [hash, id]);
          res.render("login.ejs");
        }
      });
    }
    else{
      res.render("ResetPassword.ejs");
    }
  } catch (error) {
    console.log(error);
  }
}
else{
  res.send("No user found with entered ID");
}
      break;
    default:
      res.send("Invalid ID");
      break;
  }
  
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});