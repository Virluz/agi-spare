import axios from "axios"
import Constants from "../utils/Constants";
import { generateTokenFromUsernamePassword } from "../utils/Helper";
import eventBus from "../service/EventBus";

const axiosInstance = axios.create({
  baseURL: process.env.STYLE_UNION_BASE_URL,
  headers: {
    Authorization: process.env.STYLE_UNION_API_TOKEN
  }
});

axiosInstance.interceptors.response.use(
  res => {
    // console.log("res", res);
    console.log("res".res);
    return res.data;
  },
  err => {
    console.log("err", err.response);

    if (err?.response?.status === 401) {
      console.log("err", err?.response);

      let responseData = err?.response?.data
      if (responseData?.message) {
        return responseData;
      }

      let data = {
        "success": false,
        "status_code": 401,
        "message": "Your Session is expired! Please Re-login",
        data: err.response.data
      }
      console.log("err", err);


      eventBus.publish("session_expired");


      return data;
    }
    if (err?.response?.status === 422) {
      console.log("422 Error", JSON.stringify(err?.response?.data));
    }
    if (err?.response?.status === 500) {
      console.log("500 Error", JSON.stringify(err?.response?.data));

      return err?.response?.data;
    }

    if (err?.response?.status === 404) {
      console.log("404 Error", JSON.stringify(err?.response?.data));
      return err?.response?.data;
    }

    return Promise.reject(err);
  }
);

export const setAuthorizationHeader = async (token) => {
  if (token) {
    delete axiosInstance.defaults.headers.common['Authorization'];
    axiosInstance.defaults.headers.common['Authorization'] = `Basic ${token}`;
  }
};

export const setAxiosBaseUrl = async (baseUrl) => {
  if (baseUrl) {
    axiosInstance.defaults.baseURL = baseUrl;
  }
};

export const setFormDataHeader = async () => {
  axiosInstance.defaults.headers.common['Content-Type'] = 'multipart/form-data';
};

export const setJSONHeader = async () => {
  axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
}
export { axiosInstance };
