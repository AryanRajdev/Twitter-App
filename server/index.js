import path from "path";

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js"
import { register } from "./controllers/auth.js";
import {createPost} from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import {users , posts} from "./data/index.js" 
import dotenv from "dotenv";
dotenv.config({ path: path.resolve("server/.env") });




// Configurations

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb" , extended : true}));
app.use(bodyParser.urlencoded({limit : "30mb", extended : true}));
app.use(cors());
app.use("/assets",express.static(path.join(__dirname,"public/assets")));


// File Storage

// const storage = multer.diskStorage({
//     destination : function(req,file,cb){
//         cb(null,"public/assets");
//     },
//     filename: function(req,file,cb){
//         cb(null,file.originalname);
//     }
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/assets")); // ABSOLUTE PATH
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});


const upload = multer({storage});

// Routes

app.post("/auth/register" , upload.single("picture") , register);
app.post("/posts",verifyToken,upload.single("picture") , createPost);

app.use("/auth",authRoutes);
app.use("/users",userRoutes);
app.use("/posts",postRoutes);

// Mongoose Setup

const PORT = process.env.PORT || 6001;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();

    if (userCount === 0 && postCount === 0) {
      await User.insertMany(users);
      await Post.insertMany(posts);
      console.log("Inserted mock data.");
    } else {
      console.log("Mock data already exists, skipping insert.");
    }
  })
  .catch((err) => {
    console.error(`${err} did not connect`);
  });


// # pSzZpINM1PVLxVoB 
// # aryanraj24032002