import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userId: string | null;
  accessToken: string | null;
  isVerified: boolean | null;
  name: string | null;
  role: string | null;
}

const initialState: UserState = {
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
      state.userId = null;
      state.accessToken = null;
      state.isVerified = false;
      state.name = null;
      state.role = null;
    },
  },
});

export const { setUserId, setAccessToken, setIsVerified, setName, setRole } =
  userSlice.actions;
export default userSlice.reducer;
