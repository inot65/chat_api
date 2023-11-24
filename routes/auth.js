const router = require('express').Router();
const {json} = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// login
router.post('/login', async (req, res) => {
  try {
    // find user
    const user = await User.findOne({email: req.body.email});

    // daca nu gasesc userul, da eroare
    if (!user) {
      res.status(404).json('Credentiale gresite!');
    } else {
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (validPassword === false) {
        res.status(400).json('Credentiale incorecte!');
      } else {
        const {password, ...other} = user._doc;
        res.status(200).json(other);
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// register
router.post('/register', async (req, res) => {
  try {
    // generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // parola ce va fi salvata pt noul user este hashedPassword
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // save user and respond
    const savedUser = await newUser.save();
    res.status(200).json({_id: savedUser._id, username: savedUser.username});
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
