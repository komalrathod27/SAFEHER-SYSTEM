require("dotenv").config();
const express = require("express"); //express is node.js framewrok that is used to create server/API.
const http = require("http");
const mongoose = require("mongoose"); //mongoose is used to connect to mongodb database.
const cors = require("cors"); //cors is used to allow cross-origin requests between frontend and backend.
const bodyParser = require("body-parser"); //body-parser is used to parse(read) the body data.
const googleMailService = require("./services/googleMailService");
const smsService = require("./services/smsService");
const app = express(); //one express app is created to handle the requests and responses.
const server = http.createServer(app);

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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }),
);

//Trusted Contact schema
const trustedContact = new mongoose.model(
  "trustedContact",
  new mongoose.Schema({
    womanId: String,
    contactName: String,
    relationship: String,
    phoneNo: String,
    email: { type: String, default: "" },
    priority: String,
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
    status: { type: String, default: "Pending" },
  }),
);

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
admin.findOne({ email: "admin27@safeher.com" }).then(async (data) => {
  if (!data) {
    await admin.create({
      name: "Komal Rathod",
      email: "admin27@safeher.com",
      password: "komal@27",
    });
    console.log("Fixed admin account created");
  } else if (!data.name) {
    data.name = "Komal Rathod";
    await data.save();
    console.log("Admin name updated");
  }
});

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
app.post("/api/addsafetyarea", async (req, res) => {
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
app.put("/api/editsafetyarea/:areaId", async (req, res) => {
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
});

//Delete safety areas api for admin
app.delete("/api/deletesafetyarea/:areaId", async (req, res) => {
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
});

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
  incidentUpload.single("photo"),
  async (req, res) => {
    try {
      const {
        womanId,
        incidentType,
        description,
        incidentDate,
        incidentTime,
        location,
      } = req.body;

      //validation
      if (
        !womanId ||
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
        womanId: womanId,
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
app.get("/api/getmyincidentreports/:womanId", async (req, res) => {
  try {
    const { womanId } = req.params;
    const reports = await incidentReport
      .find({ womanId: womanId })
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching incident reports.",
    });
  }
});

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
app.get("/api/getadminincidentreports", async (req, res) => {
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
});

//Verify incident report status API for admin
app.put("/api/verifyincidentreport/:id", async (req, res) => {
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
});

//Reject incident report status API for admin
app.put("/api/rejectincidentreport/:id", async (req, res) => {
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
});

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

//Get all safety articles
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
app.delete("/api/deletesafetyarticle/:_id", async (req, res) => {
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
});

// Registration API for woman user
app.post("/api/womanregister", multi, async (req, res) => {
  const image = req.files?.profilephoto?.[0]?.filename; //ye line uploaded file ka naam get kar rahi hai. agar file upload nahi hui hai to image variable undefined hoga.
  const exists = await womanUser.findOne({ email: req.body.email }); //ye line mongodb me check kar rahi hai ki email already exist karta hai ya nahi. agar email already exist karta hai to exists variable me user ka data aa jayega, otherwise null aa jayega.
  if (exists) {
    //agar email already exist karta hai to error response send kar raha hai.
    return res.status(400).json({ message: "Email already exists" });
  }
  await womanUser.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    gender: req.body.gender,
    dob: req.body.dob,
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    address: req.body.address,
    profile_photo: image,
  }); //ye line mongodb me new woman user create kar rahi hai. req.body me frontend se aayi hui data hai aur image variable me uploaded file ka naam hai.
  res.json({
    message: "Woman user registered successfully",
  }); //response send kar raha hai ki woman user registered successfully. ye response frontend me show hoga.
});

//Login API for woman user //
app.post("/api/womanlogin", async (req, res) => {
  const { identifier, password } = req.body; //ye line frontend se aayi hui data ko destructure kar rahi hai. identifier me username/email aur password me password aayega.
  if (!identifier || !password) {
    //agar identifier ya password empty hai to error response send kar raha hai.
    return res.status(400).send({
      message: "Email and password are required.",
    });
  }
  const user = await womanUser.findOne({
    email: identifier,
    password: password,
  }); //ye line mongodb me check kar rahi hai ki email aur password match karta hai ya nahi. agar match karta hai to user variable me user ka data aa jayega, otherwise null aa jayega.

  if (user) {
    return res.status(200).send(user); //agar user exist karta hai to success response send kar raha hai. ye response frontend me show hoga.
  } else {
    return res.status(400).send({
      message: "Invalid email or password.",
    }); //agar user exist nahi karta hai to error response send kar raha hai. ye response frontend me show hoga.
  }
});

//Trusted Contact API
app.post("/api/addTrustedContact", async (req, res) => {
  try {
    const { womanId, contactName, relationship, phoneNo, email, priority } = req.body;

    if (!womanId || !contactName || !relationship || !phoneNo || !priority) {
      return res.status(400).json({
        message: "All trusted contact fields are required.",
      });
    }

    if (!/^[0-9]{10}$/.test(phoneNo)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits.",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const exists = await trustedContact.findOne({
      womanId: req.body.womanId,
      phoneNo: req.body.phoneNo,
    });

    if (exists) {
      return res.status(400).json({
        message: "This contact number is already added.",
      });
    }

    const contact = await trustedContact.create({
      womanId: womanId,
      contactName: contactName.trim(),
      relationship: relationship,
      phoneNo: phoneNo,
      email: email ? email.trim().toLowerCase() : "",
      priority: priority,
    });

    res.status(201).json({
      message: "Trusted Contact Added Successfully",
      contact: contact,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while adding trusted contact",
    });
  }
});

//Get Trusted Contacts API for fetching  contacts
app.get("/api/getTrustedContacts/:womanId", async (req, res) => {
  try {
    const { womanId } = req.params;
    const contacts = await trustedContact
      .find({ womanId: womanId })
      .sort({ priority: 1 });
    res.status(200).json(contacts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching trusted contacts.",
    });
  }
});

//Delete Trusted Contact API
app.delete("/api/deleteTrustedContact/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const contact = await trustedContact.findById(_id);
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
});

//Edit Trusted Contact API
app.put("/api/editTrustedContact/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { contactName, relationship, phoneNo, email, priority } = req.body;

    // Validation
    if (!contactName || !relationship || !phoneNo || !priority) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    //phone number validation
    if (!/^[0-9]{10}$/.test(phoneNo)) {
      return res.status(400).json({
        message: "Phone number must be a 10-digit number.",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    // Check if the contact exists
    const contact = await trustedContact.findById(_id);
    if (!contact) {
      return res.status(404).json({
        message: "Trusted contact not found.",
      });
    }

    // Check if the new phone number already exists for the same womanId
    const duplicate = await trustedContact.findOne({
      womanId: contact.womanId,
      phoneNo: phoneNo,
      _id: { $ne: _id }, // Exclude the current contact from the search
    });

    if (duplicate) {
      return res.status(400).json({
        message: "This contact number is already added.",
      });
    }

    // Update the contact
    contact.contactName = contactName.trim();
    contact.relationship = relationship;
    contact.phoneNo = phoneNo;
    if (email !== undefined) {
      contact.email = email ? email.trim().toLowerCase() : "";
    }
    contact.priority = priority;

    await contact.save();
    res.status(200).json({
      message: "Trusted contact updated successfully.",
      contact: contact,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while updating trusted contact.",
    });
  }
});

//Registration API for Volunteer
app.post("/api/volunteerregister", multi1, async (req, res) => {
  const image = req.files?.profilePhoto?.[0]?.filename;
  const image1 = req.files?.idProof?.[0]?.filename;
  const exists = await volunteer.findOne({ email: req.body.email });
  if (exists) {
    return res.status(400).json({ message: "Email already exists" });
  }
  await volunteer.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
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
    email: email,
    password: password,
  });

  if (!user) {
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
    return res.status(200).send({
      status: "Approved",
      _id: user._id,
      name: user.name,
      email: user.email,
      contact_no: user.contact_no || "",
      profile_photo: user.profile_photo || "",
    });
  }

  return res.status(403).send({
    status: "Unknown",
    message:
      "Your account status could not be verified. Please contact the administrator.",
  });
});

//Get volunteer data into admin
app.get("/api/getvolunteer", async (req, res) => {
  res.json(await volunteer.find());
});

//get volunteer data using particular id
app.get("/api/getvolunteerdetails/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const data = await volunteer.findById(_id);
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
});

//change approve status for volunteer
app.put("/api/approvestatus/:_id", async (req, res) => {
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
app.put("/api/rejectstatus/:_id", async (req, res) => {
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
app.get("/api/getvolunteerprofile/:_id", async (req, res) => {
  try {
    const volunteerData = await volunteer
      .findById(req.params._id)
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
});

// Update Volunteer Profile
app.put("/api/updatevolunteerprofile/:_id", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { _id } = req.params;
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
    const volunteerData = await volunteer.findById(_id);
    if (!volunteerData) {
      return res.status(404).json({
        message: "Volunteer not found.",
      });
    }

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
});

// Update Volunteer Profile Photo
app.put(
  "/api/updatevolunteerphoto/:_id",
  upload1.single("profilePhoto"),
  async (req, res) => {
    try {
      const { _id } = req.params;

      // Check volunteer exists
      const volunteerData = await volunteer.findById(_id);

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
      if (req.file) {
        const newPhotoPath = req.file.path;
        if (fs.existsSync(newPhotoPath)) {
          fs.unlinkSync(newPhotoPath);
        }
      }
      res.status(500).json({
        message: "Server error.",
      });
    }
  },
);

// Update Volunteer password API
app.put("/api/updatevolunteerpassword/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).send({
      status: "Invalid",
      message: "New password is required",
    });
  }
  if (password.length < 6) {
    return res.status(400).send({
      status: "Invalid",
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    const updatedVolunteer = await volunteer.findByIdAndUpdate(
      user_id,
      {
        password: password,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
    if (!updatedVolunteer) {
      return res.status(404).send({
        status: "Invalid",
        message: "Volunteer not found",
      });
    }
    res.status(200).send({
      status: "Success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Volunteer Password Update Error:", error);
    res.status(500).send({
      status: "Error",
      message: "Unable to update password",
    });
  }
});

//Admin login API
app.post("/api/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      status: "Invalid",
      message: "Email and password are required",
    });
  }

  const user = await admin.findOne({
    email: email,
    password: password,
  });

  if (!user) {
    return res.status(400).send({
      status: "Invalid",
      message: "Invalid email or password",
    });
  }

  res.status(200).send({
    status: "Approved",
    _id: user._id,
    email: user.email,
  });
});

//// Get Admin Profile
app.get("/api/getadminprofile/:_id", async (req, res) => {
  const { _id } = req.params;
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
});

//Edit admin profile
app.put("/api/editadminprofile/:_id", async (req, res) => {
  const { _id } = req.params;
  const { name, email } = req.body;

  //Validation
  if (!name || !email) {
    return res.status(400).send({
      status: "Invalid",
      message: "Name and email are required",
    });
  }

  // Email format validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim())) {
    return res.status(400).send({
      status: "Invalid",
      message: "Please enter a valid email address",
    });
  }

  try {
    // Check whether another admin already uses this email
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
app.put("/api/editadminpassword/:_id", async (req, res) => {
  const { _id } = req.params;
  const { password } = req.body;

  // Validation
  if (!password) {
    return res.status(400).send({
      status: "Invalid",
      message: "New password is required",
    });
  }

  if (password.length < 6) {
    return res.status(400).send({
      status: "Invalid",
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    const updatedAdmin = await admin.findByIdAndUpdate(
      _id,
      {
        password: password,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedAdmin) {
      return res.status(404).send({
        status: "Invalid",
        message: "Admin not found",
      });
    }
    res.status(200).send({
      status: "Success",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Admin Password Update Error:", error);
    res.status(500).send({
      status: "Error",
      message: "Unable to update password",
    });
  }
});

//Get all woman data into admin
app.get("/api/getwomanusers", async (req, res) => {
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
app.put("/api/editwomanprofile/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
    const { fullName, phoneNumber, city, state, pincode, address } = req.body;

    // Required field validation
    if (!fullName || !phoneNumber || !city || !state || !pincode || !address) {
      return res.status(400).json({
        message: "All profile fields are required.",
      });
    }

    const updatedUser = await womanUser
      .findByIdAndUpdate(
        _id,
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
  upload.single("profile_photo"),
  async (req, res) => {
    try {
      const _id = req.params._id;
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a profile photo.",
        });
      }
      const user = await womanUser.findById(_id);
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

      const updatedUser = await womanUser.findById(_id).select("-password");
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

//change women password API
app.put("/api/changewomanpassword/:_id", async (req, res) => {
  try {
    const _id = req.params._id;
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
    const user = await womanUser.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "Woman user not found.",
      });
    }

    // Check current password
    if (user.password !== currentPassword) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    // Check new password is different
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password.",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.log("Change password error:", error);
    res.status(500).json({
      message: "Server error.",
    });
  }
});

//new woman user for last 7 days
app.get("/api/getnewwomanusers", async (req, res) => {
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

// Haversine Distance Calculation Helper
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lat1 === null ||
    lon1 === undefined ||
    lon1 === null ||
    lat2 === undefined ||
    lat2 === null ||
    lon2 === undefined ||
    lon2 === null
  ) {
    return { text: "Calculating...", meters: null };
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
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
    volunteerLocationShared: { type: Boolean, default: false },
    distance: { type: String, default: "" },
    distanceMeters: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
  }),
);

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

// ==========================================
// SOCKET.IO REAL-TIME EVENT SETUP
// ==========================================
if (io) {
  io.on("connection", (socket) => {
    console.log("⚡ Client connected to Socket.IO:", socket.id);

    // Join room for a specific SOS request
    socket.on("join_sos", async (sosId, acknowledge) => {
      if (!sosId) {
        acknowledge?.({ error: "SOS ID is required." });
        return;
      }

      try {
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
      socket.join("volunteers_channel");
    });

    // Direct live location update from woman user via socket
    socket.on("update_woman_location", async (data) => {
      try {
        const { sosId, womanLat, womanLng, womanAddress } = data;
        if (!sosId || womanLat === undefined || womanLng === undefined) return;

        const sos = await sosAlert.findById(sosId);
        if (sos) {
          sos.womanLat = Number(womanLat);
          sos.womanLng = Number(womanLng);
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
        const { sosId, volunteerLat, volunteerLng } = data;
        if (!sosId || volunteerLat === undefined || volunteerLng === undefined)
          return;

        const sos = await sosAlert.findById(sosId);
        if (sos) {
          sos.volunteerLat = Number(volunteerLat);
          sos.volunteerLng = Number(volunteerLng);
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
app.post("/api/sos/create", async (req, res) => {
  try {
    const {
      womanId,
      womanName,
      womanEmail,
      womanPhone,
      womanLat,
      womanLng,
      womanAddress,
      emergencyType,
    } = req.body;

    if (!womanId || womanLat === undefined || womanLng === undefined) {
      return res.status(400).json({
        message:
          "Woman ID and live GPS coordinates (latitude, longitude) are required.",
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

    const woman = await womanUser.findById(womanId);
    if (!woman) {
      return res.status(404).json({
        message: "Woman user not found.",
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
        googleMailService.sendSOSEmergencyEmail({
          recipients: recipientEmails,
          womanName: newAlert.womanName,
          womanPhone: newAlert.womanPhone,
          womanEmail: newAlert.womanEmail,
          womanAddress: newAlert.womanAddress,
          womanLat: newAlert.womanLat,
          womanLng: newAlert.womanLng,
          emergencyType: newAlert.emergencyType,
        }).then((mailRes) => {
          if (mailRes?.preview) {
            console.log(`ℹ️ SOS email logged in preview mode for trusted contacts of ${newAlert.womanName}`);
          } else if (mailRes?.success) {
            console.log(`✅ SOS email sent via Google to ${recipientEmails.length} trusted contact(s) of ${newAlert.womanName}`);
          }
        }).catch((err) => {
          console.error("❌ Failed to send SOS alert email to trusted contacts:", err.message);
        });
      } else {
        console.warn(`⚠️ [SafeHer SOS] Woman user ${womanId} (${newAlert.womanName}) has ${contacts.length} trusted contact(s), but none have an email address configured yet.`);
      }
    } catch (mailErr) {
      console.error("Error looking up trusted contacts for SOS email:", mailErr);
    }

    // Send Emergency SOS SMS to Trusted Contacts (Tier 1: Dev 100 SMS pack -> Tier 2: Fast2SMS -> Tier 3: Both exhausted alert)
    let smsStatus = null;
    try {
      const recipientPhones = contacts
        .map((c) => (c.phoneNo || "").trim())
        .filter((p) => p && /^[0-9]{10}$/.test(p));

      if (recipientPhones.length > 0) {
        smsStatus = await smsService.sendSOSEmergencySMS({
          phoneNumbers: recipientPhones,
          womanName: newAlert.womanName,
          womanAddress: newAlert.womanAddress,
          womanLat: newAlert.womanLat,
          womanLng: newAlert.womanLng,
          womanPhone: newAlert.womanPhone,
          emergencyType: newAlert.emergencyType,
        });
      }
    } catch (smsErr) {
      console.error("Error sending SOS SMS to trusted contacts:", smsErr);
    }

    return res.status(201).json({
      message:
        "Emergency SOS Alert created successfully! Location shared with volunteers and trusted contacts.",
      sos: newAlert,
      smsStatus: smsStatus,
    });
  } catch (error) {
    console.error("Error creating SOS:", error);
    res.status(500).json({ message: "Failed to trigger emergency SOS alert." });
  }
});

// 2. GET ACTIVE SOS FOR A SPECIFIC WOMAN
app.get("/api/sos/active/:womanId", async (req, res) => {
  try {
    const { womanId } = req.params;
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

// 3. GET ALL SOS REQUESTS (For Volunteers & Admin)
app.get("/api/sos/all", async (req, res) => {
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
app.get("/api/sos/details/:id", async (req, res) => {
  try {
    const sos = await sosAlert.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }
    res.status(200).json(sos);
  } catch (error) {
    console.error("Error getting SOS details:", error);
    res.status(500).json({ message: "Error fetching SOS details." });
  }
});

// 5. VOLUNTEER APPROVES / ACCEPTS SOS

app.put("/api/sos/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      volunteerId,
      volunteerName,
      volunteerEmail,
      volunteerPhone,
      volunteerLat,
      volunteerLng,
    } = req.body;

    if (!volunteerId) {
      return res.status(400).json({
        message: "Volunteer ID is required.",
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

    // Query volunteer record to fetch verified profile photo and information
    let volRecord = null;
    try {
      if (mongoose.Types.ObjectId.isValid(volunteerId)) {
        volRecord = await volunteer.findById(volunteerId);
      } else {
        volRecord = await volunteer.findOne({
          $or: [{ _id: volunteerId }, { email: volunteerEmail }, { name: volunteerName }],
        });
      }
    } catch (_) {}

    const resolvedPhoto =
      req.body.volunteerPhoto || volRecord?.profile_photo || existingSos.volunteerPhoto || null;

    const updateFields = {
      volunteerId,
      volunteerName: volunteerName || volRecord?.name || "Responding Volunteer",
      volunteerEmail: volunteerEmail || volRecord?.email || existingSos.volunteerEmail,
      volunteerPhone: volunteerPhone || volRecord?.contact_no || existingSos.volunteerPhone,
      volunteerPhoto: resolvedPhoto,
      status: "Approved",
      acceptedAt: existingSos.acceptedAt || now,
      updatedAt: now,
    };

    if (
      volunteerLat !== undefined &&
      volunteerLng !== undefined &&
      volunteerLat !== null &&
      volunteerLng !== null
    ) {
      updateFields.volunteerLat = Number(volunteerLat);
      updateFields.volunteerLng = Number(volunteerLng);
      updateFields.volunteerLocationShared = true;

      const dist = calculateHaversineDistance(
        existingSos.womanLat,
        existingSos.womanLng,
        Number(volunteerLat),
        Number(volunteerLng),
      );

      updateFields.distance = dist.text;
      updateFields.distanceMeters = dist.meters;
    }

    // Atomic check: only one volunteer can approve a Pending SOS.
    const sos = await sosAlert.findOneAndUpdate(
      { _id: id, status: "Pending" },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!sos) {
      return res.status(409).json({
        message: "Another volunteer has already accepted this SOS.",
      });
    }

    if (io) {
      io.to(`sos_${id}`).emit("sos_approved", sos);
      io.to(`sos_${id}`).emit("sos_status_changed", sos);
      io.to("volunteers_channel").emit("sos_updated", sos);
    }

    // Send Volunteer Assigned Update Email to Trusted Contacts via Google Mail Service
    try {
      const contacts = await trustedContact.find({ womanId: sos.womanId });
      const recipientEmails = contacts
        .map((c) => (c.email || "").trim())
        .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

      if (recipientEmails.length > 0) {
        googleMailService.sendSOSVolunteerAssignedEmail({
          recipients: recipientEmails,
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
        }).then((mailRes) => {
          if (mailRes?.preview) {
            console.log(`ℹ️ Volunteer Assigned email preview logged for trusted contacts of ${sos.womanName}`);
          } else if (mailRes?.success) {
            console.log(`✅ Volunteer Assigned email sent via Google to ${recipientEmails.length} trusted contact(s) of ${sos.womanName}`);
          }
        }).catch((err) => {
          console.error("❌ Failed to send volunteer assigned email to trusted contacts:", err.message);
        });
      }
    } catch (mailErr) {
      console.error("Error looking up trusted contacts for volunteer assignment email:", mailErr);
    }

    // Send Volunteer Assigned SMS to Trusted Contacts (Tier 1: Dev 100 SMS pack -> Tier 2: Fast2SMS -> Tier 3: Both exhausted alert)
    let smsStatus = null;
    try {
      const contacts = await trustedContact.find({ womanId: sos.womanId });
      const recipientPhones = contacts
        .map((c) => (c.phoneNo || "").trim())
        .filter((p) => p && /^[0-9]{10}$/.test(p));

      if (recipientPhones.length > 0) {
        smsStatus = await smsService.sendSOSVolunteerAssignedSMS({
          phoneNumbers: recipientPhones,
          womanName: sos.womanName,
          volunteerName: sos.volunteerName,
          volunteerPhone: sos.volunteerPhone,
          volunteerEmail: sos.volunteerEmail,
          distance: sos.distance,
        });
      }
    } catch (smsErr) {
      console.error("Error sending volunteer assigned SMS:", smsErr);
    }

    return res.status(200).json({
      message:
        "SOS request approved! You are assigned as the responding volunteer.",
      sos,
      smsStatus: smsStatus,
    });
  } catch (error) {
    console.error("Error approving SOS:", error);

    return res.status(500).json({
      message: "Failed to approve SOS request.",
    });
  }
});

// 6. VOLUNTEER DISMISSES AN SOS FOR THEMSELVES
app.put("/api/sos/reject/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const volunteerId = String(req.body?.volunteerId || "").trim();

    if (!volunteerId) {
      return res.status(400).json({ message: "Volunteer ID is required." });
    }

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
app.put("/api/sos/update-volunteer-location/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerLat, volunteerLng } = req.body;

    if (volunteerLat === undefined || volunteerLng === undefined) {
      return res
        .status(400)
        .json({ message: "Volunteer coordinates are required." });
    }

    const sos = await sosAlert.findById(id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }

    sos.volunteerLat = Number(volunteerLat);
    sos.volunteerLng = Number(volunteerLng);
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
});

// 7. WOMAN UPDATES LIVE LOCATION
app.put("/api/sos/update-woman-location/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { womanLat, womanLng, womanAddress } = req.body;

    if (womanLat === undefined || womanLng === undefined) {
      return res
        .status(400)
        .json({ message: "Woman coordinates are required." });
    }

    const sos = await sosAlert.findById(id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }

    sos.womanLat = Number(womanLat);
    sos.womanLng = Number(womanLng);
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
});

// 8. RESOLVE SOS (Emergency handled / safe)
app.put("/api/sos/resolve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const volunteerId = String(req.body.volunteerId || "").trim();
    const womanId = String(req.body.womanId || "").trim();

    if (!volunteerId && !womanId) {
      return res.status(400).json({
        message: "Volunteer ID or Woman ID is required.",
      });
    }

    const sos = await sosAlert.findById(id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }

    const isAssignedVolunteer =
      volunteerId && String(sos.volunteerId) === volunteerId;
    const isWomanUser = womanId && String(sos.womanId) === womanId;

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

    if (io) {
      io.to(`sos_${id}`).emit("sos_resolved", sos);
      io.to(`sos_${id}`).emit("sos_status_changed", sos);
      io.to("volunteers_channel").emit("sos_updated", sos);
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

// 9. CANCEL SOS (User cancelled)
app.put("/api/sos/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sos = await sosAlert.findById(id);
    if (!sos) {
      return res.status(404).json({ message: "SOS request not found." });
    }

    sos.status = "Cancelled";
    sos.updatedAt = new Date();
    await sos.save();

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

  // Insert only newly earned badges; never overwrite earnedAt.
  for (const badgeKey of eligibleBadges) {
    await badgeAchievement.updateOne(
      { volunteerId: id, badgeKey },
      {
        $setOnInsert: {
          volunteerId: id,
          badgeKey,
          earnedAt: new Date(),
        },
      },
      { upsert: true },
    );
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

const PORT = 3000; //port number is set to 3000, this is the port on which the server will listen for requests.
server.listen(PORT, () =>
  console.log(`Server with Socket.IO running at http://localhost:${PORT}`),
); //server is listening on port 3000
