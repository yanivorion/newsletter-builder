# 📧 Newsletter Builder

A professional email newsletter builder with advanced design features, Hebrew/English support, image collages, and background removal integration.

## ✨ Features

- **Visual Newsletter Editor** - Build beautiful newsletters with drag-and-drop sections
- **Multiple Templates** - Pre-designed templates including the Electr_n professional template
- **Advanced Image Features**
  - Multiple collage layouts (2-col, 3-col, 4-col, grid, circular)
  - Background removal powered by remove.bg API
  - Profile cards with circular/square images
- **Bilingual Support** - Full Hebrew (RTL) and English (LTR) text support
- **Typography** - Poppins and Noto Sans Hebrew fonts
- **Gradient Color Picker** - Create beautiful gradient backgrounds
- **Email-Compatible Export** - Converts to HTML with table-based layout and inline styles

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - The app will open automatically at `http://localhost:3000`
   - Or manually navigate to the URL shown in terminal

## 📖 How to Use

### 1. Select a Template
- Choose from available templates (Electr_n, Minimal, Corporate)
- Each template comes pre-configured with sections

### 2. Edit Sections
- Click on any section in the preview to select it
- The right sidebar will show editing options for that section
- Modify text, colors, fonts, images, and more

### 3. Add/Remove Sections
- Use the buttons at the bottom to add new sections
- Select a section and click "Delete" in the sidebar to remove it
- Use "Move Up" / "Move Down" to reorder sections

### 4. Upload Images
- Click on image placeholders to upload
- Use the "✨ Remove BG" button to remove backgrounds (uses remove.bg API)
- Supported formats: JPG, PNG, WebP

### 5. Export to HTML
- Click "Export HTML" in the top right
- Copy the HTML code or download as file
- The HTML is email-compatible with table-based layout and inline styles

## 🎨 Section Types

### Header
- Logo placeholder
- Title and subtitle
- Gradient background

### Text Block
- Rich text content
- Hebrew/English support (RTL/LTR)
- Customizable typography and colors

### Section Header
- Eye-catching section dividers
- Turquoise banner style (customizable)

### Image Collage
- Multiple layouts: 2-col, 3-col, 4-col, grid, circular
- Adjustable gap and image height
- Perfect for photo galleries

### Profile Cards
- Circular or square images
- Name and title display
- Ideal for team members or testimonials

### Recipe Section
- Hebrew text support
- Image + ingredients + instructions
- Perfect for monthly recipes

### Footer
- Gradient background
- Contact information
- Social links

## 🔧 Configuration

### Remove.bg API
The app uses remove.bg API for background removal. The API key is pre-configured in the code:
- Location: `src/components/SidebarEditor.jsx`
- Free tier: 50 images/month
- To change API key, update the `REMOVE_BG_API_KEY` constant

### Fonts
The app uses Google Fonts:
- **Poppins** - For English text and headings
- **Noto Sans Hebrew** - For Hebrew text

These are loaded in `index.html` and work automatically.

## 📧 Email Export

### How it Works
1. Converts your newsletter to email-compatible HTML
2. Uses table-based layout (works in all email clients)
3. Applies inline styles (CSS embedded in HTML tags)
4. Handles images as base64 or external URLs

### Testing Your Newsletter
Before sending, test your newsletter in:
- Gmail
- Outlook
- Apple Mail
- Mobile email clients

**Recommended Tools:**
- Litmus - Email testing service
- Email on Acid - Email preview tool
- Mail Tester - Spam score checker

## 🛠️ Customization

### Adding New Templates
Edit `src/components/TemplateSelector.jsx`:

```javascript
{
  id: 'my-template',
  name: 'My Custom Template',
  description: 'Description here',
  sections: [
    // Add your sections here
  ]
}
```

### Styling
All styles are in CSS files:
- `src/App.css` - Main app styles
- `src/components/*.css` - Component-specific styles

### Color Schemes
Modify color palettes in template definitions or section editors.

## 🐛 Troubleshooting

### Images Not Showing in Email
- Images must be hosted online (use services like Cloudinary, Imgur)
- Base64 images work but increase email size
- Some email clients block images by default

### Background Removal Not Working
- Check your remove.bg API key
- Verify you haven't exceeded the free tier limit (50/month)
- Ensure image format is supported (JPG, PNG)
- Check browser console for error messages

### Hebrew Text Not Displaying
- Ensure Noto Sans Hebrew font is loaded
- Check the text direction is set to RTL
- Verify font-family is set to "Noto Sans Hebrew"

### Export HTML Not Working
- Check browser console for errors
- Try a simpler newsletter first
- Ensure all images are properly loaded

## 📦 Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist` directory.

## 🚀 Deployment

### Deploy to Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Framework preset: Vite
4. Deploy

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🙏 Credits

- **Remove.bg** - Background removal API
- **Google Fonts** - Poppins and Noto Sans Hebrew
- **React** - UI framework
- **Vite** - Build tool

## 💡 Tips

1. **Keep it Simple** - Email clients have limited CSS support
2. **Test Thoroughly** - Always test in multiple email clients
3. **Optimize Images** - Compress images before upload
4. **Mobile First** - Design for mobile email readers
5. **Accessibility** - Use proper alt text and semantic HTML

## 🔗 Resources

- [Email Design Best Practices](https://www.campaignmonitor.com/resources/)
- [Can I Email](https://www.caniemail.com/) - Email CSS compatibility
- [Really Good Emails](https://reallygoodemails.com/) - Email design inspiration

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.

**Want to Contribute?** Pull requests are welcome!
