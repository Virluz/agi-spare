import { axiosInstance } from "./config";
import { axiosInstanceLogin } from "./configLogin";

export const checkServiceability = async (data) => {
  return axiosInstance.post('order/checkServiceability', data);
}

export const sendOtpMobile = async (data) => {


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

// Send registration data to Google Sheet via Apps Script (createAccount action).
// The script creates a Shopify customer, sets metafields, and logs to the Customers sheet.
// This is fire-and-forget; failures are logged but do not block the app's own registration flow.
const GOOGLE_SHEET_URL =
  'https://script.google.com/macros/s/AKfycbxntE8ZmP0JUnMiyFaTlO-IyuBm5ux6dXT58hmXxLi9t4n6GjHUtgYJbzdSj1gM8S1Yww/exec';

export const sendRegistrationToGoogleSheet = async ({
  firstName,
  lastName,
  email,
  password,
  mobile,
  name,
  birthDate,
  companyName,
  gstNumber,
  howDidYouHear,
  buildingName,
  state,
  cityName,
  areaName,
  pinCode,
  username,
}) => {
  try {
    const metafield = (key, value, type = 'single_line_text_field') => ({
      namespace: 'custom',
      key,
      type,
      value: type === 'number_integer' ? String(parseInt(value, 10) || 0) : String(value || ''),
    });

    const payload = {
      action: 'createAccount',
      firstName: firstName || '.',
      lastName: lastName || '.',
      email,
      password,
      metafields: [
        metafield('name', name),
        metafield('birth_date_new', birthDate),
        metafield('company_name', companyName),
        metafield('gst_number', gstNumber),
        metafield('how_did_you_hear_about_us', howDidYouHear),
        metafield('mobile_number', mobile, 'number_integer'),
        metafield('email_id', email),
        metafield('building_name', buildingName),
        metafield('state_new', state),
        metafield('city_name', cityName),
        metafield('area_name', areaName),
        metafield('pin_code', pinCode),
        metafield('username', username),
      ],
    };

    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    const resultText = await response.text();
    console.log('Google Sheet response:', response.status, resultText);

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch (e) {
      parsed = { success: response.ok, message: resultText };
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to send registration to Google Sheet:', error);
    return { success: false, message: error.message || 'Failed to connect to registration service.' };
  }
};