import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.auth.posts);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchPosts = async () => {
      let response;
      if (isProfile && userId) {
        // Fetch posts only for the user
        response = await fetch(`https://twitter-app-backend-uvw8.onrender.com/posts/${userId}/posts`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Fetch all posts
        response = await fetch(`https://twitter-app-backend-uvw8.onrender.com/posts`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = await response.json();
      dispatch(setPosts({ posts: data }));
    };

    fetchPosts();
  }, [dispatch, isProfile, token, userId]);

  return (
    <>
      {posts.map(
        ({
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
        }) => (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={userId}
            name={`${firstName} ${lastName}`}
            description={description}
            location={location}
            picturePath={picturePath}
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
          />
        )
      )}
    </>
  );
};

export default PostsWidget;


