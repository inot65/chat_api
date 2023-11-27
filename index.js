const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
// const multer = require('multer');
const path = require('path');
const cors = require('cors');

// defineste rutele
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const conversationsRoutes = require('./routes/conversations');
const messagesRoutes = require('./routes/messages');

// pentru a fi utilizabil pachetul dotenv trebuie configurat
dotenv.config();

// fac aplicatia principala
const app = express();

// permite parsarea lui body din request
app.use(express.json());

// folosesc CORS
app.use(cors());

// setez ceva la MongoDB
// ce fac la conectare/deconectare MongoDB
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB deconectat...');
});
mongoose.connection.on('connected', () => {
  console.log('Conectat la baza de date!');
});

const conectareMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
  } catch (error) {
    console.log(error);
  }
};

// ma conectez la baza de date


// ce face asta ?
// --Explica Bard astfel--
// This line of code tells Express to serve static files from the "public/images" directory.
// The "/images" part of the code tells Express to serve the files from the "/images" URL prefix.
// For example, if you have an image named "image.jpg" in the "public/images" directory,
// you would be able to access it from the URL "/images/image.jpg".

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// aici face middleware-ul //
//=========================//
// foloseste helmet
app.use(helmet());

// foloseste morgan care afiseaza ceva de genul:
// ::1 - - [10/Nov/2023:14:43:54 +0000] "PUT /api/users/654e30cf9aff84c37b757af0/unfollow HTTP/1.1" 403 30
app.use(morgan('common'));

// trebuie sa returnez in frontend numele fisierului incarcat
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/images');
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });

// folosim multer-ul
// const upload = multer({storage});

// definesc un nou nod API pt incarcat fisiere
// important ca numele inputului de fisiere sa fie trecut aici
// in  upload.single(). La noi este "file"
// app.post('/api/upload', upload.single('file'), (req, res) => {
//   try {
//     return res.status(200).json('File uploaded successufully');
//   } catch (error) {
//     console.log(error);
//   }
// });

// defineste rutele folosite
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);


app.listen(8800, () => {
  console.log('Backend server is running on 8800 port...');
  // conectare la baza de date
  conectareMongoDb();

  app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳 ');
  });
});
