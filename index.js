const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const cors = require('cors');
const nodemailer = require('nodemailer');

app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;


// mongoose.connect('mongodb+srv://harika:harika@cluster0.lyzjf6y.mongodb.net/?retryWrites=true&w=majority')
// .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//   });

  mongoose.connect("mongodb://express-mongodb-survey-postapi-server:tC0h67xtnuuU9ZTe56i5NojOD8JxBBoZ9M2e1qPO9GPzhBaXroAfGCaP589TN7KMrjy69uxhrymXACDbMcLtVQ==@express-mongodb-survey-postapi-server.mongo.cosmos.azure.com:10255/express-mongodb-survey-postapi-database?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@express-mongodb-survey-postapi-server@")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
// addded azure
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
  agent: String,
  surveyId: String,
  category: String,
  questionNumber: Number,
  audioData: Buffer,
  contentType: String,
});

const Audio = mongoose.model('Audio', audioSchema);

// Create an API endpoint for uploading audio files
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const { agent,surveyId, category, questionNumber } = req.body;
    const audioData = req.file.buffer;
    const contentType = req.file.mimetype;

    const audio = new Audio({ agent,surveyId, category, questionNumber, audioData, contentType });
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



// Add this route to delete audio by ID
app.delete('/delete-audio-by-id/:id', async (req, res) => {
  try {
    const audioId = req.params.id;

    // Validate that the ID parameter is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(audioId)) {
      return res.status(400).json({ error: 'Invalid audio ID' });
    }

    const deletedAudio = await Audio.findByIdAndDelete(audioId);

    if (!deletedAudio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    res.status(200).json({ message: 'Audio deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Add this route to delete all audio entries
app.delete('/delete-all-audio', async (req, res) => {
  try {
    // Use the deleteMany method to delete all audio entries
    const deleteResult = await Audio.deleteMany({});

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'No audio entries found to delete' });
    }

    res.status(200).json({ message: 'All audio entries deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this route to fetch audio data by agent
app.get('/fetch-audio-by-agent/:agent', async (req, res) => {
  try {
    const { agent } = req.params;
    const audioByAgent = await Audio.find({ agent });
    res.status(200).json(audioByAgent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this route to fetch audio data by surveyId
app.get('/fetch-audio-by-surveyId/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const audioBySurveyId = await Audio.find({ surveyId });
    res.status(200).json(audioBySurveyId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this route to fetch audio data by category
app.get('/fetch-audio-by-category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const audioByCategory = await Audio.find({ category });
    res.status(200).json(audioByCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// for sending mails
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'harika.krishna99@gmail.com',
    pass: 'bmkkbdjbtdmlhsue',
  },
});


// API endpoint to send an email
app.post('/send-email', (req, res) => {
  const { emailid, otpnumber } = req.body;

  // Email content
  const mailOptions = {
    from: 'harika.krishna99@gmail.com',
    to: emailid, // Replace with your recipient's email address
    subject: 'Otp to login into Digital Parliament',
    html: `
      <p>Otp: ${otpnumber}</p>
     <p>Never share Otp details with others,This otp is valid only for 30 seconds.</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({error, message: 'Error sending email' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
});



// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



