import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isLoading: boolean;
  isDarkMode: boolean;
  sidebarOpen: boolean;
}

const initialState: UiState = {
  isLoading: false,
  isDarkMode: false,
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setLoading, toggleDarkMode, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
