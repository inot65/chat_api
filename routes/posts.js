const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

// create a post
router.post('/', async (req, res) => {
  try {
    const newPost = await new Post(req.body);

    const savedPost = await newPost.save();

    res.status(200).json(savedPost);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      res.status(200).json('Postarea a fost actualizata.');
    } else {
      // nu e propietarul postului, nu-l poate modifica !
      return res.status(403).json('Poti actualiza doar postarea proprie!');
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json('Postarea a fost stearsa.');
    } else {
      // nu e propietarul postului, nu-l poate modifica !
      return res.status(403).json('Poti sterge doar postarea proprie!');
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// like / dislike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({
        $push: {likes: req.body.userId},
      });
      res.status(200).json('Postarea a fost marcata cu like.');
    } else {
      // daca e marcata cu like, o demarchez !
      await post.updateOne({
        $pull: {likes: req.body.userId},
      });
      return res.status(200).json('Postarea nu mai e marcata cu like!');
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

// get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json('Nu gasesc aceasta postare!');
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// get timeline posts
router.get('/timeline/:userId', async (req, res) => {
  let postsArray = [];
  try {
    // gasesc mai intai userul curent
    const currentUser = await User.findById(req.params.userId);

    // gasesc toate postarile acestui user si la introduc in matricea postArray
    const userPosts = await Post.find({userId: currentUser._id});

    //gasesc toate postarile celor din matricea "followings"
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({userId: friendId});
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all posts for username
router.get('/profile/:username', async (req, res) => {
  try {
    // gasesc mai intai userul curent
    const currentUser = await User.findOne({username: req.params.username});

    // gasesc toate postarile acestui user si la introduc in matricea postArray
    const userPosts = await Post.find({userId: currentUser._id});

    // returnez postarile userului
    res.status(200).json(userPosts);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
