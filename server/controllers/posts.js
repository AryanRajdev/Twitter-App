import Post from "../models/Post.js";
import User from "../models/User.js";

// Create
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {}, // ✅ THIS MUST EXIST
      comments: [], // ✅ THIS TOO
    });

    await newPost.save();

    const posts = await Post.find().lean(); // .lean() returns plain JS objects
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ msg: err.message });
  }
};


// Get all feed posts
export const getFeedPosts = async (req, res) => {
  try {
    const allPosts = await Post.find();

    const cleanPosts = allPosts.map((post) => {
      const obj = post.toObject();
      obj.likes = post.likes ? Object.fromEntries(post.likes) : {};
      return obj;
    });

    res.status(200).json(cleanPosts);
  } catch (err) {
    res.status(409).json({ msg: err.message });
  }
};

// Get user-specific posts
// export const getUserPosts = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Step 1: Get all posts
//     const allPosts = await Post.find();

//     // Step 2: Separate posts into: userPosts and others
//     const userPosts = [];
//     const otherPosts = [];

//     for (const post of allPosts) {
//       const obj = post.toObject();
//       obj.likes = post.likes ? Object.fromEntries(post.likes) : {};

//       if (obj.userId.toString() === userId) {
//         userPosts.push(obj);
//       } else {
//         otherPosts.push(obj);
//       }
//     }

//     // Step 3: Append user posts at the end
//     const reorderedPosts = [...otherPosts, ...userPosts];

//     res.status(200).json(reorderedPosts);
//   } catch (err) {
//     res.status(409).json({ msg: err.message });
//   }
// };

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Return only posts whose userId matches param
    const userPosts = await Post.find({ userId: userId });

    // Convert likes Map if necessary
    const formattedPosts = userPosts.map(post => {
      const obj = post.toObject();
      obj.likes = post.likes ? Object.fromEntries(post.likes) : {};
      return obj;
    });

    res.status(200).json(formattedPosts);
  } catch (err) {
    res.status(409).json({ msg: err.message });
  }
};



// Like / Unlike a post
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Safely convert likes to plain object
    const likesObj = post.likes instanceof Map
      ? Object.fromEntries(post.likes)
      : post.likes.toObject ? post.likes.toObject() : { ...post.likes };

    const likesMap = new Map(Object.entries(likesObj));

    const isLiked = likesMap.get(userId);

    if (isLiked) {
      likesMap.delete(userId);
    } else {
      likesMap.set(userId, true);
    }

    const updatedLikes = Object.fromEntries(likesMap);

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: updatedLikes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Like error:", err);
    res.status(409).json({ msg: err.message });
  }
};

