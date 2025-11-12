import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userId: string | null;
  accessToken: string | null;
}

const initialState: UserState = {
  userId: null,
  accessToken: null,
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
    logout: (state) => {
      state.userId = null;
      state.accessToken = null;
    },
  },
});

export const { setUserId, setAccessToken } = userSlice.actions;
export default userSlice.reducer;
