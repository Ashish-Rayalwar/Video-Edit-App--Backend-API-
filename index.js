const express = require("express");
const multer = require("multer");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const router = express.Router();
const port = 3000;
app.use(multer().any());
app.use(express.json());

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// File upload endpoint
app.post("/upload", upload.single("video"), (req, res) => {
  try {
    console.log("runing");
    res.json({ success: true, message: "File uploaded successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Video processing endpoint
app.post("/process", (req, res) => {
  try {
    let data = req.body;
    const { videoPath } = data; // Assuming the path is sent in the request body

    // Process the video using FFmpeg
    ffmpeg(videoPath)
      .output("output.mp4")
      .on("end", () => {
        console.log("Video processing complete");
        res.download("output.mp4"); // Send the processed video as a response
      })
      .on("error", (err) => {
        console.error("Error processing video:", err);
        res.json({ success: false, error: err.message });
      })
      .run();
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/edit", (req, res) => {
  const { videoPath, startTime, endTime } = req.body;

  if (!endTime) {
    ffmpeg(videoPath)
      .setStartTime(startTime)
      .output("edited_output.mp4")
      .on("end", () => {
        console.log("Video editing complete");
        res.download("edited_output.mp4"); // Send the edited video as a response
      })
      .on("error", (err) => {
        console.error("Error editing video:", err);
        res.json({ success: false, error: err.message });
      })
      .run();
  } else {
    // Edit the video using FFmpeg from the given start and end times
    ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(endTime)
      .output("edited_output.mp4")
      .on("end", () => {
        console.log("Video editing complete");
        res.download("edited_output.mp4"); // Send the edited video as a response
      })
      .on("error", (err) => {
        console.error("Error editing video:", err);
        res.json({ success: false, error: err.message });
      })
      .run();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
