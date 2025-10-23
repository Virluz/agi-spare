import { axiosInstance } from "./config";
import { axiosInstanceLogin } from "./configLogin";

export const checkServiceability = async (data) => {
  return axiosInstance.post('order/checkServiceability', data);
}

export const sendOtpMobile = async (data) => {
  console.log('API Key:', process.env.LOGIN_API_KEY, data);

  // return { success: true }
  return axiosInstanceLogin.post('send_otp', data);
}

export const validateOtpMobile = async (data) => {
  // Expected data: { mobile: '+91xxxxxxxxxx', otp: '123456', api_key, modifiedShopURL }

  // return { type: 'REGISTER' }

  return axiosInstanceLogin.post('validate_otp', data);
}

// Register a new user when validate_otp returns { type: 'REGISTER' }
// Expected: { email, first_name, last_name, mobile, otp, modified_shop_url|modifiedShopURL, api_key }
export const registerUser = async (data) => {
  // return { type: 'EXISTING_USER_WITH_EMAIL_FOUND' }
  return axiosInstanceLogin.post('register', data);
}

// Send OTP to email to validate ownership for existing user without phone
// Expected: { email, api_key, modifiedShopURL }
export const sendOtpEmail = async (data) => {
  return axiosInstanceLogin.post('send_otp_email', data);
}

// Validate OTP sent to existing email
// Expected: { email, otp, api_key, modifiedShopURL }
export const validateOtpExistingEmail = async (data) => {
  return axiosInstanceLogin.post('validate_otp_existing_email', data);
}

// Validate social auth token/email and retrieve login payload (email + xattr or multipass_token)
// Expected: { email, modifiedShopURL, api_key }
export const validateSocialAuthToken = async (data) => {
  return axiosInstanceLogin.post('validate_social_auth_token', data);
}