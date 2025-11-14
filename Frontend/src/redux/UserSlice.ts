import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
  name: string;
  phoneNumber: string;
  address: string;
  city: string;
  pinCode: string;
}

interface UserState {
  user: UserProfile | null;
  userId: string | null;
  accessToken: string | null;
  isVerified: boolean | null;
  name: string | null;
  role: string | null;
}

const initialState: UserState = {
  user: null,
  userId: null,
  accessToken: null,
  isVerified: false,
  name: null,
  role: null,
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setIsVerified: (state, action: PayloadAction<boolean>) => {
      state.isVerified = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userId = null;
      state.accessToken = null;
      state.isVerified = false;
      state.name = null;
      state.role = null;
    },
  },
});

export const {
  setUser,
  setUserId,
  setAccessToken,
  setIsVerified,
  setName,
  setRole,
} = userSlice.actions;
export default userSlice.reducer;
