# App Store Requirements Checklist for WinAI

## ✅ Completed Features

### Help & Support Screen
- ✅ Comprehensive Help & Support screen created (`app/help-support.tsx`)
- ✅ Email support functionality
- ✅ Bug reporting system
- ✅ Feature request system
- ✅ App rating and sharing functionality
- ✅ Privacy Policy and Terms of Service links
- ✅ About app information with version details
- ✅ Contact information and developer details

### App Configuration
- ✅ Updated `app.json` with required metadata
- ✅ Added proper app name and description
- ✅ Configured permissions and usage descriptions
- ✅ Added privacy policy and terms of service URLs
- ✅ Set up proper bundle identifiers

## 📋 Still Required for App Store Submission

### 1. Legal Documents (CRITICAL)
**You MUST create and host these documents:**

1. **Privacy Policy** (`PRIVACY_POLICY_TEMPLATE.md`)
   - Customize the template with your specific information
   - Host at: `https://winai.app/privacy-policy`
   - Required by both iOS and Android

2. **Terms of Service** (`TERMS_OF_SERVICE_TEMPLATE.md`)
   - Customize the template with your specific information
   - Host at: `https://winai.app/terms-of-service`
   - Required by both iOS and Android

### 2. Website Requirements
Create a simple website with:
- Landing page explaining the app
- Privacy Policy page
- Terms of Service page
- Support/Contact page
- Host at: `https://winai.app`

### 3. App Store Connect Configuration

#### iOS App Store:
1. **App Information**
   - Name: "WinAI - Wine Companion"
   - Subtitle: "AI-Powered Wine Collection"
   - Description: Use the description from `app.json`
   - Keywords: wine, AI, cellar, rating, collection, tasting, recommendations
   - Support URL: `https://winai.app/support`
   - Privacy Policy URL: `https://winai.app/privacy-policy`

2. **App Review Information**
   - Contact Email: `support@winai.app`
   - Demo Account: Create test account if needed
   - Review Notes: Explain any special features

3. **Screenshots Required**
   - iPhone 6.7": 1290x2796 pixels (3 screenshots minimum)
   - iPhone 6.5": 1242x2688 pixels (3 screenshots minimum)
   - iPad Pro: 2048x2732 pixels (3 screenshots minimum)

#### Google Play Store:
1. **Store Listing**
   - App Name: "WinAI - Wine Companion"
   - Short Description: "Your intelligent wine companion"
   - Full Description: Use detailed description
   - Contact Email: `support@winai.app`
   - Privacy Policy URL: `https://winai.app/privacy-policy`

2. **Screenshots Required**
   - Phone: 1080x1920 pixels minimum (2-8 screenshots)
   - Tablet: 1200x1920 pixels minimum (2-8 screenshots)

### 4. Content Rating
Both stores require content rating questionnaires:
- **Alcohol Reference**: Your app discusses wine
- **Age Rating**: 17+ (iOS) / Mature (Android) due to alcohol content
- Answer questionnaires honestly about alcohol-related content

### 5. App Icons and Graphics

#### Required Assets:
- **iOS**: Various sizes from 20x20 to 1024x1024
- **Android**: Adaptive icon (foreground + background)
- **Feature Graphic**: 1024x500 pixels (Google Play)

### 6. Testing Requirements

#### Pre-Submission Testing:
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Test all Help & Support links
- [ ] Verify Privacy Policy/Terms links work
- [ ] Test email functionality
- [ ] Test app rating/sharing
- [ ] Verify all permissions work correctly

### 7. Legal Considerations

#### Important Notes:
- **Age Verification**: Consider adding age verification for wine-related content
- **Alcohol Laws**: Add disclaimers about local alcohol laws
- **Content Moderation**: Implement reporting system for user-generated content
- **Data Export**: Implement GDPR-compliant data export feature

### 8. Additional Recommendations

#### For Better App Store Optimization:
1. **Localization**: Consider Spanish, French, Italian for wine markets
2. **App Preview Videos**: Create 30-second preview videos
3. **Seasonal Updates**: Plan regular updates with new features
4. **User Reviews**: Encourage positive reviews through in-app prompts

## 🚨 Critical Action Items

### Before Submission:
1. **Replace placeholder URLs** in `app/help-support.tsx`:
   - Update `YOUR_IOS_APP_ID` with actual App Store ID
   - Update package name `com.winai.app` if different

2. **Update `app.json`**:
   - Replace GitHub URL with actual repository
   - Update Apple Team ID if needed
   - Add actual App Store URLs once published

3. **Legal Review**:
   - Have a lawyer review Privacy Policy and Terms of Service
   - Ensure compliance with local laws
   - Consider trademark registration for "WinAI"

### Contact Information Setup:
Create these email addresses:
- `support@winai.app` - User support
- `privacy@winai.app` - Privacy inquiries
- `legal@winai.app` - Legal matters
- `bugs@winai.app` - Bug reports
- `features@winai.app` - Feature requests

## 📞 Ready for Stores?

Your app now includes all the technical requirements for App Store submission. The main remaining tasks are:

1. ✅ **Technical Implementation** - Complete!
2. 🔄 **Legal Documents** - Templates provided, need customization
3. 🔄 **Website Hosting** - Need to create and host
4. 🔄 **Store Accounts** - Set up developer accounts
5. 🔄 **Content Creation** - Screenshots, descriptions, etc.

## 🎉 Next Steps

1. Customize the legal document templates
2. Create and host your website
3. Set up App Store developer accounts
4. Create screenshots and marketing materials
5. Submit for review!

Good luck with your App Store submission! 🚀 