import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },

    setLogin: (state, action) => {
      const user = action.payload.user;

      // 🛡️ Ensure friends is always an array (if backend sends {})
      const sanitizedUser = {
        ...user,
        friends: Array.isArray(user.friends)
          ? user.friends
          : Object.values(user.friends || {}),
      };

      state.user = sanitizedUser;
      state.token = action.payload.token;
    },

    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },

    setFriends: (state, action) => {
      if (state.user) {
        const friends = action.payload.friends;

        // 🛡️ Ensure friends is an array
        state.user.friends = Array.isArray(friends)
          ? friends
          : Object.values(friends || {});
      } else {
        console.error("user is null: cannot set friends");
      }
    },

    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },

    setPost: (state, action) => {
      const updatedPost = action.payload.post;
      const index = state.posts.findIndex(
        (post) => post._id === updatedPost._id
      );
      if (index !== -1) {
        state.posts[index] = updatedPost;
      }
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost } =
  authSlice.actions;

export default authSlice.reducer;
