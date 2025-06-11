import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import authReducer from "./state"; // your auth slice
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";

// ✅ persist only the auth part
const persistConfig = {
  key: "auth", // this key becomes the localStorage key
  storage,
  version: 1,
};

const rootReducer = {
  auth: authReducer, // 🔥 this is what you want your state to look like
};

// ✅ apply persistReducer to the `auth` reducer only
const persistedReducer = persistReducer(persistConfig, authReducer);

// ✅ construct the store with correct shape
const store = configureStore({
  reducer: {
    auth: persistedReducer, // ✅ maintain `state.auth`
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

