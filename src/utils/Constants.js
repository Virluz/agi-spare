export default Constants = {
  NAME: 'Name',
  ENTER_NAME: 'Enter your name',
  USERNAME: 'Username',
  ENTER_USERNAME: 'Enter your username',

  COUNTRY: 'Country/Region',
  ENTER_COUNTRY: 'Your Country/Region',

  ENTER_CITY: 'Your City',
  CITY: 'City',

  FORGOT: 'Forgot Password ?',

  DEGREE: 'Degree',
  ENTER_DEGREE: `Degree`,

  START_DATE: 'Start Date',
  END_DATE: 'End Date',

  COLLEGE_NAME: 'University Name',

  COMPANY: 'Company',
  ENTER_COMPANY: 'Enter company name',

  WORK_EXP: 'Experience(in years)',

  INTERESTS: 'Interests',

  LANGUANGES: 'Languages',

  EMAIL: 'Email Address',

  RECIEVER_NAME: 'Reciever’s name',
  CONSIGNEE_NAME: 'Consignee’s name',
  REASON: 'REASON',


  ENTER_RECIEVER_NAME: 'Enter reciever’s name',
  ENTER_CONSIGNEE_NAME: 'Enter consignee’s name',

  ENTER_EMAIL: 'Enter your email',

  SET_PASSWORD: 'Set Password',
  ENTER_SET_PASSWORD: 'Set your password',

  PASSWORD: 'Password',
  ENTER_PASSWORD: 'Enter your password',

  CON_PASSWORD: 'Confirm Password',
  ENTER_CON_PASSWORD: 'Confirm your password',

  NEW_PASSWORD: 'New Password',
  ENTER_NEW_PASSWORD: 'Enter your new password',

  OLD_PASSWORD: 'Old Password',
  ENTER_OLD_PASSWORD: 'Enter old password',

  LOGGED_IN_USER_DATA: 'LOGGED_IN_USER_DATA',
  APP_SETTINGS: 'APP_SETTINGS',
  IS_LOGGED_IN: 'IS_LOGGED_IN',
  MASTER_DATA: 'MASTER_DATA',
  HAS_SEEN_ONBOARD: 'HAS_SEEN_ONBOARD',


  where_conditions: {
    GET_SUCCESSFUL_ATTEMPT: 'SUCCESSFUL_ATTEMPT',
    GET_FAILED_ATTEMPT: 'FAILED_ATTEMPT',
    GET_NOT_ATTEMPT: 'NOT_ATTEMPT',
    GET_NOT_SYNCED: 'NOT_SYNCED',
    GET_SYNCED: 'SYNCED',
  },

  backend_shipment_types: {
    Delivered: "Delivery",
  },

  PREVIEW: 'Preview',
  PHONE_REGEX: /^[0-9]{10}$/,
  PINCODE_REGEX: /^[0-9]{6}$/,
  IFSC_REGEX: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  ALPHANUMERIC_REGEX: /^[a-zA-Z0-9]*$/,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  VALUE: 'VALUE',
  NEXT_SCREEN_PROP: 'NEXT_SCREEN',
  FLYER_NUMBER_PROP: 'FLYER_NUMBER',
  IS_MULTI_CAPTURE_PROP: 'MULTI_CAPTURE',
  ADDRESS_CALLBACK_PROP: 'Address callback',
  CAMERA_CALLBACK_PROP: 'Camera callback',
  SIGN_CALLBACK_PROP: 'Signature callback',
  TOOLBAR_TITLE_PROP: 'Toolbar title',
  DOC_IMAGE_PATH: 'DOC_IMAGE_PATH',
  BARCODE_CALLBACK_PROP: 'Barcode callback',
  SHIPMENT_TYPE: "SHIPMENT_TYPE",
  DISCOUNT_AMOUNT: 'DISCOUNT_AMOUNT',

  CAMERA_DEVICE_PROP: 'Camera device',
  IS_DELIVERY: 'IS_DELIVERY',
  TYPE: 'TYPE',
  SELFIE: 'SELFIE',
  AADHAR_FRONT: 'AADHAR_FRONT',
  AADHAR_BACK: 'AADHAR_BACK',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  COUNTRY_CODE: '+91',
  ACESSBILITY_LABEL: {
    BUTTON: 'button',
    TEXTINPUT: 'textInput',
  },
  SCAN_BARCODE_LABEL: 'Scan barcode',
  BACK_BUTTON_LABEL: 'back',
  IMAGE_FORMAT: {
    JPG: 'jpg',
    PNG: 'png',
  },
  SUFFIX: {
    SIGNATURE: 'sign',
    PHOTO: 'photo',
  },

  SIGNUP_DIRECTORY: 'signup',
  SHIPMENTS_DIRECTORY: 'shipments',
  USER_DIRECTORY: 'user',
  OTHER_DIRECTORY: 'other',

  PROFILE_DATA: 'PROFILE_DATA',
  COMPANY_DATA: 'COMPANY_DATA',
  SSL_PINS: 'SSL_PINS',
  BUCKET_CREDENTIALS: 'BUCKET_CREDENTIALS',
  RESET_EVENT: 'RESET_EVENT',
  SHIPMENTS_UPDATED_EVENT: 'SHIPMENTS_UPDATED_EVENT',
  PUSH_NOTIFICATION_EVENT: 'PUSH_NOTIFICATION_EVENT',
  LOGOUT_EVENT: 'LOGOUT_EVENT',
  SHIPMENT_TAB_PRESS_EVENT: 'SHIPMENT_TAB_PRESS_EVENT',


  SCAN_BACK_PRESS_EVENT: 'SCAN_BACK_PRESS_EVENT',

  NOTIFICATION_EVENT_ID: {
    START_DUTY: 1,
    SHIPMENT_UPDATED: 2,
  },

  LOCAL_STORAGE_KEYS: {
    USER_DATA: "USER_DATA",
    LANGUANGE: 'LANGUANGE'
  },

  DEFAULT_ERROR: "something went wrong! Please contact administrator",
  CURRENCY: '₹',
};
