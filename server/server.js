require("dotenv").config();
const jwt = require("jsonwebtoken"); //jwt is used to generate and verify the token for authentication and authorization of the user.
const express = require("express"); //express is node.js framewrok that is used to create server/API.
const http = require("http");
const mongoose = require("mongoose"); //mongoose is used to connect to mongodb database.
const cors = require("cors"); //cors is used to allow cross-origin requests between frontend and backend.
const bodyParser = require("body-parser"); //body-parser is used to parse(read) the body data.
const googleMailService = require("./services/googleMailService");
const app = express(); //one express app is created to handle the requests and responses.
const crypto = require("crypto");
const bcrypt = require("bcrypt"); //bcrypt is used to hash the password before storing it in the database.
const server = http.createServer(app);
const chatbotRoutes = require("./routes/chatbotroutes");

// Initialize Socket.io with fallback
let io = null;
try {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*", // have to change at the time of deployment
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });
  console.log("⚡ Socket.IO initialized successfully");
} catch (err) {
  console.warn(
    "⚠️ Socket.IO module not yet installed. Please run: npm install socket.io in server directory.",
    err,
  );
}

const multer = require("multer"); //multer is used to handle file uploads in the backend.
const path = require("path"); //path is used to handle file paths in the backend.
const fs = require("fs"); //for safety articles
const PDFDocument = require("pdfkit"); //pdfkit is used to generate pdf files in the backend.

app.use(express.json()); //express.json() is used to parse the body data in json format.this is important because the frontend will send the data in json format and we need to parse it to use it in our backend.
app.use(cors()); //cors() is used to allow cross-origin requests between frontend and backend.
app.use(bodyParser.json()); //bodyParser.json() is used to parse the request body data in json format.
app.use("/public", express.static("public"));
app.use("/volunteer", express.static("volunteer")); //express.static() is used to serve static files like images, css, js etc. public is the folder where we will store the uploaded files(images).
app.use("/articles", express.static("articles"));
app.use("/incidentReports", express.static("incidentReports"));
app.use("/api/chatbot", chatbotRoutes);

//connect to mongodb database
mongoose
  .connect("mongodb://localhost:27017/db_safeher") // ye mongodb se connection establish kar raha hai and default port 27017 use kar raha hai. db_safeher is the name of the database.
  .then(() => console.log("Connected to MongoDB database")) //mongodb connection successful ho gaya
  .catch((err) => console.error("MongoDB connection error:", err)); //mongodb connection failed ho gaya, error print hoga

//MULTER CONFIGURATION//
const storage = multer.diskStorage({
  //multer.diskStorage() is used to configure the storage of the uploaded files(images). ye function multer ko batata hai ki uploaded files kaha store karni hai aur unka naam kya hoga.
  destination: path.join(__dirname, "./public"), //ye batata hai ki uploaded files kaha store karni hai.yaha public folder me store karne ka path diya hai. __dirname is the current directory of the server.js file.path.join() is used to join the current directory with the public folder.
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname), //ye batata hai ki uploaded file ka naam kya hoga. yaha humne file ka naam current timestamp + original file name rakha hai. isse har file ka unique naam hoga aur overwrite nahi hoga.
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG and PNG images are allowed"));
    }
  },
});

const multi = upload.fields([{ name: "profilephoto" }]); //ye function multer ko batata hai ki kaunse fields me files upload karni hai. yaha profilephoto field me file upload karni hai.

//volunteer photo
const storage1 = multer.diskStorage({
  destination: path.join(__dirname, "./volunteer"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload1 = multer({
  storage: storage1,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG and PNG images are allowed"));
    }
  },
});

const multi1 = upload1.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
]);

//safety articles image upload
const articleFolder = path.join(__dirname, "./articles");
if (!fs.existsSync(articleFolder)) {
  fs.mkdirSync(articleFolder, { recursive: true });
}

const articleStorage = multer.diskStorage({
  destination: articleFolder,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const articleUpload = multer({ storage: articleStorage });

//incident report photo upload
const incidentFolder = path.join(__dirname, "./incidentReports");
const incidentStorage = multer.diskStorage({
  destination: incidentFolder,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const incidentUpload = multer({ storage: incidentStorage });

//SCHEMAS//
//Woman user registration schema
const womanUser = new mongoose.model(
  "womanUser",
  new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    phoneNumber: String,
    gender: String,
    dob: String,
    city: String,
    state: String,
    pincode: String,
    address: String,
    profile_photo: String,
    status: { type: String, default: "Active" },
    createdAt: Date,
    lastActiveAt: Date,
  }),
);

const WOMAN_INACTIVITY_DAYS = 30;
const WOMAN_INACTIVITY_CHECK_INTERVAL_MS = 60 * 60 * 1000;

async function updateInactiveWomanAccounts() {
  const inactivityCutoff = new Date(
    Date.now() - WOMAN_INACTIVITY_DAYS * 24 * 60 * 60 * 1000,
  );

  await womanUser.updateMany(
    {
      status: { $ne: "Inactive" },
      $expr: {
        $lte: [
          {
            $ifNull: [
              "$lastActiveAt",
              { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
            ],
          },
          inactivityCutoff,
        ],
      },
    },
    { $set: { status: "Inactive" } },
  );
}

mongoose.connection.once("open", () => {
  const checkInactiveAccounts = () => {
    updateInactiveWomanAccounts().catch((error) => {
      console.error("Error updating inactive woman accounts:", error);
    });
  };

  checkInactiveAccounts();
  setInterval(checkInactiveAccounts, WOMAN_INACTIVITY_CHECK_INTERVAL_MS);
});

//Trusted Contact schema
const trustedContact = new mongoose.model(
  "trustedContact",
  new mongoose.Schema({
    womanId: String,
    contactName: String,
    relationship: String,
    phoneNo: String,
    email: { type: String, required: true },
  }),
);

//Volunteer Registration schema
const volunteer = new mongoose.model(
  "volunteer",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    contact_no: String,
    gender: String,
    dob: Date,
    city: String,
    state: String,
    pincode: String,
    address: String,
    profile_photo: String,
    qualification: String,
    serviceArea: String,
    proof_type: String,
    proof: String,
    reason: String,
    createdAt: Date,
    status: { type: String, default: "Pending" },
    activeSOSId: { type: String, default: null },
    activeSOSLockExpiresAt: { type: Date, default: null },
  }),
);

// Forgot Password - OTP and Reset Token Schema
const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["woman", "volunteer"],
      required: true,
    },

    otpHash: {
      type: String,
      default: null,
    },

    otpFingerprint: {
      type: String,
      default: null,
    },

    otpStatus: {
      type: String,
      enum: [
        "not_requested",
        "pending",
        "verified",
        "expired",
        "locked",
        "used",
      ],
      default: "not_requested",
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    generationCount: {
      type: Number,
      default: 0,
    },

    cooldownUntil: {
      type: Date,
      default: null,
    },

    lastGeneratedAt: {
      type: Date,
      default: null,
    },

    resetTokenHash: {
      type: String,
      default: null,
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
passwordResetSchema.index({ email: 1, role: 1 }, { unique: true });
passwordResetSchema.index(
  { otpFingerprint: 1 },
  {
    unique: true,
    partialFilterExpression: {
      otpFingerprint: { $type: "string" },
    },
  },
);
const passwordReset = mongoose.model("passwordReset", passwordResetSchema);

// Generate secure 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

// Generate OTP fingerprint for duplicate checking
function generateOTPFingerprint(otp) {
  return crypto
    .createHmac("sha256", process.env.OTP_FINGERPRINT_SECRET)
    .update(otp)
    .digest("hex");
}

// Generate a unique OTP by checking active fingerprints
async function generateUniqueOTP() {
  // Release fingerprints of expired OTPs
  await passwordReset.updateMany(
    {
      otpFingerprint: { $type: "string" },
      $or: [{ expiresAt: { $lte: new Date() } }, { expiresAt: null }],
    },
    {
      $set: {
        otpHash: null,
        otpFingerprint: null,
        otpStatus: "expired",
        expiresAt: null,
      },
    },
  );

  for (let i = 0; i < 10; i++) {
    const otp = generateOTP();
    const otpFingerprint = generateOTPFingerprint(otp);
    const existingOTP = await passwordReset.findOne({
      otpFingerprint,
    });
    if (!existingOTP) {
      return { otp, otpFingerprint };
    }
  }
  throw new Error("Unable to generate a unique OTP. Please try again.");
}

// API for generating and sending Forgot Password OTP
app.post("/api/forgot-password/send-otp", async (req, res) => {
  try {
    const { email, role } = req.body;
    if (typeof email !== "string" || !email.trim() || !role) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!["woman", "volunteer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Check account according to selected role
    const user =
      role === "woman"
        ? await womanUser.findOne({ email: normalizedEmail })
        : await volunteer.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No account found with this email address. Please check your email and try again.",
      });
    }

    const now = new Date();
    let resetData = await passwordReset.findOne({
      email: normalizedEmail,
      role,
    });
    if (!resetData) {
      resetData = new passwordReset({
        email: normalizedEmail,
        role,
      });
    }

    // Check active cooldown
    if (resetData.cooldownUntil && resetData.cooldownUntil > now) {
      const remainingSeconds = Math.ceil(
        (resetData.cooldownUntil - now) / 1000,
      );
      return res.status(429).json({
        success: false,
        message:
          "You have reached the maximum OTP generation limit. Please try again after 24 hours.",
        remainingSeconds,
      });
    }

    // Reset generation count after cooldown expires
    if (resetData.cooldownUntil && resetData.cooldownUntil <= now) {
      resetData.generationCount = 0;
      resetData.cooldownUntil = null;
    }

    // Maximum 5 OTP generations
    if (resetData.generationCount >= 5) {
      resetData.cooldownUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await resetData.save();
      return res.status(429).json({
        success: false,
        message:
          "You have reached the maximum OTP generation limit. Please try again after 24 hours.",
        remainingSeconds: 24 * 60 * 60,
      });
    }

    // Generate and save a unique OTP
    const previousGenerationCount = resetData.generationCount;
    let otp;
    let otpSaved = false;

    for (let i = 0; i < 10; i++) {
      const generated = await generateUniqueOTP();
      otp = generated.otp;
      resetData.otpHash = await bcrypt.hash(otp, 10);
      resetData.otpFingerprint = generated.otpFingerprint;
      resetData.otpStatus = "pending";
      resetData.expiresAt = new Date(now.getTime() + 60 * 1000);
      resetData.attempts = 0;
      resetData.generationCount = previousGenerationCount + 1;
      resetData.lastGeneratedAt = now;

      // Invalidate previous reset authorization
      resetData.resetTokenHash = null;
      resetData.resetTokenExpiresAt = null;
      resetData.verifiedAt = null;
      try {
        await resetData.save();
        otpSaved = true;
        break;
      } catch (error) {
        // Retry only when the OTP fingerprint already exists
        if (error.code === 11000) {
          const duplicateFingerprint =
            error.keyPattern?.otpFingerprint || error.keyValue?.otpFingerprint;

          if (duplicateFingerprint) {
            resetData.otpHash = null;
            resetData.otpFingerprint = null;
            continue;
          }
        }
        throw error;
      }
    }
    if (!otpSaved) {
      throw new Error("Unable to generate a unique OTP. Please try again.");
    }

    // Send OTP through existing Gmail service
    let mailResult;
    try {
      mailResult = await googleMailService.sendMail({
        to: normalizedEmail,
        subject: "SafeHer - Password Reset OTP",
        text: `Your SafeHer password reset OTP is ${otp}. It is valid for 1 minute. Do not share this OTP with anyone.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #172554;">SafeHer Password Reset</h2>
            <p>Your OTP for resetting your password is:</p>
            <h1 style="color: ${
              role === "volunteer" ? "#16a085" : "#e83e8c"
            }; letter-spacing: 5px;">${otp}</h1>
            <p>This OTP is valid for <strong>1 minute</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>SafeHer Team</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Forgot Password Email Error:", mailError);
    }

    // Email was not successfully delivered
    if (!mailResult || !mailResult.success || mailResult.preview) {
      resetData.otpHash = null;
      resetData.otpFingerprint = null;
      resetData.otpStatus = "not_requested";
      resetData.expiresAt = null;
      resetData.generationCount = previousGenerationCount;
      resetData.cooldownUntil = null;

      await resetData.save();
      return res.status(503).json({
        success: false,
        message:
          "Email service is not configured. Please check your Gmail settings.",
      });
    }

    // Start 24-hour cooldown after the 5th successful email
    if (resetData.generationCount === 5) {
      resetData.cooldownUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await resetData.save();
    }
    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your registered email address.",
      otpStatus: resetData.otpStatus,
      attempts: resetData.attempts,
      generationCount: resetData.generationCount,
      expiresAt: resetData.expiresAt,
      cooldownUntil: resetData.cooldownUntil,
    });
  } catch (error) {
    console.error("Forgot Password OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again later.",
    });
  }
});

// API for verifying Forgot Password OTP
app.post("/api/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, role, otp } = req.body;
    if (typeof email !== "string" || !email.trim() || !role || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, role and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!["woman", "volunteer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }
    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP.",
      });
    }
    const resetData = await passwordReset.findOne({
      email: normalizedEmail,
      role,
    });
    if (!resetData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new OTP.",
      });
    }

    // Check whether OTP is already locked
    if (resetData.otpStatus === "locked") {
      return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts reached. Please request a new OTP.",
      });
    }

    // Check whether OTP is already verified
    if (resetData.otpStatus === "verified") {
      return res.status(400).json({
        success: false,
        message:
          "OTP has already been verified. Please continue to reset your password.",
      });
    }

    // Check whether OTP has expired
    if (
      resetData.otpStatus === "expired" ||
      (resetData.expiresAt && resetData.expiresAt <= new Date())
    ) {
      resetData.otpHash = null;
      resetData.otpFingerprint = null;
      resetData.otpStatus = "expired";
      resetData.expiresAt = null;
      await resetData.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Only pending OTPs can be verified
    if (
      resetData.otpStatus !== "pending" ||
      !resetData.otpHash ||
      !resetData.expiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new OTP.",
      });
    }

    // Maximum 5 incorrect attempts
    if (resetData.attempts >= 5) {
      resetData.otpHash = null;
      resetData.otpFingerprint = null;
      resetData.otpStatus = "locked";
      resetData.expiresAt = null;
      await resetData.save();
      return res.status(429).json({
        success: false,
        message: "Maximum OTP attempts reached. Please request a new OTP.",
      });
    }

    // Compare entered OTP with stored hash
    const isOTPValid = await bcrypt.compare(String(otp), resetData.otpHash);
    if (!isOTPValid) {
      resetData.attempts += 1;
      if (resetData.attempts >= 5) {
        resetData.otpHash = null;
        resetData.otpFingerprint = null;
        resetData.otpStatus = "locked";
        resetData.expiresAt = null;
      }
      await resetData.save();
      return res.status(400).json({
        success: false,
        message:
          resetData.attempts >= 5
            ? "Maximum OTP attempts reached. Please request a new OTP."
            : `Incorrect OTP. ${5 - resetData.attempts} attempts remaining.`,
        otpStatus: resetData.otpStatus,
        attempts: resetData.attempts,
        generationCount: resetData.generationCount,
        expiresAt: resetData.expiresAt,
        cooldownUntil: resetData.cooldownUntil,
      });
    }

    // Generate a secure password-reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the SHA-256 hash of the token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    resetData.otpHash = null;
    resetData.otpFingerprint = null;
    resetData.otpStatus = "verified";
    resetData.expiresAt = null;
    resetData.resetTokenHash = resetTokenHash;

    // Reset token valid for 10 minutes
    resetData.resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    resetData.verifiedAt = new Date();
    await resetData.save();
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP. Please try again later.",
    });
  }
});

// API for checking Forgot Password status (if page refresh ho then old limits hi return ho)
app.get("/api/forgot-password/status", async (req, res) => {
  try {
    const { email, role } = req.query;
    if (
      typeof email !== "string" ||
      !email.trim() ||
      !["woman", "volunteer"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and role are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();
    const resetData = await passwordReset.findOne({
      email: normalizedEmail,
      role,
    });

    if (!resetData) {
      return res.status(200).json({
        success: true,
        exists: false,
        otpStatus: "not_requested",
        attempts: 0,
        generationCount: 0,
        expiresAt: null,
        cooldownUntil: null,
        resetTokenExpiresAt: null,
      });
    }

    // Mark expired OTP and release its fingerprint
    if (
      resetData.otpStatus === "pending" &&
      resetData.expiresAt &&
      resetData.expiresAt <= now
    ) {
      resetData.otpHash = null;
      resetData.otpFingerprint = null;
      resetData.otpStatus = "expired";
      resetData.expiresAt = null;
      await resetData.save();
    }

    // Clear expired reset authorization
    if (
      resetData.otpStatus === "verified" &&
      resetData.resetTokenExpiresAt &&
      resetData.resetTokenExpiresAt <= now
    ) {
      resetData.resetTokenHash = null;
      resetData.resetTokenExpiresAt = null;
      resetData.verifiedAt = null;
      resetData.otpStatus = "used";
      await resetData.save();
    }

    // Reset generation count only after cooldown has expired
    if (resetData.cooldownUntil && resetData.cooldownUntil <= now) {
      resetData.generationCount = 0;
      resetData.cooldownUntil = null;
      await resetData.save();
    }
    return res.status(200).json({
      success: true,
      exists: true,
      otpStatus: resetData.otpStatus,
      attempts: resetData.attempts,
      generationCount: resetData.generationCount,
      expiresAt: resetData.expiresAt,
      cooldownUntil: resetData.cooldownUntil,
      resetTokenExpiresAt: resetData.resetTokenExpiresAt,
    });
  } catch (error) {
    console.error("Forgot Password Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve password reset status.",
    });
  }
});

// API for resetting password
app.post("/api/forgot-password/reset-password", async (req, res) => {
  try {
    const { email, role, resetToken, newPassword } = req.body;
    if (
      typeof email !== "string" ||
      !email.trim() ||
      !role ||
      typeof resetToken !== "string" ||
      !resetToken ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (!["woman", "volunteer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // Find password reset record
    const resetData = await passwordReset.findOne({
      email: normalizedEmail,
      role,
    });
    if (
      !resetData ||
      resetData.otpStatus !== "verified" ||
      !resetData.resetTokenHash ||
      !resetData.resetTokenExpiresAt ||
      !resetData.verifiedAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired reset authorization. Please verify OTP again.",
      });
    }

    // Check reset token expiry
    if (resetData.resetTokenExpiresAt <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reset authorization has expired. Please verify OTP again.",
      });
    }

    // Hash received token and compare
    const receivedTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    if (receivedTokenHash !== resetData.resetTokenHash) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset authorization.",
      });
    }

    // Find the existing user according to selected role
    const user =
      role === "woman"
        ? await womanUser.findOne({ email: normalizedEmail })
        : await volunteer.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Check whether new password matches the current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password according to selected role
    const updatedUser =
      role === "woman"
        ? await womanUser.findOneAndUpdate(
            { email: normalizedEmail },
            { $set: { password: hashedPassword } },
            { returnDocument: "after" },
          )
        : await volunteer.findOneAndUpdate(
            { email: normalizedEmail },
            { $set: { password: hashedPassword } },
            { returnDocument: "after" },
          );
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "Unable to update password.",
      });
    }

    // Clear OTP and reset authorization
    resetData.otpHash = null;
    resetData.otpFingerprint = null;
    resetData.otpStatus = "used";
    resetData.expiresAt = null;
    resetData.attempts = 0;
    resetData.resetTokenHash = null;
    resetData.resetTokenExpiresAt = null;
    resetData.verifiedAt = null;
    await resetData.save();
    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again later.",
    });
  }
});

//Admin schema
const admin = new mongoose.model(
  "admin",
  new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
  }),
);

// Fixed admin account
async function createAdminAccount() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log("Admin credentials missing in .env file");
      return;
    }
    const existingAdmin = await admin.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await admin.create({
      name: "SafeHer Admin",
      email: adminEmail,
      password: hashedPassword,
    });
    console.log("Fixed Admin account created successfully");
  } catch (error) {
    console.log("Admin account creation error:", error);
  }
}
createAdminAccount();

//safety-article schema
const safetyArticle = new mongoose.model(
  "safetyArticle",
  new mongoose.Schema({
    title: String,
    category: String,
    image: String,
    shortDescription: String,
    content: String,
    status: { type: String, default: "Draft" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }),
);

//Safety Map Area schema
const safetyArea = new mongoose.model(
  "safetyArea",
  new mongoose.Schema({
    areaId: { type: String, unique: true, required: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Safe", "Caution"], required: true },
    description: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }),
);

//Add Safety Area API for safetymap for admin
app.post("/api/addsafetyarea", requireAdminSession, async (req, res) => {
  try {
    const { location, type, description, latitude, longitude } = req.body;

    // Required field validation
    if (
      typeof location !== "string" ||
      !location.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !["Safe", "Caution"].includes(type) ||
      latitude === undefined ||
      latitude === null ||
      latitude === "" ||
      longitude === undefined ||
      longitude === null ||
      longitude === ""
    ) {
      return res.status(400).json({
        message: "Please provide all required safety area details.",
      });
    }

    // Coordinate validation
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message: "Please provide valid latitude and longitude.",
      });
    }

    // Generate the next Area ID
    const lastArea = await safetyArea.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastArea?.areaId) {
      const lastNumber = Number(lastArea.areaId.replace("SA-", ""));
      if (Number.isInteger(lastNumber) && lastNumber > 0) {
        nextNumber = lastNumber + 1;
      }
    }

    const areaId = `SA-${String(nextNumber).padStart(3, "0")}`;
    // Create the safety area
    const newArea = await safetyArea.create({
      areaId,
      location: location.trim(),
      type,
      description: description.trim(),
      latitude: lat,
      longitude: lng,
    });
    return res.status(201).json({
      message: "Safety area added successfully.",
      safetyArea: newArea,
    });
  } catch (error) {
    console.error("Add Safety Area Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A safety area with this ID already exists. Please try again.",
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid safety area details.",
      });
    }
    return res.status(500).json({
      message: "Failed to add safety area.",
    });
  }
});

//Get All Safety Areas API for safetymap for admin
app.get("/api/getsafetyareas", async (req, res) => {
  try {
    const safetyAreas = await safetyArea.find().sort({ createdAt: -1 });
    res.status(200).json(safetyAreas);
  } catch (error) {
    console.error("Get Safety Areas Error:", error);
    res.status(500).json({
      message: "Failed to get safety areas.",
    });
  }
});

//Edit safety areas api for admin
app.put(
  "/api/editsafetyarea/:areaId",
  requireAdminSession,
  async (req, res) => {
    try {
      const { location, type, description, latitude, longitude } = req.body;
      if (
        typeof location !== "string" ||
        !location.trim() ||
        typeof description !== "string" ||
        !description.trim() ||
        !["Safe", "Caution"].includes(type)
      ) {
        return res.status(400).json({
          message: "Please provide valid safety area details.",
        });
      }

      const lat = Number(latitude);
      const lng = Number(longitude);
      if (
        latitude === "" ||
        latitude == null ||
        longitude === "" ||
        longitude == null ||
        !Number.isFinite(lat) ||
        lat < -90 ||
        lat > 90 ||
        !Number.isFinite(lng) ||
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          message: "Please select a valid location on the map.",
        });
      }

      const updatedArea = await safetyArea.findOneAndUpdate(
        { areaId: req.params.areaId },
        {
          location: location.trim(),
          type,
          description: description.trim(),
          latitude: lat,
          longitude: lng,
          updatedAt: new Date(),
        },
        { returnDocument: "after", runValidators: true },
      );

      if (!updatedArea) {
        return res.status(404).json({
          message: "Safety area not found.",
        });
      }
      return res.status(200).json({
        message: "Safety area updated successfully.",
        safetyArea: updatedArea,
      });
    } catch (error) {
      console.error("Edit Safety Area Error:", error);
      return res.status(500).json({
        message: "Failed to update safety area.",
      });
    }
  },
);

//Delete safety areas api for admin
app.delete(
  "/api/deletesafetyarea/:areaId",
  requireAdminSession,
  async (req, res) => {
    try {
      const deletedArea = await safetyArea.findOneAndDelete({
        areaId: req.params.areaId,
      });

      if (!deletedArea) {
        return res.status(404).json({
          message: "Safety area not found.",
        });
      }
      return res.status(200).json({
        message: "Safety area deleted successfully.",
      });
    } catch (error) {
      console.error("Delete Safety Area Error:", error);
      return res.status(500).json({
        message: "Failed to delete safety area.",
      });
    }
  },
);

//Incident report schema
const incidentReport = new mongoose.model(
  "incidentReport",
  new mongoose.Schema({
    womanId: String,
    incidentType: String,
    description: String,
    incidentDate: String,
    incidentTime: String,
    photo: String,
    location: String,
    status: { type: String, default: "Under Review" },
    adminRemarks: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  }),
);

//Add incident report API for women user
app.post(
  "/api/addincidentreport",
  requireWomanSession,
  incidentUpload.single("photo"),
  async (req, res) => {
    try {
      const {
        incidentType,
        description,
        incidentDate,
        incidentTime,
        location,
      } = req.body;

      //validation
      if (
        !incidentType ||
        !description ||
        !incidentDate ||
        !incidentTime ||
        !location
      ) {
        return res.status(400).json({
          message: "All incident report fields are required.",
        });
      }

      //photo validation
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload an incident photo.",
        });
      }

      //create incident report
      const report = await incidentReport.create({
        womanId: req.womanId,
        incidentType: incidentType,
        description: description,
        incidentDate: incidentDate,
        incidentTime: incidentTime,
        photo: req.file.filename,
        location: location,
        status: "Under Review",
      });
      res.status(201).json({
        message: "Incident report submitted successfully.",
        report: report,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while submitting incident report.",
      });
    }
  },
);

//Get my incident reports API for woman user
app.get(
  "/api/getmyincidentreports/:womanId",
  requireWomanSession,
  async (req, res) => {
    try {
      const { womanId } = req.params;
      if (String(womanId) !== String(req.womanId)) {
        return res.status(403).json({
          message: "You are not authorized to access these reports.",
        });
      }
      const reports = await incidentReport
        .find({ womanId: req.womanId })
        .sort({ createdAt: -1 });
      return res.status(200).json(reports);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while fetching incident reports.",
      });
    }
  },
);

//Get reports PDF API
app.get("/api/getreportspdf/:id", async (req, res) => {
  try {
    const report = await incidentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        message: "Incident report not found.",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="SafeHer-Incident-Report-${report._id}.pdf"`,
    );
    doc.pipe(res);
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor("#172554")
      .text("SAFEHER – Women Safety Platform", {
        align: "center",
      });
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#555555")
      .text("Community Safety Incident Report", {
        align: "center",
      });
    doc.moveDown(0.8);
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .lineWidth(1)
      .strokeColor("#172554")
      .stroke();
    doc.moveDown(1.2);
    doc
      .fontSize(17)
      .font("Helvetica-Bold")
      .fillColor("#111111")
      .text("INCIDENT REPORT", {
        align: "center",
      });
    doc.moveDown(0.4);
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#666666")
      .text(`Report ID: ${report._id}`, { align: "center" });
    doc.moveDown(1.2);
    const imagePath = path.join(__dirname, "incidentReports", report.photo);
    if (fs.existsSync(imagePath)) {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#111111")
        .text("Incident Evidence");
      doc.moveDown(0.5);

      // Fixed image position
      const imageX = 97.5;
      const imageY = doc.y;
      doc.image(imagePath, imageX, imageY, {
        fit: [400, 240],
        align: "center",
        valign: "center",
      });

      // IMPORTANT: Manually move cursor below the complete image
      doc.y = imageY + 260;
    }
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#172554")
      .text("Incident Information", 50, doc.y);
    doc.moveDown(0.7);
    const row1Y = doc.y;
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text("Incident Type", 60, row1Y);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#111111")
      .text(report.incidentType, 60, row1Y + 16, { width: 220 });
    doc.fontSize(10).font("Helvetica-Bold").text("Status", 320, row1Y);
    doc.font("Helvetica").text(report.status, 320, row1Y + 16, { width: 220 });
    doc.y = row1Y + 55;
    const row2Y = doc.y;
    doc.font("Helvetica-Bold").text("Incident Date", 60, row2Y);
    doc.font("Helvetica").text(report.incidentDate, 60, row2Y + 16, {
      width: 220,
    });
    doc.font("Helvetica-Bold").text("Incident Time", 320, row2Y);
    doc.font("Helvetica").text(report.incidentTime, 320, row2Y + 16, {
      width: 220,
    });
    doc.y = row2Y + 55;
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#172554")
      .text("Location", 60, doc.y);
    doc.moveDown(0.4);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#111111")
      .text(report.location, 60, doc.y, {
        width: 475,
        lineGap: 3,
      });
    doc.moveDown(1.2);
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#172554")
      .text("Incident Description", 60, doc.y);
    doc.moveDown(0.4);
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#111111")
      .text(report.description, 60, doc.y, {
        width: 475,
        lineGap: 4,
      });
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#666666")
      .text(
        "This report was generated by SafeHer Women Safety Platform.",
        50,
        760,
        {
          width: 495,
          align: "center",
        },
      );
    doc.fontSize(8).text("For official record purposes", 50, 775, {
      width: 495,
      align: "center",
    });
    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while generating PDF.",
    });
  }
});

//Get all incident reports API for admin
app.get(
  "/api/getadminincidentreports",
  requireAdminSession,
  async (req, res) => {
    try {
      const reports = await incidentReport.find().sort({ createdAt: -1 });
      const reportsWithWoman = await Promise.all(
        reports.map(async (report, index) => {
          const woman = await womanUser
            .findById(report.womanId)
            .select("fullName phoneNumber");
          return {
            reportNumber: index + 1,
            _id: report._id,
            womanId: report.womanId,
            womanName: woman ? woman.fullName : "Unknown",
            phone: woman ? woman.phoneNumber : "Not Available",
            incidentType: report.incidentType,
            description: report.description,
            incidentDate: report.incidentDate,
            incidentTime: report.incidentTime,
            photo: report.photo,
            location: report.location,
            status: report.status,
            adminRemarks: report.adminRemarks,
            createdAt: report.createdAt,
          };
        }),
      );
      res.status(200).json(reportsWithWoman);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while fetching incident reports.",
      });
    }
  },
);

//Verify incident report status API for admin
app.put(
  "/api/verifyincidentreport/:id",
  requireAdminSession,
  async (req, res) => {
    try {
      const report = await incidentReport.findByIdAndUpdate(
        req.params.id,
        { status: "Verified" },
        { returnDocument: "after" },
      );
      if (!report) {
        return res.status(404).json({
          message: "Incident report not found.",
        });
      }
      res.status(200).json({
        message: "Incident report verified successfully.",
        report: report,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while verifying incident report.",
      });
    }
  },
);

//Reject incident report status API for admin
app.put(
  "/api/rejectincidentreport/:id",
  requireAdminSession,
  async (req, res) => {
    try {
      const { adminRemarks } = req.body;
      if (!adminRemarks || !adminRemarks.trim()) {
        return res.status(400).json({
          message: "Rejection reason is required.",
        });
      }

      const report = await incidentReport.findByIdAndUpdate(
        req.params.id,
        { status: "Rejected", adminRemarks: adminRemarks.trim() },
        { returnDocument: "after" },
      );
      if (!report) {
        return res.status(404).json({
          message: "Incident report not found.",
        });
      }
      res.status(200).json({
        message: "Incident report rejected successfully.",
        report: report,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while rejecting incident report.",
      });
    }
  },
);

//Get verified incident reports API for volunteer
app.get("/api/getverifiedincidentreports", async (req, res) => {
  try {
    const reports = await incidentReport
      .find({ status: "Verified" })
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching verified incident reports.",
    });
  }
});

//add safety article API for admin
app.post(
  "/api/addsafetyarticle",
  requireAdminSession,
  articleUpload.single("image"),
  async (req, res) => {
    try {
      const { title, category, shortDescription, content, status } = req.body;

      //validation
      if (!title || !category || !shortDescription || !content) {
        return res.status(400).json({
          message: "All article fields are required.",
        });
      }

      //create article
      const article = await safetyArticle.create({
        title: title,
        category: category,
        image: req.file ? req.file.filename : "",
        shortDescription: shortDescription,
        content: content,
        status: status || "Draft",
      });
      res.status(201).json({
        message: "Safety article added successfully.",
        article: article,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while adding safety article.",
      });
    }
  },
);

//Get all safety articles for admin
app.get("/api/getsafetyarticles", async (req, res) => {
  try {
    const data = await safetyArticle.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching safety articles",
    });
  }
});

// Get particular Safety Article
app.get("/api/getsafetyarticle/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const data = await safetyArticle.findById(_id);
    if (!data) {
      return res.status(404).json({
        message: "Safety article not found",
      });
    }
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// Edit Safety Article
app.put(
  "/api/editsafetyarticle/:_id",
  requireAdminSession,
  articleUpload.single("image"),
  async (req, res) => {
    try {
      const _id = req.params._id;
      const article = await safetyArticle.findById(_id);
      if (!article) {
        return res.status(404).json({
          message: "Safety article not found",
        });
      }

      const { title, category, shortDescription, content, status } = req.body;
      // Validation
      if (!title || !category || !shortDescription || !content) {
        return res.status(400).json({
          message: "All article fields are required.",
        });
      }

      // Update article
      article.title = title;
      article.category = category;
      article.shortDescription = shortDescription;
      article.content = content;
      article.status = status || "Draft";
      article.updatedAt = new Date();

      // Update image only if a new image is selected
      if (req.file) {
        article.image = req.file.filename;
      }
      await article.save();
      res.status(200).json({
        message: "Safety article updated successfully.",
        article: article,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while updating safety article.",
      });
    }
  },
);

// DELETE SAFETY ARTICLE API
app.delete(
  "/api/deletesafetyarticle/:_id",
  requireAdminSession,
  async (req, res) => {
    try {
      const _id = req.params._id;
      const article = await safetyArticle.findById(_id);
      if (!article) {
        return res.status(404).json({
          message: "Safety article not found.",
        });
      }

      // Delete article image from articles folder
      if (article.image) {
        const imagePath = path.join(articleFolder, article.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await safetyArticle.findByIdAndDelete(_id);
      res.status(200).json({
        message: "Safety article deleted successfully.",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while deleting safety article.",
      });
    }
  },
);

// Registration API for woman user
app.post("/api/womanregister", multi, async (req, res) => {
  const image = req.files?.profilephoto?.[0]?.filename; //ye line uploaded file ka naam get kar rahi hai. agar file upload nahi hui hai to image variable undefined hoga.
  const exists = await womanUser.findOne({ email: req.body.email }); //ye line mongodb me check kar rahi hai ki email already exist karta hai ya nahi. agar email already exist karta hai to exists variable me user ka data aa jayega, otherwise null aa jayega.
  if (exists) {
    //agar email already exist karta hai to error response send kar raha hai.
    return res.status(400).json({ message: "Email already exists" });
  }
  const registeredAt = new Date();
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  await womanUser.create({
    fullName: req.body.fullName,
    email: req.body.email.trim().toLowerCase(),
    password: hashedPassword,
    phoneNumber: req.body.phoneNumber,
    gender: req.body.gender,
    dob: req.body.dob,
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    address: req.body.address,
    profile_photo: image,
    status: "Active",
    createdAt: registeredAt,
    lastActiveAt: registeredAt,
  }); //ye line mongodb me new woman user create kar rahi hai. req.body me frontend se aayi hui data hai aur image variable me uploaded file ka naam hai.
  res.json({
    message: "Woman user registered successfully",
  }); //response send kar raha hai ki woman user registered successfully. ye response frontend me show hoga.
});

//Login API for woman user //
app.post("/api/womanlogin", async (req, res) => {
  try {
    const { identifier, password } = req.body; //ye line frontend se aayi hui data ko destructure kar rahi hai. identifier me username/email aur password me password aayega.
    if (!identifier || !password) {
      //agar identifier ya password empty hai to error response send kar raha hai.
      return res.status(400).send({
        message: "Email and password are required.",
      });
    }
    const user = await womanUser.findOne({
      email: identifier.trim().toLowerCase(),
    }); //ye line mongodb me check kar rahi hai ki email aur password match karta hai ya nahi. agar match karta hai to user variable me user ka data aa jayega, otherwise null aa jayega.

    if (!user) {
      return res.status(400).send({
        message: "Invalid email or password.",
      });
    }

    //verfiy bcrypt hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }
    user.status = "Active";
    user.lastActiveAt = new Date();
    await user.save();

    //remove password before sending response
    const safeUser = user.toObject();
    const sessionToken = createWomanSessionToken(user._id);
    delete safeUser.password;
    return res.status(200).json({
      ...safeUser,
      sessionToken,
    });
  } catch (error) {
    console.error("Error during woman user login:", error);
    return res.status(500).json({
      message: "Something went wrong during login. Please try again later.",
    });
  }
});

//Woman user activity update API for updating last active time and status
app.put("/api/womanactivity/:_id", requireWomanSession, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params._id)) {
      return res.status(400).json({ message: "Invalid woman user ID." });
    }

    if (String(req.params._id) !== String(req.womanId)) {
      return res.status(403).json({
        message: "You are not authorized to update this activity.",
      });
    }

    const user = await womanUser
      .findByIdAndUpdate(
        req.womanId,
        {
          $set: {
            status: "Active",
            lastActiveAt: new Date(),
          },
        },
        { returnDocument: "after" },
      )
      .select("_id status lastActiveAt");

    if (!user) {
      return res.status(404).json({ message: "Woman user not found." });
    }

    return res.status(200).json({
      message: "Woman user activity updated.",
      status: user.status,
      lastActiveAt: user.lastActiveAt,
    });
  } catch (error) {
    console.error("Error updating woman user activity:", error);
    return res.status(500).json({
      message: "Unable to update woman user activity.",
    });
  }
});

//Trusted Contact API for woman
app.post("/api/addTrustedContact", requireWomanSession, async (req, res) => {
  try {
    const { contactName, relationship, email } = req.body;
    const phoneNo =
      typeof req.body.phoneNo === "string" ? req.body.phoneNo.trim() : "";
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!contactName || !relationship || !normalizedEmail) {
      return res.status(400).json({
        message: "Contact name, relationship, and email are required.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const duplicateConditions = [
      { womanId: req.womanId, email: normalizedEmail },
    ];
    if (phoneNo) duplicateConditions.push({ womanId: req.womanId, phoneNo });
    const exists = await trustedContact.findOne({
      $or: duplicateConditions,
    });

    if (exists) {
      return res.status(400).json({
        message: "This trusted contact is already added.",
      });
    }

    const contact = await trustedContact.create({
      womanId: req.womanId,
      contactName: contactName.trim(),
      relationship: relationship,
      phoneNo,
      email: normalizedEmail,
    });

    res.status(201).json({
      message: "Trusted Contact Added Successfully",
      contact,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while adding trusted contact",
    });
  }
});

//Get Trusted Contacts API for fetching  contacts
app.get(
  "/api/getTrustedContacts/:womanId",
  requireWomanSession,
  async (req, res) => {
    try {
      const { womanId } = req.params;
      if (String(womanId) !== String(req.womanId)) {
        return res.status(403).json({
          message: "You are not authorized to access these contacts.",
        });
      }
      const contacts = await trustedContact.find({ womanId: req.womanId });
      res.status(200).json(contacts);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while fetching trusted contacts.",
      });
    }
  },
);

//Delete Trusted Contact API
app.delete(
  "/api/deleteTrustedContact/:_id",
  requireWomanSession,
  async (req, res) => {
    try {
      const { _id } = req.params;
      const contact = await trustedContact.findOne({
        _id,
        womanId: req.womanId,
      });
      if (!contact) {
        return res.status(404).json({
          message: "Trusted contact not found.",
        });
      }
      await trustedContact.findByIdAndDelete(_id);
      res.status(200).json({
        message: "Trusted contact deleted successfully.",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while deleting trusted contact.",
      });
    }
  },
);

//Edit Trusted Contact API
app.put(
  "/api/editTrustedContact/:_id",
  requireWomanSession,
  async (req, res) => {
    try {
      const { _id } = req.params;
      const { contactName, relationship, email } = req.body;
      const phoneNo =
        typeof req.body.phoneNo === "string" ? req.body.phoneNo.trim() : "";
      const normalizedEmail =
        typeof email === "string" ? email.trim().toLowerCase() : "";

      if (!contactName || !relationship || !normalizedEmail) {
        return res.status(400).json({
          message: "Contact name, relationship, and email are required.",
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
          message: "Please enter a valid email address.",
        });
      }

      // Check if the contact exists
      const contact = await trustedContact.findOne({
        _id,
        womanId: req.womanId,
      });
      if (!contact) {
        return res.status(404).json({
          message: "Trusted contact not found.",
        });
      }

      const duplicateConditions = [
        { womanId: req.womanId, email: normalizedEmail },
      ];
      if (phoneNo) {
        duplicateConditions.push({
          womanId: req.womanId,
          phoneNo,
        });
      }
      const duplicate = await trustedContact.findOne({
        _id: { $ne: _id },
        $or: duplicateConditions,
      });

      if (duplicate) {
        return res.status(400).json({
          message: "This trusted contact is already added.",
        });
      }

      // Update the contact
      contact.contactName = contactName.trim();
      contact.relationship = relationship;
      contact.phoneNo = phoneNo;
      contact.email = normalizedEmail;

      await contact.save();
      res.status(200).json({
        message: "Trusted contact updated successfully.",
        contact,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error while updating trusted contact.",
      });
    }
  },
);

//Registration API for Volunteer
app.post("/api/volunteerregister", multi1, async (req, res) => {
  try {
    const image = req.files?.profilePhoto?.[0]?.filename;
    const image1 = req.files?.idProof?.[0]?.filename;
    const exists = await volunteer.findOne({ email: req.body.email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    //Hash volunteer password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    await volunteer.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      createdAt: new Date(),
      contact_no: req.body.contact_no,
      gender: req.body.gender,
      dob: req.body.dob,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      address: req.body.address,
      profile_photo: image,
      qualification: req.body.qualification,
      serviceArea: req.body.serviceArea,
      proof_type: req.body.proof_type,
      proof: image1,
      reason: req.body.reason,
    });
    res.json({
      message: "Your volunteer application has been submitted successfully.",
    });
  } catch (error) {
    console.log("Volunteer Registration Error:", error);
    res.status(500).json({
      message:
        "Something went wrong during registration. Please try again later.",
    });
  }
});

//Login API for Volunteer
app.post("/api/volunteerlogin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({
      message: "Email and password are required.",
    });
  }
  const user = await volunteer.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({
      status: "Invalid",
      message: "Invalid email or Password.",
    });
  }

  if (user.status === "Pending") {
    return res.status(403).send({
      status: "Pending",
      message: "Your volunteer application is still pending approval.",
    });
  }

  if (user.status === "Rejected") {
    return res.status(403).send({
      status: "Rejected",
      message: "Your volunteer application has been rejected.",
    });
  }

  if (user.status === "Approved") {
    const sessionToken = createVolunteerSessionToken(user._id);
    return res.status(200).send({
      status: "Approved",
      _id: user._id,
      name: user.name,
      email: user.email,
      contact_no: user.contact_no || "",
      profile_photo: user.profile_photo || "",
      sessionToken,
    });
  }

  return res.status(403).send({
    status: "Unknown",
    message:
      "Your account status could not be verified. Please contact the administrator.",
  });
});

//Get volunteer data into admin
app.get("/api/getvolunteer", requireAdminSession, async (req, res) => {
  res.json(await volunteer.find().select("-password"));
});

//get volunteer data using particular id
app.get(
  "/api/getvolunteerdetails/:_id",
  requireAdminSession,
  async (req, res) => {
    try {
      const _id = req.params._id;
      const data = await volunteer.findById(_id).select("-password");
      if (!data) {
        return res.status(404).json({
          message: "Volunteer not found",
        });
      }

      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Server error",
      });
    }
  },
);

//change approve status for volunteer
app.put("/api/approvestatus/:_id", requireAdminSession, async (req, res) => {
  try {
    const _id = req.params._id;
    await volunteer.updateOne({ _id: _id }, { $set: { status: "Approved" } });
    res.json({
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error updating status",
    });
  }
});

//change reject status for volunteer
app.put("/api/rejectstatus/:_id", requireAdminSession, async (req, res) => {
  try {
    const _id = req.params._id;
    await volunteer.updateOne({ _id: _id }, { $set: { status: "Rejected" } });
    res.json({
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error updating status",
    });
  }
});

//Get volunteer data for volunteer profile
app.get(
  "/api/getvolunteerprofile/:_id",
  requireVolunteerSession,
  async (req, res) => {
    try {
      if (String(req.params._id) !== String(req.volunteerId)) {
        return res.status(403).json({
          message: "You are not authorized to access this profile.",
        });
      }
      const volunteerData = await volunteer
        .findById(req.volunteerId)
        .select("-password");
      if (!volunteerData) {
        return res.status(404).json({
          message: "Volunteer not found.",
        });
      }
      res.status(200).json(volunteerData);
    } catch (error) {
      console.log("Get volunteer profile error:", error);
      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

// Update Volunteer Profile
app.put(
  "/api/updatevolunteerprofile/:_id",
  requireVolunteerSession,
  async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      const { _id } = req.params;
      if (String(_id) !== String(req.volunteerId)) {
        return res.status(403).json({
          message: "You are not authorized to update this profile.",
        });
      }
      const {
        name,
        contact_no,
        city,
        state,
        pincode,
        address,
        qualification,
        serviceArea,
        reason,
      } = req.body;

      // Required field validation
      if (
        !name ||
        !contact_no ||
        !city ||
        !state ||
        !pincode ||
        !address ||
        !qualification ||
        !serviceArea ||
        !reason
      ) {
        return res.status(400).json({
          message: "Please fill all required fields.",
        });
      }

      // Check volunteer exists
      const volunteerData = await volunteer.findById(req.volunteerId);
      if (!volunteerData) {
        return res.status(404).json({
          message: "Volunteer not found.",
        });
      }

      // Check whether profile details actually changed for activity history
      const profileFields = {
        name: name.trim(),
        contact_no: contact_no.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        address: address.trim(),
        qualification: qualification.trim(),
        serviceArea: serviceArea.trim(),
        reason: reason.trim(),
      };

      const changedFields = Object.keys(profileFields)
        .filter(
          (field) =>
            String(volunteerData[field] ?? "").trim() !== profileFields[field],
        )
        .map((field) => {
          const fieldNames = {
            name: "Name",
            contact_no: "Contact Number",
            city: "City",
            state: "State",
            pincode: "Pincode",
            address: "Address",
            qualification: "Qualification",
            serviceArea: "Service Area",
            reason: "Reason",
          };

          return `${fieldNames[field]} updated to ${profileFields[field]}`;
        });

      // Update only editable fields
      volunteerData.name = name.trim();
      volunteerData.contact_no = contact_no.trim();
      volunteerData.city = city.trim();
      volunteerData.state = state.trim();
      volunteerData.pincode = pincode.trim();
      volunteerData.address = address.trim();
      volunteerData.qualification = qualification.trim();
      volunteerData.serviceArea = serviceArea.trim();
      volunteerData.reason = reason.trim();

      await volunteerData.save();
      // Log profile changes only when details actually changed
      if (changedFields.length > 0) {
        await volunteerActivity.create({
          volunteerId: String(volunteerData._id),
          type: "PROFILE_UPDATED",
          title: "Profile Updated",
          description: changedFields.join(", ") + ".",
        });
      }
      res.status(200).json({
        message: "Profile updated successfully.",
        volunteer: volunteerData,
      });
    } catch (error) {
      console.log("Update volunteer profile error:", error);
      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

// Update Volunteer Profile Photo
app.put(
  "/api/updatevolunteerphoto/:_id",
  requireVolunteerSession,
  upload1.single("profilePhoto"),
  async (req, res) => {
    let profilePhotoSaved = false;

    try {
      const { _id } = req.params;
      if (String(_id) !== String(req.volunteerId)) {
        return res.status(403).json({
          message: "You are not authorized to update this profile photo.",
        });
      }

      // Check volunteer exists
      const volunteerData = await volunteer.findById(req.volunteerId);

      if (!volunteerData) {
        // Delete uploaded file if volunteer does not exist
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          message: "Volunteer not found.",
        });
      }

      // Check photo is uploaded
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a profile photo.",
        });
      }

      // Store old photo name
      const oldPhoto = volunteerData.profile_photo;

      // Update new photo
      volunteerData.profile_photo = req.file.filename;
      await volunteerData.save();
      profilePhotoSaved = true;

      await volunteerActivity.create({
        volunteerId: String(volunteerData._id),
        type: "PROFILE_UPDATED",
        title: "Profile Photo Updated",
        description: "Your volunteer profile photo was updated.",
      });

      // Delete old photo only after successful database update
      if (oldPhoto) {
        const oldPhotoPath = path.join(__dirname, "./volunteer", oldPhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      res.status(200).json({
        message: "Profile photo updated successfully.",
        profile_photo: volunteerData.profile_photo,
      });
    } catch (error) {
      console.log("Update volunteer photo error:", error);

      // Delete newly uploaded file if database update fails
      if (req.file && !profilePhotoSaved) {
        const newPhotoPath = req.file.path;
        if (fs.existsSync(newPhotoPath)) {
          fs.unlinkSync(newPhotoPath);
        }
      }
      res.status(500).json({
        profilePhotoUpdated: profilePhotoSaved,
        message: profilePhotoSaved
          ? "Profile photo was updated, but activity history could not be recorded."
          : "Server error.",
      });
    }
  },
);

// Update Volunteer password API for My profile page
app.put(
  "/api/updatevolunteerpassword/:user_id",
  requireVolunteerSession,
  async (req, res) => {
    const { user_id } = req.params;
    if (String(user_id) !== String(req.volunteerId)) {
      return res.status(403).json({
        status: "Invalid",
        message: "You are not authorized to update this password.",
      });
    }
    const { currentPassword, password } = req.body;
    if (!currentPassword || !password) {
      return res.status(400).json({
        status: "Invalid",
        message: "Current password and new password are required",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        status: "Invalid",
        message: " New Password must be at least 6 characters long",
      });
    }

    try {
      const existingUser = await volunteer.findById(req.volunteerId);
      if (!existingUser) {
        return res.status(404).json({
          status: "Invalid",
          message: "Volunteer not found",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password,
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          status: "Invalid",
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      existingUser.password = hashedPassword;
      await existingUser.save();
      res.status(200).json({
        status: "Success",
        message: "Password updated successfully",
      });
    } catch (error) {
      console.log("Volunteer Password Update Error:", error);
      res.status(500).json({
        status: "Error",
        message: "Unable to update password",
      });
    }
  },
);

/* Get Volunteer Activity History */
app.get(
  "/api/volunteer-activity/:volunteerId",
  requireVolunteerSession,
  async (req, res) => {
    try {
      const { volunteerId } = req.params;
      if (String(volunteerId) !== String(req.volunteerId)) {
        return res.status(403).json({
          message: "You are not authorized to view this activity history.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
        return res.status(400).json({
          message: "Invalid volunteer ID.",
        });
      }

      const activities = await volunteerActivity
        .find({ volunteerId })
        .sort({ createdAt: -1 })
        .limit(200)
        .select("type title description createdAt");

      return res.status(200).json({
        message: "Activity history fetched successfully.",
        activities,
      });
    } catch (error) {
      console.error("Volunteer activity history error:", error);

      return res.status(500).json({
        message: "Failed to fetch activity history.",
      });
    }
  },
);

//Generate Token for Admin
function createAdminSessionToken(adminId) {
  return jwt.sign(
    {
      adminId: String(adminId),
      role: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
      algorithm: "HS256",
    },
  );
}

function decodeAdminSessionToken(token) {
  try {
    const session = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      session.role !== "admin" ||
      !mongoose.Types.ObjectId.isValid(session.adminId)
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

async function requireAdminSession(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  const session = decodeAdminSessionToken(token);
  if (!session) {
    return res.status(401).json({
      message: "Admin session is missing or expired. Please sign in again.",
    });
  }
  try {
    const existingAdmin = await admin.exists({
      _id: session.adminId,
    });

    if (!existingAdmin) {
      return res.status(401).json({
        message: "Admin account is no longer available. Please sign in again.",
      });
    }

    req.adminId = session.adminId;
    return next();
  } catch (error) {
    console.error("Error verifying admin session:", error);

    return res.status(500).json({
      message: "Unable to verify admin session.",
    });
  }
}

//Generate Token for Volunteer
function createVolunteerSessionToken(volunteerId) {
  return jwt.sign(
    {
      volunteerId: String(volunteerId),
      role: "volunteer",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
      algorithm: "HS256",
    },
  );
}

function decodeVolunteerSessionToken(token) {
  try {
    const session = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      session.role !== "volunteer" ||
      !mongoose.Types.ObjectId.isValid(session.volunteerId)
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

async function requireVolunteerSession(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  const session = decodeVolunteerSessionToken(token);

  if (!session) {
    return res.status(401).json({
      message: "Volunteer session is missing or expired. Please sign in again.",
    });
  }

  try {
    const existingVolunteer = await volunteer.exists({
      _id: session.volunteerId,
      status: "Approved",
    });

    if (!existingVolunteer) {
      return res.status(401).json({
        message:
          "Volunteer account is no longer available. Please sign in again.",
      });
    }

    req.volunteerId = session.volunteerId;
    return next();
  } catch (error) {
    console.error("Error verifying volunteer session:", error);

    return res.status(500).json({
      message: "Unable to verify volunteer session.",
    });
  }
}

//Generate Token for Women
function createWomanSessionToken(womanId) {
  return jwt.sign(
    {
      womanId: String(womanId),
      role: "woman",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
      algorithm: "HS256",
    },
  );
}

function decodeWomanSessionToken(token) {
  try {
    const session = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (
      session.role !== "woman" ||
      !mongoose.Types.ObjectId.isValid(session.womanId)
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

async function requireWomanSession(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  const session = decodeWomanSessionToken(token);
  if (!session) {
    return res.status(401).json({
      message:
        "Woman User session is missing or expired. Please sign in again.",
    });
  }

  try {
    const existingWoman = await womanUser.exists({
      _id: session.womanId,
    });

    if (!existingWoman) {
      return res.status(401).json({
        message:
          "Woman User account is no longer available. Please sign in again.",
      });
    }
    req.womanId = session.womanId;
    return next();
  } catch (error) {
    console.error("Error verifying Woman User session:", error);
    return res.status(500).json({
      message: "Unable to verify Woman User session.",
    });
  }
}

async function getSOSSessionFromToken(token) {
  const adminSession = decodeAdminSessionToken(token);
  if (adminSession && (await admin.exists({ _id: adminSession.adminId }))) {
    return { role: "admin", userId: adminSession.adminId };
  }

  const volunteerSession = decodeVolunteerSessionToken(token);
  if (
    volunteerSession &&
    (await volunteer.exists({
      _id: volunteerSession.volunteerId,
      status: "Approved",
    }))
  ) {
    return { role: "volunteer", userId: volunteerSession.volunteerId };
  }

  const womanSession = decodeWomanSessionToken(token);
  if (womanSession && (await womanUser.exists({ _id: womanSession.womanId }))) {
    return { role: "woman", userId: womanSession.womanId };
  }

  return null;
}

async function requireSOSSession(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  try {
    const session = await getSOSSessionFromToken(token);
    if (!session) {
      return res.status(401).json({
        message: "A valid SafeHer session is required.",
      });
    }

    req.sosSession = session;
    return next();
  } catch (error) {
    console.error("Error verifying SOS session:", error);
    return res.status(500).json({
      message: "Unable to verify SafeHer session.",
    });
  }
}

//Admin Login API
app.post("/api/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        status: "Invalid",
        message: "Email and password are required",
      });
    }

    const user = await admin.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).send({
        status: "Invalid",
        message: "Invalid email or password",
      });
    }

    //compare password with bcrypt password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        status: "Invalid",
        message: "Invalid email or password",
      });
    }

    //generate session token for admin
    res.status(200).send({
      status: "Approved",
      _id: user._id,
      email: user.email,
      sessionToken: createAdminSessionToken(user._id),
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).send({
      status: "Error",
      message: "Something went wrong during login. Please try again later.",
    });
  }
});

//Get admin profile
app.get("/api/getadminprofile/:_id", requireAdminSession, async (req, res) => {
  try {
    const { _id } = req.params;
    if (String(req.adminId) !== String(_id)) {
      return res.status(403).send({
        status: "Invalid",
        message: "You are not authorized to access this admin profile",
      });
    }
    const data = await admin.findById(_id).select("-password");
    if (!data) {
      return res.status(404).send({
        status: "Invalid",
        message: "Admin not found",
      });
    }
    res.status(200).send({
      status: "Success",
      data: data,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).send({
      status: "Error",
      message: "Unable to fetch admin profile",
    });
  }
});

//Edit admin profile
app.put("/api/editadminprofile/:_id", requireAdminSession, async (req, res) => {
  const { _id } = req.params;
  const { name, email } = req.body;

  try {
    //verify logged-in admin is updating their own account
    if (String(req.adminId) !== String(_id)) {
      return res.status(403).send({
        status: "Invalid",
        message: "You are not authorized to update this admin account",
      });
    }

    //Validate input
    if (typeof name !== "string" || typeof email !== "string") {
      return res.status(400).send({
        status: "Invalid",
        message: "Valid name and email are required.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      return res.status(400).send({
        status: "Invalid",
        message: "Please enter a valid email address",
      });
    }

    //check duplicate email
    const existingAdmin = await admin.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: _id },
    });
    if (existingAdmin) {
      return res.status(400).send({
        status: "Invalid",
        message: "This email is already in use",
      });
    }

    const updatedAdmin = await admin
      .findByIdAndUpdate(
        _id,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .select("-password");
    if (!updatedAdmin) {
      return res.status(404).send({
        status: "Invalid",
        message: "Admin not found",
      });
    }
    res.status(200).send({
      status: "Success",
      message: "Profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    console.log("Admin Profile Update Error:", error);
    res.status(500).send({
      status: "Error",
      message: "Unable to update profile",
    });
  }
});

//Edit admin password
app.put(
  "/api/editadminpassword/:_id",
  requireAdminSession,
  async (req, res) => {
    const { _id } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
      //verify logged-in admin is updating their own account
      if (String(req.adminId) !== String(_id)) {
        return res.status(403).send({
          status: "Invalid",
          message: "You are not authorized to update this admin account",
        });
      }

      //validate passwords
      if (!currentPassword || !newPassword) {
        return res.status(400).send({
          status: "Invalid",
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).send({
          status: "Invalid",
          message: "New password must be at least 6 characters long",
        });
      }

      const adminData = await admin.findById(_id);
      if (!adminData) {
        return res.status(404).send({
          status: "Invalid",
          message: "Admin not found",
        });
      }

      //verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        adminData.password,
      );
      if (!isPasswordValid) {
        return res.status(400).send({
          status: "Invalid",
          message: "Current password is incorrect",
        });
      }

      //Prevent reusing the same password
      const isSamePassword = await bcrypt.compare(
        newPassword,
        adminData.password,
      );
      if (isSamePassword) {
        return res.status(400).send({
          status: "Invalid",
          message: "New password must be different from current password",
        });
      }

      //Hash the new password before saving
      adminData.password = await bcrypt.hash(newPassword, 10);
      await adminData.save();
      return res.status(200).send({
        status: "Success",
        message: "Password updated successfully",
      });
    } catch (error) {
      console.log("Admin Password Update Error:", error);
      return res.status(500).send({
        status: "Error",
        message: "Unable to update password",
      });
    }
  },
);

//Get all woman data into admin
app.get("/api/getwomanusers", requireAdminSession, async (req, res) => {
  try {
    const data = await womanUser.find().select("-password");
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while fetching woman users",
    });
  }
});

// Get particular woman user details
app.get("/api/getwomanuserdetails/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const data = await womanUser.findById(_id).select("-password");

    if (!data) {
      return res.status(404).json({
        message: "Woman user not found",
      });
    }
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

//Edit woman profile API
app.put("/api/editwomanprofile/:_id", requireWomanSession, async (req, res) => {
  try {
    const _id = req.params._id;
    if (String(_id) !== String(req.womanId)) {
      return res.status(403).json({
        message: "You are not authorized to update this profile.",
      });
    }
    const { fullName, phoneNumber, city, state, pincode, address } = req.body;

    // Required field validation
    if (!fullName || !phoneNumber || !city || !state || !pincode || !address) {
      return res.status(400).json({
        message: "All profile fields are required.",
      });
    }

    const updatedUser = await womanUser
      .findByIdAndUpdate(
        req.womanId,
        {
          fullName,
          phoneNumber,
          city,
          state,
          pincode,
          address,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "Woman user not found.",
      });
    }
    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Update profile error:", error);
    res.status(500).json({
      message: "Server error.",
    });
  }
});

//Edit woman profile photo API
app.put(
  "/api/editwomanprofilephoto/:_id",
  requireWomanSession,
  upload.single("profile_photo"),
  async (req, res) => {
    try {
      const _id = req.params._id;
      if (String(_id) !== String(req.womanId)) {
        return res.status(403).json({
          message: "You are not authorized to update this profile.",
        });
      }
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a profile photo.",
        });
      }
      const user = await womanUser.findById(req.womanId);
      if (!user) {
        return res.status(404).json({
          message: "Woman user not found.",
        });
      }
      const oldPhoto = user.profile_photo;
      user.profile_photo = req.file.filename;
      await user.save();

      // Delete old uploaded photo
      if (oldPhoto) {
        const oldPhotoPath = path.join(__dirname, "public", oldPhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      const updatedUser = await womanUser
        .findById(req.womanId)
        .select("-password");
      res.status(200).json({
        message: "Profile photo updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      console.log("Profile photo update error:", error);
      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

//change women password API for My profile page
app.put(
  "/api/changewomanpassword/:_id",
  requireWomanSession,
  async (req, res) => {
    try {
      const _id = req.params._id;
      if (String(_id) !== String(req.womanId)) {
        return res.status(403).json({
          message: "You are not authorized to update this profile.",
        });
      }
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Check all fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          message: "All password fields are required.",
        });
      }

      // Check new password and confirm password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "New password and confirm password do not match.",
        });
      }

      // Get user
      const user = await womanUser.findById(req.womanId);
      if (!user) {
        return res.status(404).json({
          message: "Woman user not found.",
        });
      }

      //Verify current bcrypt hashed password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          message: "Current password is incorrect.",
        });
      }

      //Check wheather new password is same as current password
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          message: "New password must be different from current password.",
        });
      }

      // Hash and update new password
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();
      return res.status(200).json({
        message: "Password changed successfully.",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

//new woman user for last 7 days
app.get("/api/getnewwomanusers", requireAdminSession, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const count = await womanUser.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    res.status(200).send({
      newUsers: count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error while fetching new users",
    });
  }
});

/* ========================================================
   EMERGENCY SOS SYSTEM (Live Location & Tracking)
======================================================== */

// Haversine distance is the straight-line distance between two GPS points.
function isValidGeoCoordinates(lat, lng) {
  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined ||
    lat === "" ||
    lng === ""
  ) {
    return false;
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

function isValidGeoAccuracy(accuracy) {
  return (
    accuracy === undefined ||
    accuracy === null ||
    (Number.isFinite(Number(accuracy)) && Number(accuracy) >= 0)
  );
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    !isValidGeoCoordinates(lat1, lon1) ||
    !isValidGeoCoordinates(lat2, lon2)
  ) {
    return { text: "Calculating...", meters: null };
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
  const rawA =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const a = Math.min(1, Math.max(0, rawA));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  const meters = Math.round(km * 1000);

  let text;
  if (meters < 1000) {
    text = `${meters} meters`;
  } else {
    text = `${km.toFixed(2)} km`;
  }
  return { text, meters };
}

function normalizeArea(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isServiceAreaMatch(serviceArea, sosAddress) {
  const normalizedArea = normalizeArea(serviceArea);
  const normalizedAddress = normalizeArea(sosAddress);
  if (!normalizedArea || !normalizedAddress) return false;

  const areaWords = normalizedArea
    .split(/\s+/)
    .filter((word) => word.length > 1);
  return (
    normalizedAddress.includes(normalizedArea) ||
    (areaWords.length > 0 &&
      areaWords.every((word) => normalizedAddress.includes(word)))
  );
}

async function claimVolunteerForSOS(volunteerRecord, sosId) {
  const volunteerId = String(volunteerRecord._id);
  const otherActiveSOS = await sosAlert.exists({
    volunteerId,
    status: { $in: ["Approved", "Active"] },
    _id: { $ne: sosId },
  });
  if (otherActiveSOS) return null;

  if (volunteerRecord.activeSOSId) {
    const linkedSOS = await sosAlert
      .findById(volunteerRecord.activeSOSId)
      .select("_id status volunteerId");
    const isActiveAssignment =
      linkedSOS &&
      ["Approved", "Active"].includes(linkedSOS.status) &&
      String(linkedSOS.volunteerId) === volunteerId;
    const isCurrentReservation =
      linkedSOS?.status === "Pending" &&
      volunteerRecord.activeSOSLockExpiresAt &&
      volunteerRecord.activeSOSLockExpiresAt.getTime() > Date.now();

    if (isActiveAssignment || isCurrentReservation) return null;

    const released = await releaseVolunteerSOSClaim(
      volunteerId,
      volunteerRecord.activeSOSId,
    );
    if (!released) return null;
  }

  return volunteer.findOneAndUpdate(
    {
      _id: volunteerRecord._id,
      status: "Approved",
      activeSOSId: null,
    },
    {
      $set: {
        activeSOSId: String(sosId),
        activeSOSLockExpiresAt: new Date(Date.now() + 120_000),
      },
    },
    { new: true },
  );
}

async function releaseVolunteerSOSClaim(volunteerId, sosId) {
  if (!volunteerId) return;

  try {
    const result = await volunteer.updateOne(
      { _id: volunteerId, activeSOSId: String(sosId) },
      {
        $set: {
          activeSOSId: null,
          activeSOSLockExpiresAt: null,
        },
      },
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to release volunteer SOS assignment lock:", error);
    return false;
  }
}

async function notifyTrustedContactsOfVolunteerAssignment(sos) {
  try {
    const contacts = await trustedContact.find({ womanId: sos.womanId });
    const recipients = contacts
      .map((contact) => (contact.email || "").trim())
      .filter((email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    if (recipients.length === 0) {
      console.warn(
        `No valid trusted-contact email addresses are configured for ${sos.womanName}.`,
      );
      return;
    }

    const result = await googleMailService.sendSOSVolunteerAssignedEmail({
      recipients,
      womanName: sos.womanName,
      womanPhone: sos.womanPhone,
      womanAddress: sos.womanAddress,
      womanLat: sos.womanLat,
      womanLng: sos.womanLng,
      volunteerName: sos.volunteerName,
      volunteerPhoto: sos.volunteerPhoto,
      volunteerPhone: sos.volunteerPhone,
      volunteerEmail: sos.volunteerEmail,
      distance: sos.distance,
    });

    if (result?.preview) {
      console.log(
        `Volunteer assignment email preview logged for ${sos.womanName}.`,
      );
    } else if (result?.success) {
      console.log(
        `Volunteer assignment email sent to ${recipients.length} trusted contact(s) of ${sos.womanName}.`,
      );
    } else {
      console.warn(
        `Volunteer assignment email was not sent for ${sos.womanName}: ${result?.reason || "Unknown mail service response."}`,
      );
    }
  } catch (error) {
    console.error(
      "Failed to notify trusted contacts about volunteer assignment:",
      error,
    );
  }
}

//Achieve Badge model
const badgeAchievement = mongoose.model(
  "badgeAchievement",
  new mongoose.Schema({
    volunteerId: { type: String, required: true },
    badgeKey: {
      type: String,
      required: true,
      enum: [
        "helping-hand",
        "fast-responder",
        "emergency-champion",
        "consistent-guardian",
        "trusted-volunteer",
      ],
    },
    earnedAt: { type: Date, required: true, default: Date.now },
  }).index({ volunteerId: 1, badgeKey: 1 }, { unique: true }),
);

// Volunteer Activity History Model
const volunteerActivity = mongoose.model(
  "volunteerActivity",
  new mongoose.Schema(
    {
      volunteerId: {
        type: String,
        required: true,
        index: true,
      },
      type: {
        type: String,
        required: true,
        enum: [
          "BADGE_EARNED",
          "VOLUNTEER_MILESTONE",
          "TRUST_SCORE_MILESTONE",
          "PROFILE_UPDATED",
        ],
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      versionKey: false,
    },
  ).index({ volunteerId: 1, createdAt: -1 }),
);

// SOS Alert Schema
const sosAlert = mongoose.model(
  "sosAlert",
  new mongoose.Schema({
    womanId: { type: String, required: true },
    womanName: { type: String, default: "Anonymous User" },
    womanEmail: { type: String, default: "" },
    womanPhone: { type: String, default: "" },
    womanLat: { type: Number, required: true },
    womanLng: { type: Number, required: true },
    womanAccuracy: { type: Number, default: null },
    womanAddress: { type: String, default: "Current GPS Location" },
    emergencyType: { type: String, default: "Emergency Assistance" },
    priority: { type: String, default: "High" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Active", "Resolved", "Cancelled"],
      default: "Pending",
    },
    volunteerId: { type: String, default: null },
    rejectedByVolunteerIds: { type: [String], default: [] },
    volunteerName: { type: String, default: null },
    volunteerEmail: { type: String, default: null },
    volunteerPhone: { type: String, default: null },
    volunteerPhoto: { type: String, default: null },
    volunteerLat: { type: Number, default: null },
    volunteerLng: { type: Number, default: null },
    volunteerAccuracy: { type: Number, default: null },
    assignedAt: { type: Date, default: null },
    volunteerLocationShared: { type: Boolean, default: false },
    distance: { type: String, default: "" },
    distanceMeters: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
  }),
);

// ==========================================
// SOCKET.IO REAL-TIME EVENT SETUP
// ==========================================
if (io) {
  io.use(async (socket, next) => {
    try {
      const session = await getSOSSessionFromToken(
        socket.handshake.auth?.token,
      );
      if (!session) {
        return next(new Error("A valid SafeHer session is required."));
      }

      socket.data.sosSession = session;
      return next();
    } catch (error) {
      console.error("Socket session verification failed:", error);
      return next(new Error("Unable to verify SafeHer session."));
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ Client connected to Socket.IO:", socket.id);

    // Join room for a specific SOS request
    socket.on("join_sos", async (sosId, acknowledge) => {
      if (!sosId) {
        acknowledge?.({ error: "SOS ID is required." });
        return;
      }

      try {
        const sos = await sosAlert.findById(sosId);
        const session = socket.data.sosSession;
        const canView =
          sos &&
          (session.role === "admin" ||
            (session.role === "woman" &&
              String(sos.womanId) === String(session.userId)) ||
            (session.role === "volunteer" &&
              String(sos.volunteerId) === String(session.userId)));
        if (!canView) {
          acknowledge?.({ error: "You are not authorized to view this SOS." });
          return;
        }

        await socket.join(`sos_${sosId}`);
        console.log(`Socket ${socket.id} joined room sos_${sosId}`);
        acknowledge?.({ joined: true });
      } catch (error) {
        console.error(`Socket ${socket.id} failed to join SOS room:`, error);
        acknowledge?.({ error: "Failed to join SOS room." });
      }
    });

    // Leave room
    socket.on("leave_sos", (sosId) => {
      if (sosId) {
        socket.leave(`sos_${sosId}`);
      }
    });

    // Volunteer joins volunteer channel to receive new SOS broadcasts
    socket.on("join_volunteers", () => {
      if (socket.data.sosSession?.role !== "volunteer") return;
      socket.join("volunteers_channel");
    });

    // Direct live location update from woman user via socket
    socket.on("update_woman_location", async (data) => {
      try {
        const { sosId, womanLat, womanLng, womanAccuracy, womanAddress } = data;
        if (
          !sosId ||
          !isValidGeoCoordinates(womanLat, womanLng) ||
          !isValidGeoAccuracy(womanAccuracy)
        )
          return;

        const sos = await sosAlert.findById(sosId);
        if (
          sos &&
          socket.data.sosSession?.role === "woman" &&
          String(sos.womanId) === String(socket.data.sosSession.userId)
        ) {
          sos.womanLat = Number(womanLat);
          sos.womanLng = Number(womanLng);
          if (womanAccuracy != null) sos.womanAccuracy = Number(womanAccuracy);
          if (womanAddress) sos.womanAddress = womanAddress;
          sos.updatedAt = new Date();

          if (sos.volunteerLat !== null && sos.volunteerLng !== null) {
            const dist = calculateHaversineDistance(
              sos.womanLat,
              sos.womanLng,
              sos.volunteerLat,
              sos.volunteerLng,
            );
            sos.distance = dist.text;
            sos.distanceMeters = dist.meters;
          }
          await sos.save();

          // Broadcast instantly to everyone in this SOS room
          io.to(`sos_${sosId}`).emit("woman_location_updated", {
            sosId,
            womanLat: sos.womanLat,
            womanLng: sos.womanLng,
            womanAccuracy: sos.womanAccuracy,
            womanAddress: sos.womanAddress,
            distance: sos.distance,
            distanceMeters: sos.distanceMeters,
            sos,
          });

          // Also notify volunteers channel
          io.to("volunteers_channel").emit("sos_updated", sos);
        }
      } catch (err) {
        console.error("Socket update_woman_location error:", err);
      }
    });

    // Direct live location update from volunteer via socket
    socket.on("update_volunteer_location", async (data) => {
      try {
        const { sosId, volunteerLat, volunteerLng, volunteerAccuracy } = data;
        if (
          !sosId ||
          !isValidGeoCoordinates(volunteerLat, volunteerLng) ||
          !isValidGeoAccuracy(volunteerAccuracy)
        )
          return;

        const sos = await sosAlert.findById(sosId);
        if (
          sos &&
          socket.data.sosSession?.role === "volunteer" &&
          String(sos.volunteerId) === String(socket.data.sosSession.userId)
        ) {
          sos.volunteerLat = Number(volunteerLat);
          sos.volunteerLng = Number(volunteerLng);
          if (volunteerAccuracy != null)
            sos.volunteerAccuracy = Number(volunteerAccuracy);
          sos.volunteerLocationShared = true;
          if (sos.status === "Approved") {
            sos.status = "Active";
          }
          sos.updatedAt = new Date();

          const dist = calculateHaversineDistance(
            sos.womanLat,
            sos.womanLng,
            sos.volunteerLat,
            sos.volunteerLng,
          );
          sos.distance = dist.text;
          sos.distanceMeters = dist.meters;
          await sos.save();

          // Broadcast instantly to everyone tracking this SOS (woman user)
          io.to(`sos_${sosId}`).emit("volunteer_location_updated", {
            sosId,
            volunteerLat: sos.volunteerLat,
            volunteerLng: sos.volunteerLng,
            volunteerAccuracy: sos.volunteerAccuracy,
            distance: sos.distance,
            distanceMeters: sos.distanceMeters,
            status: sos.status,
            sos,
          });

          io.to("volunteers_channel").emit("sos_updated", sos);
        }
      } catch (err) {
        console.error("Socket update_volunteer_location error:", err);
      }
    });

    socket.on("disconnect", () => {
      // Disconnected
    });
  });
}

// 1. CREATE or UPDATE ACTIVE SOS (Women User clicks SOS)
app.post("/api/sos/create", requireWomanSession, async (req, res) => {
  try {
    const {
      womanId,
      womanName,
      womanEmail,
      womanPhone,
      womanLat,
      womanLng,
      womanAccuracy,
      womanAddress,
      emergencyType,
    } = req.body;

    if (
      String(womanId) !== String(req.womanId) ||
      !isValidGeoCoordinates(womanLat, womanLng) ||
      !isValidGeoAccuracy(womanAccuracy)
    ) {
      return res.status(400).json({
        message:
          "Woman ID and live GPS coordinates (latitude, longitude) are required.",
      });
    }

    const woman = await womanUser.findById(womanId);
    if (!woman) {
      return res.status(404).json({
        message: "Woman user not found.",
      });
    }

    // Check if there is already an active or pending SOS for this woman
    const existingActive = await sosAlert.findOne({
      womanId,
      status: { $in: ["Pending", "Approved", "Active"] },
    });

    if (existingActive) {
      existingActive.womanLat = Number(womanLat);
      existingActive.womanLng = Number(womanLng);
      if (womanAccuracy != null)
        existingActive.womanAccuracy = Number(womanAccuracy);
      if (womanAddress) existingActive.womanAddress = womanAddress;
      existingActive.womanPhone = woman.phoneNumber || "";
      existingActive.womanName = woman.fullName || "Woman in Need";
      existingActive.womanEmail = woman.email || "";
      existingActive.updatedAt = new Date();
      if (existingActive.status === "Pending") {
        existingActive.rejectedByVolunteerIds = [];
      }

      if (
        existingActive.volunteerLat !== null &&
        existingActive.volunteerLng !== null
      ) {
        const dist = calculateHaversineDistance(
          existingActive.womanLat,
          existingActive.womanLng,
          existingActive.volunteerLat,
          existingActive.volunteerLng,
        );
        existingActive.distance = dist.text;
        existingActive.distanceMeters = dist.meters;
      }

      await existingActive.save();

      if (io) {
        io.to(`sos_${existingActive._id}`).emit("sos_updated", existingActive);
        io.to("volunteers_channel").emit("sos_updated", existingActive);
      }

      return res.status(200).json({
        message: "Active SOS alert updated with latest live location.",
        sos: existingActive,
      });
    }

    // Create new SOS
    const newAlert = await sosAlert.create({
      womanId,
      womanName: woman.fullName || "Woman in Need",
      womanEmail: woman.email || "",
      womanPhone: woman.phoneNumber || "",
      womanLat: Number(womanLat),
      womanLng: Number(womanLng),
      womanAccuracy: womanAccuracy == null ? null : Number(womanAccuracy),
      womanAddress: womanAddress || "Current GPS Location",
      emergencyType: emergencyType || "Emergency Assistance",
      priority: "High",
      status: "Pending",
    });

    if (io) {
      io.to("volunteers_channel").emit("new_sos_alert", newAlert);
    }

    // Send Emergency SOS Email to Trusted Contacts via Google Mail Service
    const contacts = await trustedContact.find({ womanId });
    try {
      const recipientEmails = contacts
        .map((c) => (c.email || "").trim())
        .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

      if (recipientEmails.length > 0) {
        googleMailService
          .sendSOSEmergencyEmail({
            recipients: recipientEmails,
            womanName: newAlert.womanName,
            womanPhone: newAlert.womanPhone,
            womanEmail: newAlert.womanEmail,
            womanAddress: newAlert.womanAddress,
            womanLat: newAlert.womanLat,
            womanLng: newAlert.womanLng,
            emergencyType: newAlert.emergencyType,
          })
          .then((mailRes) => {
            if (mailRes?.preview) {
              console.log(
                `ℹ️ SOS email logged in preview mode for trusted contacts of ${newAlert.womanName}`,
              );
            } else if (mailRes?.success) {
              console.log(
                `✅ SOS email sent via Google to ${recipientEmails.length} trusted contact(s) of ${newAlert.womanName}`,
              );
            }
          })
          .catch((err) => {
            console.error(
              "❌ Failed to send SOS alert email to trusted contacts:",
              err.message,
            );
          });
      } else {
        console.warn(
          `⚠️ [SafeHer SOS] Woman user ${womanId} (${newAlert.womanName}) has ${contacts.length} trusted contact(s), but none have an email address configured yet.`,
        );
      }
    } catch (mailErr) {
      console.error(
        "Error looking up trusted contacts for SOS email:",
        mailErr,
      );
    }

    return res.status(201).json({
      message:
        "Emergency SOS Alert created successfully! Location shared with volunteers and trusted contacts.",
      sos: newAlert,
    });
  } catch (error) {
    console.error("Error creating SOS:", error);
    res.status(500).json({ message: "Failed to trigger emergency SOS alert." });
  }
});

// 2. GET ACTIVE SOS FOR A SPECIFIC WOMAN
app.get("/api/sos/active/:womanId", requireWomanSession, async (req, res) => {
  try {
    const { womanId } = req.params;
    if (String(womanId) !== String(req.womanId)) {
      return res.status(403).json({
        message: "You are not authorized to view this SOS request.",
      });
    }

    const activeSos = await sosAlert
      .findOne({
        womanId,
        status: { $in: ["Pending", "Approved", "Active"] },
      })
      .sort({ createdAt: -1 });

    if (!activeSos) {
      return res.status(200).json({ active: false, sos: null });
    }

    return res.status(200).json({ active: true, sos: activeSos });
  } catch (error) {
    console.error("Error getting active SOS:", error);
    res.status(500).json({ message: "Error fetching active SOS status." });
  }
});

// 3. GET ALL SOS REQUESTS (For Volunteers)
app.get("/api/sos/all", requireVolunteerSession, async (req, res) => {
  try {
    const requests = await sosAlert.find().sort({ createdAt: -1 });
    const pendingCount = requests.filter((r) => r.status === "Pending").length;
    const activeCount = requests.filter(
      (r) => r.status === "Approved" || r.status === "Active",
    ).length;

    res.status(200).json({
      requests,
      pendingCount,
      activeCount,
      totalCount: requests.length,
    });
  } catch (error) {
    console.error("Error getting SOS requests:", error);
    res.status(500).json({ message: "Failed to retrieve SOS requests." });
  }
});

// 4. GET SINGLE SOS DETAILS
app.get("/api/sos/details/:id", requireSOSSession, async (req, res) => {
  try {
    const sos = await sosAlert.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }

    const { role, userId } = req.sosSession;
    const canView =
      role === "admin" ||
      (role === "woman" && String(sos.womanId) === String(userId)) ||
      (role === "volunteer" && String(sos.volunteerId) === String(userId));
    if (!canView) {
      return res.status(403).json({
        message: "You are not authorized to view this SOS request.",
      });
    }

    res.status(200).json(sos);
  } catch (error) {
    console.error("Error getting SOS details:", error);
    res.status(500).json({ message: "Error fetching SOS details." });
  }
});

// 5. VOLUNTEER APPROVES / ACCEPTS SOS
app.put("/api/sos/approve/:id", requireVolunteerSession, async (req, res) => {
  let claimedVolunteerId = null;
  let assignmentCommitted = false;

  try {
    const { id } = req.params;
    const { volunteerLat, volunteerLng, volunteerAccuracy } = req.body;
    const volunteerId = String(req.volunteerId);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid SOS ID." });
    }
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({
        message: "A valid volunteer ID is required.",
      });
    }
    if (
      !isValidGeoCoordinates(volunteerLat, volunteerLng) ||
      !isValidGeoAccuracy(volunteerAccuracy)
    ) {
      return res.status(400).json({
        message: "Valid volunteer GPS coordinates are required to accept SOS.",
      });
    }

    const existingSos = await sosAlert.findById(id);

    if (!existingSos) {
      return res.status(404).json({
        message: "SOS request not found.",
      });
    }

    if (existingSos.status !== "Pending") {
      return res.status(409).json({
        message: "This SOS has already been accepted or is no longer pending.",
      });
    }

    const now = new Date();
    const volRecord = await volunteer.findById(volunteerId);
    if (!volRecord || volRecord.status !== "Approved") {
      return res.status(403).json({
        message: "Only approved volunteers can accept SOS requests.",
      });
    }
    if (
      (existingSos.rejectedByVolunteerIds || []).some(
        (rejectedId) => String(rejectedId) === String(volRecord._id),
      )
    ) {
      return res.status(409).json({
        message: "You have already dismissed this SOS request.",
      });
    }

    const claimedVolunteer = await claimVolunteerForSOS(volRecord, id);
    if (!claimedVolunteer) {
      return res.status(409).json({
        message: "You are already assigned to another SOS or are unavailable.",
      });
    }
    claimedVolunteerId = String(claimedVolunteer._id);

    const updateFields = {
      volunteerId: claimedVolunteerId,
      volunteerName: claimedVolunteer.name || "Responding Volunteer",
      volunteerEmail: claimedVolunteer.email || "",
      volunteerPhone: claimedVolunteer.contact_no || "",
      volunteerPhoto: claimedVolunteer.profile_photo || null,
      volunteerLat: Number(volunteerLat),
      volunteerLng: Number(volunteerLng),
      volunteerAccuracy:
        volunteerAccuracy == null ? null : Number(volunteerAccuracy),
      volunteerLocationShared: true,
      status: "Approved",
      acceptedAt: existingSos.acceptedAt || now,
      assignedAt: existingSos.assignedAt || now,
      updatedAt: now,
    };

    const dist = calculateHaversineDistance(
      existingSos.womanLat,
      existingSos.womanLng,
      Number(volunteerLat),
      Number(volunteerLng),
    );
    updateFields.distance = dist.text;
    updateFields.distanceMeters = dist.meters;

    // Atomic check: only one volunteer can approve a Pending SOS.
    const sos = await sosAlert.findOneAndUpdate(
      { _id: id, status: "Pending" },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!sos) {
      await releaseVolunteerSOSClaim(claimedVolunteerId, id);
      claimedVolunteerId = null;
      return res.status(409).json({
        message: "Another volunteer has already accepted this SOS.",
      });
    }
    assignmentCommitted = true;

    if (io) {
      io.to(`sos_${id}`).emit("sos_approved", sos);
      io.to(`sos_${id}`).emit("sos_status_changed", sos);
      io.to("volunteers_channel").emit("sos_updated", sos);
    }

    await notifyTrustedContactsOfVolunteerAssignment(sos);

    return res.status(200).json({
      message:
        "SOS request approved! You are assigned as the responding volunteer.",
      sos,
    });
  } catch (error) {
    if (claimedVolunteerId && !assignmentCommitted) {
      await releaseVolunteerSOSClaim(claimedVolunteerId, req.params.id);
    }
    console.error("Error approving SOS:", error);

    return res.status(500).json({
      message: "Failed to approve SOS request.",
    });
  }
});

// 6. VOLUNTEER DISMISSES AN SOS FOR THEMSELVES
app.put("/api/sos/reject/:id", requireVolunteerSession, async (req, res) => {
  try {
    const { id } = req.params;
    const volunteerId = String(req.volunteerId);

    let sos = await sosAlert.findOneAndUpdate(
      { _id: id, status: "Pending" },
      {
        $addToSet: { rejectedByVolunteerIds: volunteerId },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" },
    );

    if (!sos) {
      sos = await sosAlert.findById(id);
      if (!sos) {
        return res.status(404).json({ message: "SOS request not found." });
      }
      return res.status(409).json({
        message: "Only pending SOS requests can be dismissed.",
      });
    }

    if (io) {
      io.to("volunteers_channel").emit("sos_rejected", {
        sosId: id,
        volunteerId,
      });
    }

    return res.status(200).json({
      message:
        "SOS request dismissed from your response queue. It remains available to other volunteers.",
      sos,
    });
  } catch (error) {
    console.error("Error dismissing SOS request:", error);
    return res.status(500).json({ message: "Failed to dismiss SOS request." });
  }
});

// 7. VOLUNTEER UPDATES LIVE LOCATION
app.put(
  "/api/sos/update-volunteer-location/:id",
  requireVolunteerSession,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { volunteerLat, volunteerLng, volunteerAccuracy } = req.body;

      if (
        !isValidGeoCoordinates(volunteerLat, volunteerLng) ||
        !isValidGeoAccuracy(volunteerAccuracy)
      ) {
        return res
          .status(400)
          .json({ message: "Valid volunteer coordinates are required." });
      }

      const sos = await sosAlert.findById(id);
      if (!sos) {
        return res.status(404).json({ message: "SOS request not found." });
      }
      if (String(sos.volunteerId) !== String(req.volunteerId)) {
        return res.status(403).json({
          message: "You are not assigned to this SOS request.",
        });
      }

      sos.volunteerLat = Number(volunteerLat);
      sos.volunteerLng = Number(volunteerLng);
      if (volunteerAccuracy != null)
        sos.volunteerAccuracy = Number(volunteerAccuracy);
      sos.volunteerLocationShared = true;
      if (sos.status === "Approved") {
        sos.status = "Active";
      }
      sos.updatedAt = new Date();

      const dist = calculateHaversineDistance(
        sos.womanLat,
        sos.womanLng,
        sos.volunteerLat,
        sos.volunteerLng,
      );
      sos.distance = dist.text;
      sos.distanceMeters = dist.meters;

      await sos.save();

      if (io) {
        io.to(`sos_${id}`).emit("volunteer_location_updated", {
          sosId: id,
          volunteerLat: sos.volunteerLat,
          volunteerLng: sos.volunteerLng,
          volunteerAccuracy: sos.volunteerAccuracy,
          distance: sos.distance,
          distanceMeters: sos.distanceMeters,
          status: sos.status,
          sos,
        });
        io.to("volunteers_channel").emit("sos_updated", sos);
      }

      res.status(200).json({
        message: "Volunteer location updated successfully.",
        sos,
      });
    } catch (error) {
      console.error("Error updating volunteer location:", error);
      res.status(500).json({ message: "Failed to update volunteer location." });
    }
  },
);

// 8. WOMAN UPDATES LIVE LOCATION
app.put(
  "/api/sos/update-woman-location/:id",
  requireWomanSession,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { womanLat, womanLng, womanAccuracy, womanAddress } = req.body;

      if (
        !isValidGeoCoordinates(womanLat, womanLng) ||
        !isValidGeoAccuracy(womanAccuracy)
      ) {
        return res
          .status(400)
          .json({ message: "Valid woman coordinates are required." });
      }

      const sos = await sosAlert.findById(id);
      if (!sos) {
        return res.status(404).json({ message: "SOS request not found." });
      }
      if (String(sos.womanId) !== String(req.womanId)) {
        return res.status(403).json({
          message: "You are not authorized to update this SOS request.",
        });
      }

      sos.womanLat = Number(womanLat);
      sos.womanLng = Number(womanLng);
      if (womanAccuracy != null) sos.womanAccuracy = Number(womanAccuracy);
      if (womanAddress) sos.womanAddress = womanAddress;
      sos.updatedAt = new Date();

      if (sos.volunteerLat !== null && sos.volunteerLng !== null) {
        const dist = calculateHaversineDistance(
          sos.womanLat,
          sos.womanLng,
          sos.volunteerLat,
          sos.volunteerLng,
        );
        sos.distance = dist.text;
        sos.distanceMeters = dist.meters;
      }

      await sos.save();

      if (io) {
        io.to(`sos_${id}`).emit("woman_location_updated", {
          sosId: id,
          womanLat: sos.womanLat,
          womanLng: sos.womanLng,
          womanAccuracy: sos.womanAccuracy,
          womanAddress: sos.womanAddress,
          distance: sos.distance,
          distanceMeters: sos.distanceMeters,
          sos,
        });
        io.to("volunteers_channel").emit("sos_updated", sos);
      }

      res.status(200).json({
        message: "Woman live location updated successfully.",
        sos,
      });
    } catch (error) {
      console.error("Error updating woman location:", error);
      res.status(500).json({ message: "Failed to update woman location." });
    }
  },
);

// 9. RESOLVE SOS (Emergency handled / safe)
app.put("/api/sos/resolve/:id", requireSOSSession, async (req, res) => {
  try {
    const { id } = req.params;
    const sos = await sosAlert.findById(id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }

    const { role, userId } = req.sosSession;
    const isAssignedVolunteer =
      role === "volunteer" && String(sos.volunteerId) === String(userId);
    const isWomanUser =
      role === "woman" && String(sos.womanId) === String(userId);

    if (!isAssignedVolunteer && !isWomanUser) {
      return res.status(403).json({
        message: "You are not authorized to resolve this SOS request.",
      });
    }

    if (!["Approved", "Active", "Pending"].includes(sos.status)) {
      return res.status(409).json({
        message: "Only an active SOS request can be resolved.",
      });
    }

    sos.status = "Resolved";
    sos.resolvedAt = new Date();
    sos.updatedAt = new Date();
    await sos.save();
    await releaseVolunteerSOSClaim(sos.volunteerId, sos._id);

    if (io) {
      io.to(`sos_${id}`).emit("sos_resolved", sos);
      io.to(`sos_${id}`).emit("sos_status_changed", sos);
      io.to("volunteers_channel").emit("sos_updated", sos);
    }

    try {
      const contacts = await trustedContact.find({ womanId: sos.womanId });
      const recipientEmails = contacts
        .map((contact) => (contact.email || "").trim())
        .filter((email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

      if (recipientEmails.length > 0) {
        googleMailService
          .sendSOSResolvedEmail({
            recipients: recipientEmails,
            womanName: sos.womanName,
            womanPhone: sos.womanPhone,
            womanAddress: sos.womanAddress,
            womanLat: sos.womanLat,
            womanLng: sos.womanLng,
            emergencyType: sos.emergencyType,
            resolvedBy: isAssignedVolunteer
              ? "the responding volunteer"
              : "the woman user",
            volunteerName: sos.volunteerName,
          })
          .then((mailRes) => {
            if (mailRes?.preview) {
              console.log(
                `ℹ️ SOS resolved email preview logged for trusted contacts of ${sos.womanName}`,
              );
            } else if (mailRes?.success) {
              console.log(
                `✅ SOS resolved email sent to ${recipientEmails.length} trusted contact(s) of ${sos.womanName}`,
              );
            } else {
              console.warn(
                `⚠️ SOS resolved email was not sent for ${sos.womanName}: ${mailRes?.reason || "Unknown mail service response."}`,
              );
            }
          })
          .catch((mailError) => {
            console.error(
              "❌ Failed to send SOS resolved email to trusted contacts:",
              mailError.message,
            );
          });
      } else {
        console.warn(
          `⚠️ No valid trusted-contact email addresses are configured for ${sos.womanName}.`,
        );
      }
    } catch (mailError) {
      console.error(
        "Error looking up trusted contacts for SOS resolved email:",
        mailError,
      );
    }

    res.status(200).json({
      message: "SOS marked as Resolved successfully.",
      sos,
    });
  } catch (error) {
    console.error("Error resolving SOS:", error);
    res.status(500).json({ message: "Failed to resolve SOS." });
  }
});

// 10. CANCEL SOS (User cancelled)
app.put("/api/sos/cancel/:id", requireWomanSession, async (req, res) => {
  try {
    const { id } = req.params;
    const sos = await sosAlert.findById(id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }
    if (String(sos.womanId) !== String(req.womanId)) {
      return res.status(403).json({
        message: "You are not authorized to cancel this SOS request.",
      });
    }

    sos.status = "Cancelled";
    sos.updatedAt = new Date();
    await sos.save();
    await releaseVolunteerSOSClaim(sos.volunteerId, sos._id);

    if (io) {
      io.to(`sos_${id}`).emit("sos_cancelled", sos);
      io.to(`sos_${id}`).emit("sos_status_changed", sos);
      io.to("volunteers_channel").emit("sos_updated", sos);
    }

    res.status(200).json({
      message: "SOS Alert cancelled.",
      sos,
    });
  } catch (error) {
    console.error("Error cancelling SOS:", error);
    res.status(500).json({ message: "Failed to cancel SOS." });
  }
});

// My Responses API for volunteer
app.get("/api/sos/my-responses/:volunteerId", async (req, res) => {
  try {
    const { volunteerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid volunteer ID",
      });
    }

    const responses = await sosAlert
      .find({
        $or: [
          { volunteerId, status: "Resolved" },
          {
            rejectedByVolunteerIds: volunteerId,
            status: { $ne: "Cancelled" },
          },
        ],
      })
      .sort({ updatedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: responses.length,
      responses,
    });
  } catch (error) {
    console.error("Error fetching volunteer responses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch responses",
    });
  }
});

//Trust score function for volunteer
async function calculateVolunteerTrustScore(volunteerId) {
  const acceptedSOS = await sosAlert
    .find({
      volunteerId,
      acceptedAt: { $ne: null },
    })
    .select("status createdAt acceptedAt resolvedAt");

  // Factor 1: Successful Resolution (40 points)
  const resolvedSOS = acceptedSOS.filter(
    (sos) => sos.status === "Resolved" && sos.resolvedAt,
  );

  const acceptedCount = acceptedSOS.length;
  const resolvedCount = resolvedSOS.length;
  const successRate = acceptedCount ? (resolvedCount / acceptedCount) * 100 : 0;

  const resolutionScore = (successRate / 100) * 40;
  // Factor 2: Response Speed (35 points)
  const responseTimes = acceptedSOS
    .filter((sos) => sos.createdAt && sos.acceptedAt)
    .map((sos) => (new Date(sos.acceptedAt) - new Date(sos.createdAt)) / 60000)
    .filter((minutes) => minutes >= 0);

  const averageResponseTime = responseTimes.length
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : null;
  let responseScore = 0;
  if (averageResponseTime !== null) {
    if (averageResponseTime <= 1) responseScore = 35;
    else if (averageResponseTime <= 2) responseScore = 30;
    else if (averageResponseTime <= 3) responseScore = 25;
    else if (averageResponseTime <= 5) responseScore = 20;
    else if (averageResponseTime <= 10) responseScore = 10;
    else if (averageResponseTime <= 15) responseScore = 5;
  }

  // Factor 3: Consistency (25 points)
  const uniqueDays = new Set(
    resolvedSOS.map((sos) =>
      new Date(sos.resolvedAt).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }),
    ),
  );

  const consistencyDays = uniqueDays.size;
  const consistencyTarget = 10;
  const consistencyProgress = Math.min(
    (consistencyDays / consistencyTarget) * 100,
    100,
  );
  const consistencyScore = (consistencyProgress / 100) * 25;

  // Final Trust Score
  const trustScore = Math.round(
    resolutionScore + responseScore + consistencyScore,
  );
  let trustLevel;
  if (trustScore >= 80) trustLevel = "Highly Trusted";
  else if (trustScore >= 60) trustLevel = "Trusted";
  else if (trustScore >= 40) trustLevel = "Developing";
  else trustLevel = "Needs Improvement";
  return {
    trustScore,
    trustLevel,
    performance: {
      acceptedRequests: acceptedCount,
      resolvedRequests: resolvedCount,
      successRate: Number(successRate.toFixed(1)),
      averageResponseTime:
        averageResponseTime === null
          ? null
          : Number(averageResponseTime.toFixed(1)),
    },
    factors: {
      resolution: {
        score: Number(resolutionScore.toFixed(2)),
        maxScore: 40,
      },
      responseSpeed: {
        score: responseScore,
        maxScore: 35,
      },
      consistency: {
        score: Number(consistencyScore.toFixed(2)),
        maxScore: 25,
        differentDays: consistencyDays,
        targetDays: consistencyTarget,
        progress: Math.round(consistencyProgress),
      },
    },
  };
}

// Trust Score API for volunteer
app.get("/api/sos/trust-score/:volunteerId", async (req, res) => {
  try {
    const { volunteerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({
        message: "Invalid volunteer ID.",
      });
    }
    const result = await calculateVolunteerTrustScore(volunteerId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Trust Score Error:", error);
    return res.status(500).json({
      message: "Failed to calculate Trust Score.",
    });
  }
});

const badgeDisplayNames = {
  "helping-hand": "Helping Hand",
  "fast-responder": "Fast Responder",
  "emergency-champion": "Emergency Champion",
  "consistent-guardian": "Consistent Guardian",
  "trusted-volunteer": "Trusted Volunteer",
};

//Helper for volunteer badges
async function updateVolunteerBadges(volunteerId) {
  const id = String(volunteerId || "").trim();
  if (!id) {
    throw new Error("Volunteer ID is required.");
  }

  // Get all SOS requests assigned to this volunteer.
  const requests = await sosAlert
    .find({
      volunteerId: id,
      acceptedAt: { $ne: null },
    })
    .select("status createdAt acceptedAt resolvedAt");

  const resolved = requests.filter(
    (s) => s.status === "Resolved" && s.resolvedAt,
  );

  // 1. Helping Hand and 3. Emergency Champion
  const resolvedCount = resolved.length;

  // Volunteer Milestones for activity history
  const milestones = [
    {
      count: 1,
      title: "First SOS Resolved",
      description: "You successfully resolved your first SOS request.",
    },
    {
      count: 5,
      title: "5 SOS Requests Resolved",
      description: "You have successfully resolved 5 SOS requests.",
    },
    {
      count: 10,
      title: "10 SOS Requests Resolved",
      description: "You have successfully resolved 10 SOS requests.",
    },
    {
      count: 25,
      title: "25 SOS Requests Resolved",
      description: "You have successfully resolved 25 SOS requests.",
    },
  ];

  for (const milestone of milestones) {
    if (resolvedCount >= milestone.count) {
      const existingMilestone = await volunteerActivity.findOne({
        volunteerId: id,
        type: "VOLUNTEER_MILESTONE",
      });

      if (!existingMilestone) {
        await volunteerActivity.create({
          volunteerId: id,
          type: "VOLUNTEER_MILESTONE",
          title: milestone.title,
          description: milestone.description,
        });
      }
    }
  }

  // 2. Fast Responder — same average calculation as Trust Score.
  const responseTimes = requests
    .filter((s) => s.createdAt && s.acceptedAt)
    .map((s) => (new Date(s.acceptedAt) - new Date(s.createdAt)) / 60000)
    .filter((minutes) => minutes >= 0);

  const averageResponseTime = responseTimes.length
    ? responseTimes.reduce((sum, minutes) => sum + minutes, 0) /
      responseTimes.length
    : null;

  // 4. Consistent Guardian — distinct India-time resolution days.
  const resolutionDays = new Set(
    resolved.map((s) =>
      new Date(s.resolvedAt).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      }),
    ),
  );

  // 5. Trusted Volunteer — reuse the existing Trust Score API logic.
  const trustScoreData = await calculateVolunteerTrustScore(id);
  const trustScore = trustScoreData.trustScore;

  // Trust Score Milestones for acitivity history
  const trustMilestones = [50, 70, 80, 90];

  for (const milestone of trustMilestones) {
    if (trustScore >= milestone) {
      const existingMilestone = await volunteerActivity.findOne({
        volunteerId: id,
        type: "TRUST_SCORE_MILESTONE",
      });

      if (!existingMilestone) {
        await volunteerActivity.create({
          volunteerId: id,
          type: "TRUST_SCORE_MILESTONE",
          title: `Trust Score ${milestone} Achieved`,
          description: `Your Trust Score has reached ${milestone} or higher.`,
        });
      }
    }
  }

  const eligibleBadges = [];
  if (resolvedCount >= 1) {
    eligibleBadges.push("helping-hand");
  }
  if (averageResponseTime !== null && averageResponseTime <= 3) {
    eligibleBadges.push("fast-responder");
  }
  if (resolvedCount >= 25) {
    eligibleBadges.push("emergency-champion");
  }
  if (resolutionDays.size >= 10) {
    eligibleBadges.push("consistent-guardian");
  }
  if (trustScore >= 80) {
    eligibleBadges.push("trusted-volunteer");
  }

  // Insert only newly earned badges and log their activity.
  for (const badgeKey of eligibleBadges) {
    const existingBadge = await badgeAchievement.findOne({
      volunteerId: id,
      badgeKey,
    });

    if (!existingBadge) {
      await badgeAchievement.create({
        volunteerId: id,
        badgeKey,
        earnedAt: new Date(),
      });

      await volunteerActivity.create({
        volunteerId: id,
        type: "BADGE_EARNED",
        title: `${badgeDisplayNames[badgeKey]} Badge Earned`,
        description: `You earned the ${badgeDisplayNames[badgeKey]} badge.`,
      });
    }
  }

  return {
    resolvedCount,
    averageResponseTime:
      averageResponseTime === null
        ? null
        : Number(averageResponseTime.toFixed(1)),
    differentDays: resolutionDays.size,
    trustScore,
    earnedBadges: await badgeAchievement
      .find({
        volunteerId: id,
      })
      .select("badgeKey earnedAt -_id"),
  };
}

//get volunteer badges for particular volunteer
app.get("/api/volunteer-badges/:volunteerId", async (req, res) => {
  try {
    const { volunteerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({
        message: "Invalid volunteer ID.",
      });
    }

    const stats = await updateVolunteerBadges(volunteerId);
    const badgeDetails = [
      {
        key: "helping-hand",
        name: "Helping Hand",
        requirement: "Resolve your first SOS request.",
        progress: Math.min(stats.resolvedCount, 1),
        target: 1,
      },
      {
        key: "fast-responder",
        name: "Fast Responder",
        requirement: "Maintain an average response time of 3 minutes or less.",
        averageResponseTime: stats.averageResponseTime,
        target: 3,
      },
      {
        key: "emergency-champion",
        name: "Emergency Champion",
        requirement: "Successfully resolve 25 SOS requests.",
        progress: Math.min(stats.resolvedCount, 25),
        target: 25,
      },
      {
        key: "consistent-guardian",
        name: "Consistent Guardian",
        requirement: "Resolve SOS requests on 10 different days.",
        progress: Math.min(stats.differentDays, 10),
        target: 10,
      },
      {
        key: "trusted-volunteer",
        name: "Trusted Volunteer",
        requirement: "Reach a Trust Score of 80 or higher.",
        progress: Math.min(stats.trustScore, 80),
        target: 80,
      },
    ];

    const earnedMap = new Map(
      stats.earnedBadges.map((badge) => [badge.badgeKey, badge.earnedAt]),
    );

    const badges = badgeDetails.map((badge) => ({
      ...badge,
      earned: earnedMap.has(badge.key),
      earnedAt: earnedMap.get(badge.key) || null,
    }));

    return res.status(200).json({
      trustScore: stats.trustScore,
      badges,
    });
  } catch (error) {
    console.error("My Badges Error:", error);
    return res.status(500).json({
      message: "Failed to load volunteer badges.",
    });
  }
});

//Admin SOS related all APIs
//Get All sos API for admin
app.get("/api/admin/sos/all", requireAdminSession, async (req, res) => {
  try {
    const requests = await sosAlert.find().sort({ createdAt: -1 });
    const pendingCount = requests.filter(
      (request) => request.status === "Pending",
    ).length;
    const activeCount = requests.filter((request) =>
      ["Approved", "Active"].includes(request.status),
    ).length;

    return res.status(200).json({
      requests,
      pendingCount,
      activeCount,
      totalCount: requests.length,
    });
  } catch (error) {
    console.error("Error getting admin SOS requests:", error);
    return res.status(500).json({
      message: "Failed to retrieve admin SOS requests.",
    });
  }
});

//Dashboard summary for admin
app.get(
  "/api/admin/dashboard/summary",
  requireAdminSession,
  async (req, res) => {
    try {
      const openSOSStatuses = ["Pending", "Approved", "Active"];
      const attentionCutoff = new Date(Date.now() - 60_000);
      const [
        womenUsers,
        totalVolunteers,
        approvedVolunteers,
        pendingVolunteers,
        totalIncidentReports,
        openSOS,
        unassignedSOS,
        pendingIncidentReports,
        totalArticles,
        publishedArticles,
        draftArticles,
        recentSOS,
      ] = await Promise.all([
        womanUser.countDocuments(),
        volunteer.countDocuments(),
        volunteer.countDocuments({ status: "Approved" }),
        volunteer.countDocuments({ status: "Pending" }),
        incidentReport.countDocuments(),
        sosAlert.countDocuments({ status: { $in: openSOSStatuses } }),
        sosAlert.countDocuments({
          status: "Pending",
          createdAt: { $lte: attentionCutoff },
        }),
        incidentReport.countDocuments({ status: "Under Review" }),
        safetyArticle.countDocuments(),
        safetyArticle.countDocuments({ status: "Published" }),
        safetyArticle.countDocuments({ status: "Draft" }),
        sosAlert
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("womanName volunteerName emergencyType status createdAt"),
      ]);

      return res.status(200).json({
        womenUsers,
        totalVolunteers,
        approvedVolunteers,
        pendingVolunteers,
        totalIncidentReports,
        openSOS,
        unassignedSOS,
        pendingIncidentReports,
        articles: {
          total: totalArticles,
          published: publishedArticles,
          drafts: draftArticles,
        },
        recentSOS,
      });
    } catch (error) {
      console.error("Error getting admin dashboard summary:", error);
      return res.status(500).json({
        message: "Failed to retrieve admin dashboard summary.",
      });
    }
  },
);

//Dashboard overview for admin
app.get(
  "/api/admin/dashboard/sos-overview",
  requireAdminSession,
  async (req, res) => {
    try {
      const indiaOffset = 330 * 60 * 1000;
      const indiaNow = new Date(Date.now() + indiaOffset);
      const currentMonthStart = new Date(
        Date.UTC(indiaNow.getUTCFullYear(), indiaNow.getUTCMonth(), 1),
      );
      const firstMonth = new Date(currentMonthStart);
      firstMonth.setUTCMonth(firstMonth.getUTCMonth() - 11);
      const startAt = new Date(firstMonth.getTime() - indiaOffset);
      const endAt = new Date();

      const [createdCounts, resolvedCounts, totalResolved] = await Promise.all([
        sosAlert.aggregate([
          {
            $match: {
              createdAt: { $gte: startAt, $lte: endAt, $type: "date" },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$createdAt",
                  timezone: "Asia/Kolkata",
                },
              },
              count: { $sum: 1 },
            },
          },
        ]),
        sosAlert.aggregate([
          {
            $match: {
              status: "Resolved",
              resolvedAt: { $gte: startAt, $lte: endAt, $type: "date" },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$resolvedAt",
                  timezone: "Asia/Kolkata",
                },
              },
              count: { $sum: 1 },
            },
          },
        ]),
        sosAlert.countDocuments({ status: "Resolved" }),
      ]);
      const createdByMonth = new Map(
        createdCounts.map(({ _id, count }) => [_id, count]),
      );
      const resolvedByMonth = new Map(
        resolvedCounts.map(({ _id, count }) => [_id, count]),
      );
      const data = Array.from({ length: 12 }, (_, index) => {
        const month = new Date(firstMonth);
        month.setUTCMonth(month.getUTCMonth() + index);
        const key = `${month.getUTCFullYear()}-${String(
          month.getUTCMonth() + 1,
        ).padStart(2, "0")}`;

        return {
          month: month.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
            timeZone: "UTC",
          }),
          requests: createdByMonth.get(key) || 0,
          resolved: resolvedByMonth.get(key) || 0,
        };
      });

      return res.status(200).json({ totalResolved, data });
    } catch (error) {
      console.error("Error getting admin SOS overview:", error);
      return res.status(500).json({
        message: "Failed to retrieve admin SOS overview.",
      });
    }
  },
);

//Dashboard women-growth for admin
app.get(
  "/api/admin/dashboard/women-growth",
  requireAdminSession,
  async (req, res) => {
    const period = req.query.period || "monthly";
    const periods = ["daily", "weekly", "monthly", "yearly"];

    if (!periods.includes(period)) {
      return res.status(400).json({
        message:
          "Women growth period must be daily, weekly, monthly, or yearly.",
      });
    }

    try {
      const timezone = "Asia/Kolkata";
      const indiaOffset = 330 * 60 * 1000;
      const indiaNow = new Date(Date.now() + indiaOffset);
      const currentDate = new Date(
        Date.UTC(
          indiaNow.getUTCFullYear(),
          indiaNow.getUTCMonth(),
          indiaNow.getUTCDate(),
        ),
      );
      let startDate;
      let dateFormat;
      let buckets;

      if (period === "daily") {
        startDate = new Date(currentDate);
        startDate.setUTCDate(startDate.getUTCDate() - 29);
        dateFormat = "%Y-%m-%d";
        buckets = Array.from({ length: 30 }, (_, index) => {
          const date = new Date(startDate);
          date.setUTCDate(date.getUTCDate() + index);
          const key = date.toISOString().slice(0, 10);

          return {
            key,
            label: date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              timeZone: "UTC",
            }),
          };
        });
      } else if (period === "weekly") {
        const currentWeekday = currentDate.getUTCDay() || 7;
        const currentWeekStart = new Date(currentDate);
        currentWeekStart.setUTCDate(
          currentWeekStart.getUTCDate() - currentWeekday + 1,
        );
        startDate = new Date(currentWeekStart);
        startDate.setUTCDate(startDate.getUTCDate() - 11 * 7);
        dateFormat = "%G-W%V";
        buckets = Array.from({ length: 12 }, (_, index) => {
          const weekStart = new Date(startDate);
          weekStart.setUTCDate(weekStart.getUTCDate() + index * 7);
          const thursday = new Date(weekStart);
          thursday.setUTCDate(thursday.getUTCDate() + 3);
          const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
          const week = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);

          return {
            key: `${thursday.getUTCFullYear()}-W${String(week).padStart(2, "0")}`,
            label: weekStart.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              timeZone: "UTC",
            }),
          };
        });
      } else if (period === "monthly") {
        const currentMonthStart = new Date(
          Date.UTC(indiaNow.getUTCFullYear(), indiaNow.getUTCMonth(), 1),
        );
        startDate = new Date(currentMonthStart);
        startDate.setUTCMonth(startDate.getUTCMonth() - 11);
        dateFormat = "%Y-%m";
        buckets = Array.from({ length: 12 }, (_, index) => {
          const date = new Date(startDate);
          date.setUTCMonth(date.getUTCMonth() + index);
          const key = `${date.getUTCFullYear()}-${String(
            date.getUTCMonth() + 1,
          ).padStart(2, "0")}`;

          return {
            key,
            label: date.toLocaleDateString("en-IN", {
              month: "short",
              year: "2-digit",
              timeZone: "UTC",
            }),
          };
        });
      } else {
        const firstRegistration = await womanUser
          .findOne({ createdAt: { $type: "date" } })
          .sort({ createdAt: 1 })
          .select("createdAt")
          .lean();
        const firstYear = firstRegistration
          ? new Date(
              new Date(firstRegistration.createdAt).getTime() + indiaOffset,
            ).getUTCFullYear()
          : indiaNow.getUTCFullYear();

        startDate = new Date(Date.UTC(firstYear, 0, 1));
        dateFormat = "%Y";
        buckets = Array.from(
          { length: indiaNow.getUTCFullYear() - firstYear + 1 },
          (_, index) => {
            const year = firstYear + index;
            return { key: String(year), label: String(year) };
          },
        );
      }

      const startAt = new Date(startDate.getTime() - indiaOffset);
      const endAt = new Date();
      const [registrationCounts, totalRegistrations] = await Promise.all([
        womanUser.aggregate([
          {
            $match: {
              createdAt: { $gte: startAt, $lte: endAt, $type: "date" },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: dateFormat,
                  date: "$createdAt",
                  timezone,
                },
              },
              registrations: { $sum: 1 },
            },
          },
        ]),
        womanUser.countDocuments({
          createdAt: { $gte: startAt, $lte: endAt, $type: "date" },
        }),
      ]);
      const countsByBucket = new Map(
        registrationCounts.map(({ _id, registrations }) => [
          _id,
          registrations,
        ]),
      );

      return res.status(200).json({
        period,
        totalRegistrations,
        data: buckets.map(({ key, label }) => ({
          label,
          registrations: countsByBucket.get(key) || 0,
        })),
      });
    } catch (error) {
      console.error("Error getting women registration growth:", error);
      return res.status(500).json({
        message: "Failed to retrieve women registration growth.",
      });
    }
  },
);

//Dashboard analytics for admin
app.get(
  "/api/admin/dashboard/analytics",
  requireAdminSession,
  async (req, res) => {
    const days = Number(req.query.days || 7);
    if (![7, 30, 90].includes(days)) {
      return res.status(400).json({
        message: "Dashboard analytics range must be 7, 30, or 90 days.",
      });
    }

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const dateFilter = { createdAt: { $gte: startDate } };
      const [sosStatuses, incidentStatuses] = await Promise.all([
        sosAlert.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        incidentReport.aggregate([
          { $match: dateFilter },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

      return res.status(200).json({
        days,
        sosStatuses: sosStatuses.map(({ _id, count }) => ({
          status: _id || "Unknown",
          count,
        })),
        incidentStatuses: incidentStatuses.map(({ _id, count }) => ({
          status: _id || "Unknown",
          count,
        })),
      });
    } catch (error) {
      console.error("Error getting admin dashboard analytics:", error);
      return res.status(500).json({
        message: "Failed to retrieve admin dashboard analytics.",
      });
    }
  },
);

//Availabale volunteer API for admin
app.get(
  "/api/admin/sos/:id/eligible-volunteers",
  requireAdminSession,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid SOS ID." });
      }

      const sos = await sosAlert.findById(id);
      if (!sos) {
        return res.status(404).json({ message: "SOS request not found." });
      }
      if (sos.status !== "Pending") {
        return res.status(409).json({
          message: "Only pending SOS requests can be assigned.",
        });
      }

      const createdAt = new Date(sos.createdAt).getTime();
      const eligibleAt = createdAt + 60_000;
      if (!Number.isFinite(createdAt)) {
        return res.status(409).json({
          message:
            "This SOS has no valid creation time and cannot be assigned.",
        });
      }
      if (Date.now() < eligibleAt) {
        return res.status(409).json({
          message:
            "Admin assignment is available 60 seconds after the SOS starts.",
          eligibleAt: new Date(eligibleAt).toISOString(),
        });
      }

      const busyVolunteerIds = new Set(
        (
          await sosAlert.distinct("volunteerId", {
            status: { $in: ["Approved", "Active"] },
            volunteerId: { $nin: [null, ""] },
          })
        ).map(String),
      );
      const rejectedVolunteerIds = new Set(
        (sos.rejectedByVolunteerIds || []).map(String),
      );
      const approvedVolunteers = await volunteer
        .find({ status: "Approved" })
        .select(
          "_id name contact_no serviceArea activeSOSId activeSOSLockExpiresAt",
        );
      const lockedVolunteers = approvedVolunteers.filter(
        (candidate) => candidate.activeSOSId,
      );
      const lockedSOSRecords = lockedVolunteers.length
        ? await sosAlert
            .find({
              _id: {
                $in: lockedVolunteers.map((candidate) => candidate.activeSOSId),
              },
            })
            .select("_id status volunteerId")
        : [];
      const lockedSOSById = new Map(
        lockedSOSRecords.map((record) => [String(record._id), record]),
      );

      await Promise.all(
        lockedVolunteers.map(async (candidate) => {
          const linkedSOS = lockedSOSById.get(String(candidate.activeSOSId));
          const isActiveAssignment =
            linkedSOS &&
            ["Approved", "Active"].includes(linkedSOS.status) &&
            String(linkedSOS.volunteerId) === String(candidate._id);
          const isCurrentReservation =
            linkedSOS?.status === "Pending" &&
            candidate.activeSOSLockExpiresAt &&
            candidate.activeSOSLockExpiresAt.getTime() > Date.now();

          if (!isActiveAssignment && !isCurrentReservation) {
            const released = await releaseVolunteerSOSClaim(
              candidate._id,
              candidate.activeSOSId,
            );
            if (released) candidate.activeSOSId = null;
          }
        }),
      );

      const availableVolunteers = approvedVolunteers
        .filter(
          (candidate) =>
            !candidate.activeSOSId &&
            !busyVolunteerIds.has(String(candidate._id)) &&
            !rejectedVolunteerIds.has(String(candidate._id)),
        )
        .map((candidate) => ({
          _id: String(candidate._id),
          name: candidate.name || "Volunteer",
          contact_no: candidate.contact_no || "",
          serviceArea: candidate.serviceArea || "",
          areaMatch: isServiceAreaMatch(
            candidate.serviceArea,
            sos.womanAddress,
          ),
        }))
        .sort(
          (first, second) =>
            Number(second.areaMatch) - Number(first.areaMatch) ||
            first.name.localeCompare(second.name),
        );

      const areaMatches = availableVolunteers.filter(
        (candidate) => candidate.areaMatch,
      );

      return res.status(200).json({
        volunteers: areaMatches.length > 0 ? areaMatches : availableVolunteers,
        hasAreaMatches: areaMatches.length > 0,
      });
    } catch (error) {
      console.error(
        "Error loading eligible volunteers for SOS assignment:",
        error,
      );
      return res.status(500).json({
        message: "Failed to load eligible volunteers.",
      });
    }
  },
);

//Assign volunteer API for admin
app.put("/api/admin/sos/:id/assign", requireAdminSession, async (req, res) => {
  let claimedVolunteerId = null;
  let assignmentCommitted = false;

  try {
    const { id } = req.params;
    const volunteerId = String(req.body?.volunteerId || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid SOS ID." });
    }
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res.status(400).json({ message: "Invalid volunteer ID." });
    }

    const sos = await sosAlert.findById(id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }
    if (sos.status !== "Pending") {
      return res.status(409).json({
        message: "This SOS is no longer pending and cannot be assigned.",
      });
    }

    const createdAt = new Date(sos.createdAt).getTime();
    if (!Number.isFinite(createdAt) || Date.now() < createdAt + 60_000) {
      return res.status(409).json({
        message:
          "Admin assignment is available 60 seconds after the SOS starts.",
      });
    }

    const volunteerRecord = await volunteer.findById(volunteerId);
    if (!volunteerRecord || volunteerRecord.status !== "Approved") {
      return res.status(409).json({
        message: "Only approved volunteers can be assigned to an SOS.",
      });
    }
    if (
      (sos.rejectedByVolunteerIds || []).some(
        (rejectedId) => String(rejectedId) === String(volunteerRecord._id),
      )
    ) {
      return res.status(409).json({
        message: "This volunteer has already dismissed this SOS.",
      });
    }

    const claimedVolunteer = await claimVolunteerForSOS(
      volunteerRecord,
      sos._id,
    );
    if (!claimedVolunteer) {
      return res.status(409).json({
        message: "This volunteer is no longer available for assignment.",
      });
    }
    claimedVolunteerId = String(claimedVolunteer._id);

    const now = new Date();
    const assignedSOS = await sosAlert.findOneAndUpdate(
      {
        _id: id,
        status: "Pending",
        createdAt: { $lte: new Date(now.getTime() - 60_000) },
      },
      {
        $set: {
          volunteerId: claimedVolunteerId,
          volunteerName: claimedVolunteer.name || "Volunteer",
          volunteerEmail: claimedVolunteer.email || "",
          volunteerPhone: claimedVolunteer.contact_no || "",
          volunteerPhoto: claimedVolunteer.profile_photo || null,
          assignedAt: now,
          updatedAt: now,
          status: "Approved",
        },
      },
      { new: true, runValidators: true },
    );

    if (!assignedSOS) {
      await releaseVolunteerSOSClaim(claimedVolunteerId, id);
      claimedVolunteerId = null;
      return res.status(409).json({
        message: "This SOS was updated by someone else and cannot be assigned.",
      });
    }
    assignmentCommitted = true;

    if (io) {
      io.to(`sos_${id}`).emit("sos_approved", assignedSOS);
      io.to(`sos_${id}`).emit("sos_status_changed", assignedSOS);
      io.to("volunteers_channel").emit("sos_updated", assignedSOS);
    }

    await notifyTrustedContactsOfVolunteerAssignment(assignedSOS);

    return res.status(200).json({
      message: "Volunteer assigned to the SOS successfully.",
      sos: assignedSOS,
    });
  } catch (error) {
    if (claimedVolunteerId && !assignmentCommitted) {
      await releaseVolunteerSOSClaim(claimedVolunteerId, req.params.id);
    }
    console.error("Error assigning volunteer to SOS:", error);
    return res.status(500).json({
      message: "Failed to assign volunteer to SOS.",
    });
  }
});

const PORT = 3000; //port number is set to 3000, this is the port on which the server will listen for requests.
server.listen(PORT, () =>
  console.log(`Server with Socket.IO running at http://localhost:${PORT}`),
); //server is listening on port 3000
