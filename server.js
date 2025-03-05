require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define MongoDB Schema & Model
const ApplicationSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    affiliation: String,
    designation: String,
    fileName: String,
    submittedAt: { type: Date, default: Date.now }
});

const Application = mongoose.model("Application", ApplicationSchema);

// Configure Multer for File Upload (Store in Memory, NOT on Server)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Nodemailer (Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Your Gmail
        pass: process.env.EMAIL_PASS   // App Password (Not your regular password)
    }
});

// API Endpoint to Submit Form
app.post("/submit-form", upload.single("proofUpload"), async (req, res) => {
    try {
        const { name, email, mobile, affiliation, designation } = req.body;
        const file = req.file;  // Payment Proof (File Buffer)

        if (!name || !email || !mobile || !file) {
            return res.status(400).json({ success: false, error: "All fields are required!" });
        }

        // Save form data in MongoDB (WITHOUT FILE)
        const newApplication = new Application({ name, email, mobile, affiliation, designation,fileName: file.originalname  });
        await newApplication.save();

        // Send Email with the Payment Proof Attached
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL, // Admin email
            subject: "New Application Submission",
            text: `New application received:\n\nName: ${name}\nEmail: ${email}\nMobile: ${mobile}\nAffiliation: ${affiliation}\nDesignation: ${designation}\n\nPayment proof attached.`,
            attachments: [
                {
                    filename: file.originalname,
                    content: file.buffer
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email Sent Successfully!");

        res.status(200).json({ success: true, message: "Application submitted successfully!" });
    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ success: false, error: "Internal server error." });
    }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
