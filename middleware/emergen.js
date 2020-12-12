module.exports = {
validateRegister: (req, res, next) => {
console.log("Enter and validate and register");
// username min length 3
if (!req.body.username || req.body.username.length < 3) {
return res.status(400).send({
msg: 'Please enter a username with minimum of 3 characters'
});
}
// password min 6 chars
if (!req.body.password || req.body.password.length < 6) {
return res.status(400).send({
msg: 'Please enter a password with minimum of 6 characters'
});
}
next();
},

isLoggedIn: (req, res, next) => {
try {
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(
token,
'SECRETKEY'
);
req.userData = decoded;
next();
} catch (err) {
return res.status(401).send({
msg: 'Your session is not valid!'
});
}
}
};