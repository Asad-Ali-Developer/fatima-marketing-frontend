import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },

    clearUser(state) {
      state.user = null;
      state.accessToken = null;

      // Clear localStorage if available
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
