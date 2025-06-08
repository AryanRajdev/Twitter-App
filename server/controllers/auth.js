import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js"

export const register = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const {
      firstName,
      lastName,
      email,
      password,
      friends,
      location,
      occupation,
      viewedProfile,
      impression
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath: req.file?.filename || "", // ✅ pulled from file, not body
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impression: Math.floor(Math.random() * 10000),
    });

    const savedUser = await newUser.save(); // ✅ await here
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Loggin In

export const login = async(req,res)=>{
    try{

        const {email , password} = req.body;
        const user = await User.findOne({email : email});

        if(!user) return res.status(404).json({msg : "User not found"});

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch) return res.status(400).json({msg : "Invalid Credentials"});

        const token = jwt.sign({id : user._id},process.env.JWT_KEY);

        const userObj = user.toObject(); // ✅ convert to plain object
        delete userObj.password;         // ✅ safely remove password

        res.status(200).json({token, user: userObj});

    }
    catch(err){
       res.status(500).json({error : err.message}); 
    }
}

