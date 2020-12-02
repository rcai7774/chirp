const express = require("express");

const bodyParser = require("body-parser");

const app = express();

const sha1 = require("sha1");

const sendMail = require("./lib/sendmail.js");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
//we will send the new user a link to the signup form!!!!!!!! (at least that's our intention...)

app.get("/verify/:email", (req, res) => {
    let email = req.params.email;
    sendMail(email);
    console.log(email);
    //res.json({ success: email });
		//res.redirect("");
		res.sendFile(__dirname + "/public/emailverify.html");
});
// recieve email, form a link, send email to user with link, return to user

const cors = require("cors");
// set up port
const PORT = 3000;
app.use(bodyParser.json());
app.use(cors());
// add routes
const router = require("./routes/router.js");
app.use("/api", router);
// run server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
