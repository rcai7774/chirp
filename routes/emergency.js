
router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
db.query(
`SELECT * FROM Users WHERE LOWER(username) = LOWER(${db.escape(
req.body.username
)});`,
(err, result) => {
if (result.length) {
return res.status(409).send({
msg: 'This username is already in use!'
});
} else {
// username is available
bcrypt.hash(req.body.password, 10, (err, hash) => {
if (err) {
return res.status(500).send({
msg: err
});
} else {
// has hashed pw => add to database
db.query(
`INSERT INTO Users (id, username, password, registered) VALUES ('${req.body.email}', ${db.escape(
req.body.username
)}, ${db.escape(hash)}, now())`,
(err, result) => {
if (err) {
throw err;
return res.status(400).send({
msg: err
});
}
return res.status(201).send({
msg: 'Registered!'
});
});
}
});
}
});
});
