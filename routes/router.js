const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const db = require("../lib/db.js");
const userMiddleware = require("../middleware/users.js");

router.post("/sign-up", userMiddleware.validateRegister, (req, res, next) => {
    console.log(req.body);
    console.log("trying to sign up");
    console.log("req.body.email:" + db.escape(req.body.email));
    console.log("req.body.password:" + db.escape(req.body.password));
    db.query(`SELECT * FROM Users WHERE LOWER(id) = LOWER(${db.escape(req.body.email)});`, (err, result) => {
        if (result.length > 0) {
            console.log("409");
            console.log(result);
            return res.status(409).send({
                msg: "This email is already in use!",
            });
        } else {
            // username is available
            console.log("entering bcrypt");
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    console.log(err);
                    console.log(db.escape(hash));
                    return res.status(500).send({
                        msg: err,
                    });
                } else {
                    // has hashed pw => add to database
                    db.query(`INSERT INTO Users (id, username, password, registered) VALUES ('${req.body.email}', ${db.escape(req.body.username)}, ${db.escape(hash)}, now())`, (err, result) => {
                        if (err) {
                            throw err;
                            console.log(err);
                            console.log(hash);
                            return res.status(400).send({
                                msg: err,
                            });
                        }
                        console.log("reached here");
                        return res.status(201).send({
                            msg: "Registered!",
                        });
                    });
                }
            });
        }
    });
});

router.post("/login", (req, res, next) => {
    db.query(`SELECT * FROM Users WHERE username = ${db.escape(req.body.username)};`, (err, result) => {
        // user does not exists
        if (err) {
            throw err;
            return res.status(400).send({
                msg: err,
            });
        }
        if (!result.length) {
            return res.status(401).send({
                msg: "Username or password is incorrect!",
            });
        }
        // check password
        bcrypt.compare(req.body.password, result[0]["password"], (bErr, bResult) => {
            // wrong password
            if (bErr) {
                throw bErr;
                return res.status(401).send({
                    msg: "Username or password is incorrect!",
                });
            }
            if (bResult) {
                const token = jwt.sign(
                    {
                        username: result[0].username,
                        userId: result[0].id,
                    },
                    "SECRETKEY",
                    {
                        expiresIn: "7d",
                    }
                );
                db.query(`UPDATE Users SET last_login = now() WHERE id = '${result[0].id}'`);
                return res.status(200).send({
                    msg: "Logged in!",
                    token: token,
                    user: result[0],
                });
            }
            return res.status(401).send({
                msg: "Username or password is incorrect!",
            });
        });
    });
});

router.get("/secret-route", userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData);
    res.send("This is the secret content. Only logged in users can see that!");
});

router.post("/post-message", userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData.username);
    console.log(req.body.message);
    db.query(`INSERT INTO Messages (author, authorid, message, posted_at) VALUES ('${req.userData.username}', '${req.userData.userId}', ${db.escape(req.body.message)}, now())`, (err, result) => {
        if (err) {
            throw err;
            return res.status(400).send({
                msg: err,
            });
        }
        return res.status(201).send({
            msg: "Sent!",
        });
    });
});

router.post("/like-message", userMiddleware.isLoggedIn, (req, res, next) => {
    console.log("entering here");

    console.log("data: " + req.userData.userId);

    db.query(`SELECT * FROM user_likes WHERE userid = '${req.userData.userId}' AND messageid = ${req.body.id}`, (err, result) => {
        console.log("Select query done");
        if (err) {
            console.log("Error: " + err);
            throw err;
        }
        if (result.length == 0) {
            console.log("User has not liked message before");
            db.query(`UPDATE Messages SET post_likes = post_likes + 1 WHERE id = ${req.body.id}`,
(err, result) => {
if (err) {
throw err;
return res.status(400).send({
msg: err
});
}
return res.status(202).send({
msg: 'Liked!'
});
}
);

            db.query(`INSERT INTO user_likes (userid, messageid, liked_time) VALUES ('${req.userData.userId}',${req.body.id},now())`);
        } else {
            console.log("User has already liked message.");
        }
    });
});

router.post("/follow-user", userMiddleware.isLoggedIn, (req, res, next) => {
	console.log("Entered the follow router");
	console.log("userId: " + req.userData.userId + " authorId: " + req.body.followed);

	if(req.userData.userId === req.body.followed){
			return res.status(400).send({
			msg: 'You cannot follow yourself!'
		})
	}else{
		db.query(
		`INSERT INTO User_follows (followerId, followedId) VALUES ('${req.userData.userId}', '${req.body.followed}')`, (err, result) => {
			if(err) {
				//throw err;
				return res.status(400).send({
					msg: err
				});
			}
			console.log(result)
			return res.status(201).send({
				msg: 'Now following ' + req.body.followed + '!'
			});
		}
		)
		
	}

})

router.get("/get-messages", userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData);
    db.query(`SELECT * FROM Messages WHERE Messages.authorid IN (SELECT followedId FROM User_follows WHERE followerId = '${req.userData.userId}') OR Messages.authorid = '${req.userData.userId}' ORDER BY Messages.posted_at DESC`, (err, result) => {
        if (err) {
            throw err;
						console.log(err)
        }
      //  console.log(result);
        res.json(result);
    });
});

module.exports = router;
