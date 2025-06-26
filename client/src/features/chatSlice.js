import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import baseUrl from "../api/baseUrl";

const initialState = {
  isLoading: false,
  chat: [],
  errorMessage: "",
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    fetchPending(state) {
      state.isLoading = true;
      state.chat = [];
      state.errorMessage = "";
    },
    fetchSuccess(state, action) {
      state.isLoading = false;
      state.chat = action.payload;
    },
    fetchReject(state, action) {
      state.isLoading = false;
      state.errorMessage = action.payload;
    },
    addMessage(state, action) {
      state.chat.push(action.payload);
    },
  },
});

export const { fetchPending, fetchSuccess, fetchReject, addMessage } =
  chatSlice.actions;

export const fetchChat = () => async (dispatch, _getState) => {
  try {
    dispatch(fetchPending());

    const { data } = await axios.get(`${baseUrl}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    console.log("DATA THUNK", data.message);

    dispatch(fetchSuccess(data.message));
  } catch (error) {
    dispatch(fetchReject(error.message));
  }
};

export default chatSlice.reducer;
