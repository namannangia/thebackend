// server.js
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3001;
app.use(express.json());
const Schema = mongoose.Schema;
var randomstring = require("randomstring");
const studentSchema = new Schema({
    Name: String,
    EnrNum: String,
    email: String,
    pass: String,
    classes_joined: Array,
    attendance: Array,
});

const teacherSchema = new Schema({
    Name: String,
    Emp_Code: String,
    email: String,
    pass: String,
    classes_created: Array,
});

const lectureSchema = new Schema({
    class_code: String,
    date: Date,
    Presentees: Array,
});

const classSchema = new Schema({
    Class_code: String,
    totalStudents: Array,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    Class_description: String,
    Class_title: String,
    lectures: Array,
});

const Student = mongoose.model("Student", studentSchema, "Student");
const Teacher = mongoose.model("Teacher", teacherSchema, "Teacher");
const Class = mongoose.model("Class", classSchema, "Class");
const Lecture = mongoose.model("Lecture", lectureSchema, "Lecture");

// mongoose.connect("mongodb://localhost:27017/theproject");
mongoose.connect(
    "mongodb+srv://root:toor@cluster0.tlm8leb.mongodb.net/thedatabase?retryWrites=true&w=majority"
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
    console.log("Connected to MongoDB");
});

// Define your routes and APIs here
app.post("/stulogin", async (req, res) => {
    const student = await Student.findOne({
        email: req.body.email,
        pass: req.body.password,
    });
    if (student) {
        console.log("Matching record found. Sending", student);
        res.json({ id: student });
    } else {
        console.log("No matching record found.", req.body, student);
        res.json({ id: "" });
    }
});

app.post("/getAttendance/:uid", async (req, res) => {
    console.log("Get classes requested", req.params.uid);
    const n_classes = await Student.findById({
        _id: req.params.uid,
    });
    if (n_classes) {
        ans = {
            class: [],
            lectures: [],
            attendance: [],
        };
        console.log(n_classes.classes_joined);
        for (x of n_classes.classes_joined) {
            const ith_class = await Class.findById({
                _id: x,
            });
            if (ith_class) {
                console.log(ith_class.Class_title);
                ans["class"].push(ith_class.Class_title);
                ans["lectures"].push(ith_class.lectures.length);
                var k = 0;
                for (z of ith_class.lectures) {
                    const ith_lecture = await Lecture.findById({
                        _id: z,
                    });
                    if (ith_lecture) {
                        for (p of ith_lecture.Presentees) {
                            if (p.toString() === req.params.uid) k += 1;
                        }
                    }
                }
                ans["attendance"].push(k);
            } else console.log(x, "nothing matched");
        }
        res.json({ resp: "ok", payload: ans });
    } else {
        console.log("No matching record found (teacher)", req.body);
        res.json({ id: "" });
    }
});

app.post("/getClasses/:uid", async (req, res) => {
    console.log("Get classes requested", req.params.uid);
    const n_classes = await Teacher.findById({
        _id: req.params.uid,
    });
    if (n_classes) {
        soln = [];
        for (x of n_classes.classes_created) {
            const ith_class = await Class.findById({ _id: x });
            if (ith_class) {
                soln.push(ith_class);
            }
        }
        res.json({ resp: "ok", payload: soln });
    } else {
        console.log("No matching record found (teacher)", req.body);
        res.json({ id: "" });
    }
});

app.post("/tealogin", async (req, res) => {
    const student = await Teacher.findOne({
        email: req.body.email,
        pass: req.body.password,
    });
    if (student) {
        console.log("Matching record found(teacher). Sending", student);
        res.json({ id: student });
    } else {
        console.log("No matching record found (teacher)", req.body);
        res.json({ id: "" });
    }
});

app.post("/createClass/:uid", async (req, res) => {
    console.log("Creating class for:", req.params.uid);
    const inst = new Class({
        Class_title: req.body.title,
        Class_description: req.body.description,
        totalStudents: [],
        lectures: [],
        created_by: req.params.uid,
        Class_code: randomstring.generate(5),
    });
    inst.save().then((doc) => {
        console.log(doc);
        res.json({ resp: "ok", payload: doc });
    });
});

app.get("/getOne/:uid", async (req, res) => {
    console.log("GetOne requested", req.params.uid);
    var student = await Student.findById({
        _id: req.params.uid,
    });
    if (!student) student = await Teacher.findById({ _id: req.params.uid });
    res.json({ resp: "ok", payload: student });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
