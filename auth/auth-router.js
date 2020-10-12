const router = require('express').Router();
const bcrypt = require('bcryptjs');
const Users = require('../user/users-model');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res) => {
  // implement registration
  let user = req.body;

  const rounds = process.env.BCRYPT_ROUNDS || 10
  const hash = bcrypt.hashSync(user.password, rounds);
  user.password = hash;
  
  Users.add(user)
  .then((saved) => {
    res.status(201).json(saved);
  })
  .catch((error) => {
    res.status(500).json(error.message);
  })
});

router.post('/login', (req, res) => {
  // implement login
  let { username, password } = req.body;

  Users.findBy({ username })
  .first()
  .then((user) => {
    if (user && bcrypt.compareSync(password, user.password)) {

      const token = generateToken(user);

      res.status(200).json({ user, token });
    } else {
      res.status(401).json({ message: "Invalid Credentials" });
    }
  })
  .catch((error) => {
    res.status(500).json(error.message);
  })
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    lat: Date.now()
  }

const secret = process.env.JWT_SECRET || "this is my secret";

const options = {
  expiresIn: "1h"
};

const token = jwt.sign(payload, secret, options);

  return token;

};

module.exports = router;
