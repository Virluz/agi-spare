# Create Account Page Implementation

## Overview
A comprehensive account creation page has been implemented with all fields from the design specification. The implementation uses Shopify's customer creation API with metafields support for extended custom fields.

## Files Created/Modified

### 1. New Files Created

#### `/src/screens/auth/CreateAccount.js`
Complete account creation screen with the following features:
- **All 14 fields from the design:**
  - Name
  - Company Name
  - GST No (with validation)
  - Mobile No (10-digit validation with +91 prefix)
  - Email ID
  - Building Name / Flat No.
  - Street Name
  - Select State (Indian states dropdown)
  - City Name
  - Area Name
  - Pin Code (6-digit validation)
  - Username
  - Password (with show/hide toggle)
  - Confirm Password (with validation)

- **Features:**
  - Form validation using react-hook-form
  - GST number format validation
  - Password matching validation
  - Indian states dropdown picker
  - Password visibility toggle
  - Loading states
  - Error handling
  - Responsive design matching app styles

### 2. Modified Files

#### `/src/graphql/graph_request.js`
Added `createCustomerWithMetafields()` function that:
1. Creates customer using Shopify Storefront API (customerCreate mutation)
2. Automatically logs in the user to get access token
3. Creates default address with the provided details
4. Stores custom fields (Company Name, GST No, Area Name, Username) as metafields using Admin API
5. Returns success/failure with access token

**Metafields Structure:**
- `custom.company_name` - Company Name (single_line_text_field)
- `custom.gst_number` - GST Number (single_line_text_field)
- `custom.area_name` - Area Name (single_line_text_field)
- `custom.username` - Username (single_line_text_field)

#### `/src/navigators/RootNavigator.js`
- Added import for CreateAccount component
- Added route for CreateAccount screen

#### `/src/navigators/AccountContainer.js`
- Added import for CreateAccount component
- Added CreateAccount screen to AccountStack

#### `/src/screens/profile/LoginScreen.js`
- Added "Create New Account" button to LoginForm
- Added divider with "OR" text
- Added navigation to CreateAccount screen
- Updated styles for new UI elements

## Field Mapping

### Standard Shopify Customer Fields
| UI Field | Shopify Field | Type |
|----------|--------------|------|
| Name (First Part) | firstName | String |
| Name (Last Part) | lastName | String |
| Email ID | email | String |
| Mobile No | phone | String |
| Password | password | String |

### Address Fields
| UI Field | Shopify Field | Type |
|----------|--------------|------|
| Building Name / Flat No. | address1 | String |
| Street Name | address2 | String |
| City Name | city | String |
| Select State | province | String |
| Pin Code | zip | String |
| - | country | String (hardcoded to "India") |

### Custom Metafields
| UI Field | Metafield Key | Namespace | Type |
|----------|--------------|-----------|------|
| Company Name | company_name | custom | single_line_text_field |
| GST No | gst_number | custom | single_line_text_field |
| Area Name | area_name | custom | single_line_text_field |
| Username | username | custom | single_line_text_field |

## Validation Rules

1. **Name**: Required
2. **Company Name**: Required
3. **GST No**: Required, must match pattern: `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`
4. **Mobile No**: Required, must be 10 digits starting with 6-9
5. **Email ID**: Required, must be valid email format
6. **Building Name**: Required
7. **Street Name**: Required
8. **State**: Required, must select from dropdown
9. **City Name**: Required
10. **Area Name**: Required
11. **Pin Code**: Required, must be 6 digits, cannot start with 0
12. **Username**: Required, minimum 3 characters
13. **Password**: Required, minimum 6 characters
14. **Confirm Password**: Required, must match password

## Indian States List
Includes all 28 states and 8 union territories:
- All major states (Maharashtra, Karnataka, Tamil Nadu, etc.)
- Union territories (Delhi, Puducherry, Chandigarh, etc.)

## Usage

### Navigation to Create Account Screen

From LoginScreen:
```javascript
navigation.navigate('CreateAccount');
```

From any screen in AccountContainer:
```javascript
navigation.navigate('CreateAccount');
```

From RootNavigator:
```javascript
navigation.navigate('CreateAccount');
```

### API Flow

1. User fills form and clicks "Save"
2. Form validation occurs
3. If valid, `createCustomerWithMetafields()` is called
4. Customer is created in Shopify
5. User is automatically logged in
6. Default address is created
7. Metafields are added (non-critical, won't fail registration if this fails)
8. Success: User is logged in and redirected
9. Failure: Error message is shown

## Shopify Admin API Requirements

⚠️ **Important**: The metafields functionality requires Shopify Admin API access. Ensure:

1. `ADMIN_TOKEN` environment variable is set in `.env`
2. Admin API token has the following permissions:
   - `write_customers`
   - `read_customers`
   - `write_customer_metafields`
   - `read_customer_metafields`

## Testing

To test the CreateAccount page:

1. Run the app: `npm run android` or `npm run ios`
2. Navigate to Login screen
3. Click "Create New Account" button
4. Fill in all required fields
5. Click "Save"
6. Verify:
   - Customer is created in Shopify
   - User is automatically logged in
   - Address is saved
   - Metafields are visible in Shopify Admin (Customer > Custom fields)

## Troubleshooting

### Issue: Metafields not saving
- Check if `ADMIN_TOKEN` is configured
- Verify Admin API permissions
- Check console logs for metafield errors (they won't fail the registration)

### Issue: GST validation failing
- Ensure GST number follows format: `22AAAAA0000A1Z5`
- 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + "Z" + 1 alphanumeric

### Issue: State dropdown not showing
- Check if `showStatePicker` state is being set
- Verify Modal component is rendering
- Check for any console errors

### Issue: Password toggle not working
- Verify `secureTextEntry` prop is being toggled
- Check `showPassword` state changes

## Future Enhancements

1. **Email verification**: Add OTP verification for email
2. **Mobile OTP**: Integrate with existing OTP system
3. **GST verification API**: Validate GST number with government API
4. **Profile picture upload**: Allow users to upload profile picture during registration
5. **Terms & Conditions**: Add checkbox for T&C acceptance
6. **Social login integration**: Add Google/Facebook/Apple sign-in options
7. **Address autocomplete**: Use Google Places API for address suggestions
8. **Pin code validation**: Validate pin code against serviceable areas

## Design Notes

- Follows the UI design provided in the image
- Uses app's existing color scheme and styles (AppStyles)
- Matches the purple header design (`#3F4180`)
- Uses consistent spacing and typography
- Mobile-responsive with ScrollView
- Keyboard-aware for better UX

## Security Considerations

1. Passwords are sent securely over HTTPS to Shopify
2. Passwords are hashed by Shopify (not stored in plain text)
3. Access tokens are stored in AsyncStorage
4. GST number validation prevents invalid data
5. Form validation prevents XSS attacks
6. Phone numbers are validated and formatted

## Dependencies Used

- `react-hook-form`: Form state management and validation
- `lucide-react-native`: Icons (ChevronDown)
- `@react-native-async-storage/async-storage`: Token storage
- `react-redux`: State management
- `@react-navigation/native`: Navigation

No additional dependencies need to be installed.
