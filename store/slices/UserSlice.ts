import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const savedAccessToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      accessToken: savedAccessToken,
    };
  }

  return {
    user: null,
    accessToken: null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
      }
    },

    clearUser(state) {
      state.user = null;
      state.accessToken = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    },

    // ✅ NEW: Update user profile (e.g., after uploading profile image)
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        // Merge updated fields into existing user
        state.user = { ...state.user, ...action.payload };

        // Persist updated user to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setUser, clearUser, updateUser } = authSlice.actions;
export const userReducer = authSlice.reducer;
