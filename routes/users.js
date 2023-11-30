const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

//update user
router.put('/:id', async (req, res) => {
  // verific daca este admin
  // sau este acelasi user care doreste sa-si modifice
  // datele proprii

  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      console.log('Actualizare parola...');
      try {
        // daca userul vrea o noua parola
        // generate new password
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        {new: true}
      );
      res.status(200).json(user);
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json('Poti actualiza doar propriul cont!');
  }
});

// delete user
router.delete('/:id', async (req, res) => {
  // verific daca este admin
  // sau este acelasi user care doreste sa-si stearga contul
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json('Account has been deleted!');
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json('Poti sterge doar propriul cont!');
  }
});

// get a user
// pentru genul de interogare :
// users?userId=423534532626235
// sau
// users?username=john
router.get('/', async (req, res) => {
  // foloseste un query
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({username: username});
    if (!user) {
      res.status(404).json('Nu gasesc acest user!');
    } else {
      const {password, ...other} = user._doc;
      res.status(200).json(other);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

//
// get all followings = prieteni
//
router.get('/friends/:userId', async (req, res) => {
  // foloseste un query
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json('Nu gasesc acest user!');
    } else {
      const friends = await Promise.all(
        user.followings.map((friendId) => {
          const friend = User.findById(friendId);
          if (friend) {
            return friend;
          } else {
            return false;
          }
        })
      );

      let friendsList = [];

      friends.map((friend) => {
        const {_id, username, profilePicture} = friend;
        friendsList.push({_id, username, profilePicture});
      });

      res.status(200).json(friendsList);
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// follow a user
router.put('/:id/follow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        // actualizez lista "urmaritorilor" pt user
        await user.updateOne({$push: {followers: req.body.userId}});
        await currentUser.updateOne({$push: {followings: req.params.id}});
        res.status(200).json('User has been followed!');
      } else {
        return res.status(403).json('You already follow this user!');
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json("You can't follow yourself!");
  }
});

// unfollow a user
router.put('/:id/unfollow', async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        // actualizez lista "urmaritorilor" pt user
        await user.updateOne({$pull: {followers: req.body.userId}});
        await currentUser.updateOne({$pull: {followings: req.params.id}});
        res.status(200).json('User has been unfollowed!');
      } else {
        return res.status(403).json('You dont follow this user!');
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } else {
    res.status(403).json("You can't unfollow yourself!");
  }
});

module.exports = router;
