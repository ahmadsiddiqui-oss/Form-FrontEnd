import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "../reducers/userReducer"; // Import from the correct location

export const store = configureStore({
  reducer: {
    users: usersReducer, // Add it here
  },
});
