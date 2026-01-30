/* src/features/users.redux.js */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../components/axios"; // Assuming this is where your axios instance is

// 1. Define the Async Thunk for fetching users
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page, limit, search }, { rejectWithValue }) => {
    try {
      // Logic moved from users.js
      const res = await api.get(
        `/userRoutes?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data; // Expected { data: [], meta: {} }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch users"
      );
    }
  }
);

// You can also add thunks for delete/update if desired
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/userRoutes/${id}`);
      return id; // Return id to remove it from state immediately
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to delete");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    data: [], // Replaces [users, setUsers]
    meta: { page: 1, totalPages: 1 }, // Replaces [meta, setMeta]
    loading: false, // Replaces [loading, setLoading]
    error: null,
  },
  reducers: {
    // Standard synchronous actions if needed (e.g., clearUsers)
  },
  extraReducers: (builder) => {
    builder
      // Handle Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.meta = action.payload.meta || { page: 1, totalPages: 1 };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle Delete User (Optimistic update example)
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.data = state.data.filter((user) => user.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
