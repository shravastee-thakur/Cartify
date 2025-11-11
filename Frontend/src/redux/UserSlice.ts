import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userId: string | null;
}

const initialState: UserState = {
  userId: null,
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
  },
});

export const { setUserId } = userSlice.actions;
export default userSlice.reducer;
