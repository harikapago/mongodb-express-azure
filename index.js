const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const cors = require('cors');

app.use(cors());
const port = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://harika:harika@cluster0.lyzjf6y.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to database');
});

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define your audio file schema and model using Mongoose
const audioSchema = new mongoose.Schema({
  title: String,
  audioData: Buffer,
  contentType: String,
});

const Audio = mongoose.model('Audio', audioSchema);

// Create an API endpoint for uploading audio files
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const { title } = req.body;
    const audioData = req.file.buffer;
    const contentType = req.file.mimetype;

    const audio = new Audio({ title, audioData, contentType });
    await audio.save();

    res.status(201).json({ message: 'Audio uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Add this route to fetch all data
app.get('/fetch-all-audio', async (req, res) => {
  try {
    const allAudio = await Audio.find({});
    res.status(200).json(allAudio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const app = express();
// const cors = require('cors');

// app.use(cors());
// const port = process.env.PORT || 3000;

// mongoose.connect('mongodb+srv://harika:harika@cluster0.lyzjf6y.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//   });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to database');
// });

// // Set up multer for handling file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Define your audio file schema and model using Mongoose
// const audioSchema = new mongoose.Schema({
//   title: String,
//   audioData: [{ data: Buffer, contentType: String }], // Array of audio files
// });

// const Audio = mongoose.model('Audio', audioSchema);

// // Create an API endpoint for uploading audio files
// app.post('/upload', upload.array('audio', 5), async (req, res) => {
//   try {
//     const { title } = req.body;
//     const audioFiles = req.files.map((file) => ({
//       data: file.buffer,
//       contentType: file.mimetype,
//     }));

//     const audio = new Audio({ title, audioData: audioFiles });
//     await audio.save();

//     res.status(201).json({ message: 'Audio uploaded successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Start the Express server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

