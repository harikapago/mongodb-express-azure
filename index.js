const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const cors = require('cors');


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

// ------------------------------------------question database---------------------------


// Define your question schema and model using Mongoose
const questionSchema = new mongoose.Schema({
  questionNumber: Number,
  category: String,
  engquetxt: String,
  telquetxt: String,
  engrcd: Buffer,
  telrcd: Buffer,
  contentType: String,
});

const Question = mongoose.model('Question', questionSchema);

app.post('/upload-question', upload.fields([
  { name: 'engrcd', maxCount: 1 },
  { name: 'telrcd', maxCount: 1 }
]), async (req, res) => {
  try {
    const { questionNumber, category, engquetxt, telquetxt } = req.body;
    const engrcd = req.files['engrcd'][0].buffer;
    const telrcd = req.files['telrcd'][0].buffer;
    const contentType = req.files['engrcd'][0].mimetype;

    const question = new Question({ questionNumber, category, engquetxt, telquetxt, engrcd, telrcd, contentType });
    await question.save();

    res.status(201).json({ message: 'Question uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/fetch-all-questions', async (req, res) => {
  try {
    const allQuestions = await Question.find({});
    res.status(200).json(allQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this route to post question data
app.post('/post-question', upload.fields([
  { name: 'engrcd', maxCount: 1 },
  { name: 'telrcd', maxCount: 1 }
]), async (req, res) => {
  try {
    const { questionNumber, category, engquetxt, telquetxt } = req.body;
    const engrcd = req.files['engrcd'][0].buffer;
    const telrcd = req.files['telrcd'][0].buffer;
    const contentType = req.files['engrcd'][0].mimetype;

    const question = new Question({ questionNumber, category, engquetxt, telquetxt, engrcd, telrcd, contentType });
    await question.save();

    res.status(201).json({ message: 'Question posted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



