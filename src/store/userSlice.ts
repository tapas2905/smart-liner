import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserInfo } from '../interfaces/userInterface';

const initialState: UserState = {
  token: null,
  userInfo: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<{ token: string; userInfo: UserInfo }>) => {
      state.token = action.payload.token;
      state.userInfo = action.payload.userInfo;
      state.isAuthenticated = true;
    },
    setLogout: (state) => {
      state.token = null;
      state.userInfo = null;
      state.isAuthenticated = false;
    },
    // You can add other reducers here if needed, e.g., for updating user info
    updateUserInfo: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
  },
});

export const { setLogin, setLogout, updateUserInfo } = userSlice.actions;

export default userSlice.reducer;