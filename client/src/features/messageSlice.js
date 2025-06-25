import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  receivedMessages: [],
  errorMessage: "",
};

// const message
