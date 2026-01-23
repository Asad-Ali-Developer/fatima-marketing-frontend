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

      // Persist to localStorage
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
  },
});

export const { setUser, clearUser } = authSlice.actions;
export const userReducer = authSlice.reducer;
