# Upwork Extension v3.0.0 - Troubleshooting Guide

## 🔧 Content Script Connection Issues

If you see the error: **"Could not establish connection. Receiving end does not exist"**

### Quick Fix Steps:

#### 1. **Reload the Extension**
- Go to `chrome://extensions/`
- Find "Magic Upwork Assistant"
- Click the reload button (🔄)

#### 2. **Navigate to Upwork**
- Go to: `https://www.upwork.com/nx/search/jobs/?q=rails`
- Make sure the page is fully loaded

#### 3. **Test Connection**
- Click the extension icon
- Click the ⚙️ settings button
- Choose "4. Test Content Script Connection"
- Follow the prompts

#### 4. **Manual Refresh**
- If connection test fails, refresh the Upwork page (F5)
- Try the extension again

### Supported Upwork URLs:
- `https://www.upwork.com/nx/search/jobs*`
- `https://www.upwork.com/nx/search/*`
- `https://www.upwork.com/jobs/*`
- `https://www.upwork.com/freelance-jobs/*`
- `https://www.upwork.com/search/jobs*`

### Debug Tools:

#### **Settings Menu (⚙️)**
1. **Theme Settings** - Toggle dark/light mode
2. **Notification Preferences** - Coming soon
3. **Debug Upwork Page Structure** - Analyze page elements
4. **Test Content Script Connection** - Check if extension can communicate
5. **View Extension Logs** - Check browser console

#### **Console Debugging**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for messages starting with "Upwork"
4. Use the debug option to see page structure analysis

### Common Issues & Solutions:

| Issue | Solution |
|-------|----------|
| "Not on Upwork" error | Navigate to a supported Upwork URL |
| No jobs found | Try different keywords, check debug info |
| Connection timeout | Refresh page, reload extension |
| CSP violations | Extension now uses external scripts (fixed) |
| DOM exceptions | Improved error handling (fixed) |

### Manual Content Script Injection:

The extension now automatically tries to inject the content script if it's not found. This happens when:
- The page was loaded before the extension
- The URL pattern didn't match exactly
- There was a temporary loading issue

### Extension Permissions:

Make sure the extension has these permissions:
- ✅ `activeTab` - Access current tab
- ✅ `scripting` - Inject content scripts
- ✅ `storage` - Save settings
- ✅ `tabs` - Query tab information
- ✅ Host access to `https://www.upwork.com/*`

### Still Having Issues?

1. **Check Extension Version**: Should be v3.0.0 - AI Master Edition
2. **Browser Compatibility**: Chrome 88+, Firefox 85+, Edge 88+
3. **Clear Extension Data**: Remove and reinstall if needed
4. **Check Console**: Look for specific error messages

### Success Indicators:

✅ Extension icon shows in toolbar  
✅ Popup opens with green "Job Scraper AI" title  
✅ Settings menu has 5 options  
✅ Connection test passes  
✅ Debug shows page structure info  
✅ Job search returns results  

---

**Version**: 3.0.0 - AI Master Edition  
**Last Updated**: 2025-09-28  
**Support**: Check browser console for detailed error messages
