// Email-compatible HTML export
// Uses table-based layout with inline styles for maximum email client compatibility

// Helper to check if image is base64 and optimize it
function optimizeImageForEmail(imgSrc, maxWidth = 600) {
  // If it's not a base64 image, return as-is
  if (!imgSrc || !imgSrc.startsWith('data:image')) {
    return imgSrc;
  }
  
  // For very long base64 strings (over 50KB), warn but still include
  // In production, recommend using hosted images
  if (imgSrc.length > 50000) {
    console.warn('Large base64 image detected. For better email delivery, consider using hosted image URLs.');
  }
  
  return imgSrc;
}

// Google Fonts URL for email
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap';

// Font stacks with proper fallbacks
const FONT_STACKS = {
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'default': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif"
};

function getFontStack(fontFamily) {
  return FONT_STACKS[fontFamily] || FONT_STACKS['default'];
}

export function exportToHTML(newsletter) {
  if (!newsletter || !newsletter.sections) {
    return '';
  }

  const sections = newsletter.sections.map(section => {
    switch (section.type) {
      case 'header':
        return exportHeader(section);
      case 'marquee':
        return exportMarquee(section);
      case 'text':
        return exportText(section);
      case 'sectionHeader':
        return exportSectionHeader(section);
      case 'imageCollage':
        return exportImageCollage(section);
      case 'profileCards':
        return exportProfileCards(section);
      case 'recipe':
        return exportRecipe(section);
      case 'footer':
        return exportFooter(section);
      default:
        return '';
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Newsletter</title>
  
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
  
  <style type="text/css">
    /* Google Fonts import as backup */
    @import url('${GOOGLE_FONTS_URL}');
    
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    
    /* Font definitions */
    body {
      font-family: ${FONT_STACKS['default']};
    }
    
    .font-poppins { font-family: ${FONT_STACKS['Poppins']}; }
    .font-hebrew { font-family: ${FONT_STACKS['Noto Sans Hebrew']}; }
    
    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
    }
  </style>
  
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: ${FONT_STACKS['default']}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; max-width: 600px;">
          ${sections}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Export just the content table for pasting into Gmail
export function exportForGmail(newsletter) {
  if (!newsletter || !newsletter.sections) {
    return '';
  }

  const sections = newsletter.sections.map(section => {
    switch (section.type) {
      case 'header':
        return exportHeader(section);
      case 'marquee':
        return exportMarquee(section);
      case 'text':
        return exportText(section);
      case 'sectionHeader':
        return exportSectionHeader(section);
      case 'imageCollage':
        return exportImageCollage(section);
      case 'profileCards':
        return exportProfileCards(section);
      case 'recipe':
        return exportRecipe(section);
      case 'footer':
        return exportFooter(section);
      default:
        return '';
    }
  }).join('\n');

  // For Gmail paste - simple table without contenteditable (Gmail ignores it anyway)
  // Gmail strips most attributes and makes content editable in compose mode - this is expected
  return `<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto; font-family: ${FONT_STACKS['default']};">
  ${sections}
</table>`;
}

function exportHeader(section) {
  const bgStyle = section.gradientEnd 
    ? `background: linear-gradient(180deg, ${section.backgroundColor} 0%, ${section.gradientEnd} 100%); background-color: ${section.backgroundColor};`
    : `background-color: ${section.backgroundColor};`;

  const logoWidth = section.logoWidth || 120;
  const logoHeight = section.logoHeight === 'auto' ? 'auto' : `${section.logoHeight}px`;
  const logoAlignment = section.logoAlignment || 'center';
  const logoMargin = logoAlignment === 'left' ? '0 auto 20px 0' : 
                     logoAlignment === 'right' ? '0 0 20px auto' : '0 auto 20px';
  
  const titleFontSize = section.titleFontSize || 28;
  const titleFontWeight = section.titleFontWeight || '700';
  const titleFontStyle = section.titleFontStyle || 'normal';
  const titleLetterSpacing = section.titleLetterSpacing || '-0.02em';
  const titleLineHeight = section.titleLineHeight || 1.2;
  
  const subtitleFontSize = section.subtitleFontSize || 16;
  const subtitleFontWeight = section.subtitleFontWeight || '400';
  const subtitleLetterSpacing = section.subtitleLetterSpacing || '0';
  
  const textColor = section.textColor || '#ffffff';
  const fontStack = FONT_STACKS['Poppins'];

  // Build title
  const titleHtml = `<h1 style="margin: 0 0 10px; font-size: ${titleFontSize}px; font-weight: ${titleFontWeight}; font-style: ${titleFontStyle}; letter-spacing: ${titleLetterSpacing}; font-family: ${fontStack}; line-height: ${titleLineHeight}; color: ${textColor};">
    ${section.title || ''}
  </h1>`;

  // Date badge
  const dateBadgeHtml = section.showDateBadge && section.dateBadgeText ? `
    <div style="position: absolute; bottom: 16px; right: 16px; background-color: ${section.dateBadgeBg || '#04D1FC'}; color: ${section.dateBadgeColor || '#ffffff'}; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; font-family: ${fontStack}; letter-spacing: 0.05em;">
      ${section.dateBadgeText}
    </div>` : '';

  // For email, we can't use position: absolute reliably, so we'll use a table-based approach for the badge
  const badgeRow = section.showDateBadge && section.dateBadgeText ? `
    <tr>
      <td align="right" style="padding: 0 20px 20px;">
        <span style="background-color: ${section.dateBadgeBg || '#04D1FC'}; color: ${section.dateBadgeColor || '#ffffff'}; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; font-family: ${fontStack}; letter-spacing: 0.05em; display: inline-block;">
          ${section.dateBadgeText}
        </span>
      </td>
    </tr>` : '';

  // Hero image
  const heroImageHeight = section.heroImageHeight || 200;
  const heroImageFit = section.heroImageFit || 'cover';
  const heroImageHtml = section.heroImage ? `
    <img src="${section.heroImage}" alt="Hero" style="width: 100%; height: ${heroImageHeight}px; max-width: 100%; display: block; margin: 0 auto 24px; object-fit: ${heroImageFit}; border-radius: 8px;" />
  ` : '';

  return `
    <tr>
      <td style="${bgStyle} padding: 40px 20px ${section.showDateBadge ? '10px' : '40px'}; text-align: ${logoAlignment === 'center' ? 'center' : logoAlignment}; color: ${textColor};">
        ${section.logo ? `<img src="${section.logo}" alt="Logo" style="width: ${logoWidth}px; height: ${logoHeight}; max-width: 100%; display: block; margin: ${logoMargin}; object-fit: contain;" />` : ''}
        ${heroImageHtml}
        <div style="text-align: center;">
          ${titleHtml}
          ${section.subtitle ? `<p style="margin: 0; font-size: ${subtitleFontSize}px; font-weight: ${subtitleFontWeight}; letter-spacing: ${subtitleLetterSpacing}; opacity: 0.95; font-family: ${fontStack}; line-height: 1.4; color: ${textColor};">${section.subtitle}</p>` : ''}
        </div>
      </td>
    </tr>
    ${badgeRow}`;
}

function exportMarquee(section) {
  const items = (section.items || '').split(',').map(s => s.trim()).filter(Boolean);
  const separator = section.separator || '•';
  const fontSize = section.fontSize || 14;
  const fontWeight = section.fontWeight || '500';
  const paddingVertical = section.paddingVertical || 10;
  const fontStack = FONT_STACKS['Poppins'];
  
  const itemsHtml = items.map((item, i) => {
    const sep = i < items.length - 1 
      ? `<span style="opacity: 0.5; margin: 0 16px;">${separator}</span>` 
      : '';
    return `<span style="white-space: nowrap;">${item}</span>${sep}`;
  }).join('');

  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#04D1FC'}; padding: ${paddingVertical}px 20px; text-align: center; color: ${section.textColor || '#ffffff'}; font-family: ${fontStack}; font-size: ${fontSize}px; font-weight: ${fontWeight}; letter-spacing: ${section.letterSpacing || '0.02em'};">
        ${itemsHtml}
      </td>
    </tr>`;
}

function exportText(section) {
  const dirAttr = section.direction === 'rtl' ? 'dir="rtl"' : '';
  const content = (section.content || '').replace(/\n/g, '<br>');
  const fontFamily = section.fontFamily || 'Poppins';
  const fontStack = getFontStack(fontFamily);
  
  return `
    <tr>
      <td ${dirAttr} style="background-color: ${section.backgroundColor || '#ffffff'}; padding: ${section.padding || 40}px 20px; font-family: ${fontStack}; font-size: ${section.fontSize || 16}px; color: ${section.color || '#333333'}; text-align: ${section.textAlign || 'center'}; line-height: 1.6;">
        ${content}
      </td>
    </tr>`;
}

function exportSectionHeader(section) {
  const fontStack = FONT_STACKS['Poppins'];
  
  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#00D4D4'}; color: ${section.color || '#ffffff'}; padding: ${section.padding || 12}px 20px; text-align: center; font-family: ${fontStack}; font-size: ${section.fontSize || 18}px; font-weight: ${section.fontWeight || 700}; letter-spacing: ${section.letterSpacing || '0.1em'}; text-transform: uppercase;">
        ${section.text || ''}
      </td>
    </tr>`;
}

function exportImageCollage(section) {
  const images = section.images || [];
  if (images.length === 0) return '';

  const gap = section.gap || 10;
  const imageHeight = section.imageHeight || 200;
  const focalPoints = section.focalPoints || [];
  const imageBackgrounds = section.imageBackgrounds || [];
  const imageOverlays = section.imageOverlays || [];
  const sectionPadding = section.padding ?? 20;
  
  // Handle single/full-width layout for GIF exports
  const isSingleLayout = section.layout === 'single' || section.layout === 'single-wide';
  
  let columnsCount = 4;
  if (isSingleLayout) columnsCount = 1;
  else if (section.layout === '2-column') columnsCount = 2;
  else if (section.layout === '3-column') columnsCount = 3;
  else if (section.layout === '4-column') columnsCount = 4;

  // Calculate width based on container width minus padding and gaps
  const containerWidth = 600 - (sectionPadding * 2);
  const totalGapWidth = gap * (columnsCount - 1);
  const imageWidth = isSingleLayout ? 600 : Math.floor((containerWidth - totalGapWidth) / columnsCount);

  let imageCells = '';
  const validImages = images.filter(img => img);
    
  for (let i = 0; i < validImages.length; i++) {
    const img = validImages[i];
    const isLastInRow = (i + 1) % columnsCount === 0;
    const isLastImage = i === validImages.length - 1;
    const focalPoint = focalPoints[i] || { x: 50, y: 50 };
    const bgColor = imageBackgrounds[i] || '';
    const overlay = imageOverlays[i] || { color: '', opacity: 0 };
    
    // Use table-based layout for better email client compatibility
    // Background images in VML for Outlook compatibility
    let cellContent = '';
    
    const borderRadius = isSingleLayout ? '0' : '4px';
    
    if (bgColor) {
      // Image with background color (for transparent PNGs)
      cellContent = `
        <table role="presentation" width="${imageWidth}" height="${imageHeight}" cellspacing="0" cellpadding="0" border="0" style="border-radius: ${borderRadius}; overflow: hidden;">
          <tr>
            <td style="background-color: ${bgColor}; text-align: center; vertical-align: middle;">
              <img src="${img}" alt="Image ${i + 1}" width="${imageWidth}" height="${imageHeight}" style="display: block; max-width: 100%; height: auto; border-radius: ${borderRadius};" />
            </td>
          </tr>
        </table>`;
    } else {
      // Regular image - use explicit width/height for email compatibility
      cellContent = `<img src="${img}" alt="Image ${i + 1}" width="${imageWidth}" height="${imageHeight}" style="display: block; width: ${imageWidth}px; height: ${imageHeight}px; border-radius: ${borderRadius}; object-fit: cover;" />`;
    }
    
    // Calculate padding - no padding for single layout, otherwise normal gaps
    const rightPadding = isSingleLayout ? 0 : ((isLastInRow || isLastImage) ? 0 : gap);
    const bottomPadding = isSingleLayout ? 0 : gap;
    
    imageCells += `
      <td width="${imageWidth}" style="padding: 0 ${rightPadding}px ${bottomPadding}px 0; vertical-align: top;">
        ${cellContent}
      </td>`;
    
    // Start new row if needed (but not after last image)
    if (isLastInRow && !isLastImage) {
      imageCells += `
    </tr>
    <tr>`;
    }
  }

  if (!imageCells) return '';

  // Use section padding (0 for GIF exports)
  const outerPadding = isSingleLayout && sectionPadding === 0 ? 0 : sectionPadding;

  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: ${outerPadding}px;">
        <table role="presentation" width="${isSingleLayout ? 600 : '100%'}" cellspacing="0" cellpadding="0" border="0">
          <tr>
            ${imageCells}
          </tr>
        </table>
      </td>
    </tr>`;
}

function exportProfileCards(section) {
  const profiles = section.profiles || [];
  if (profiles.length === 0) return '';

  const columns = section.columns || 4;
  const borderRadius = section.imageShape === 'circular' ? '50%' : '8px';
  const cellWidth = Math.floor(100 / columns);
  const fontStack = FONT_STACKS['Poppins'];

  let profileCells = '';
  profiles.forEach((profile, i) => {
    if (!profile) return;
    
    profileCells += `
      <td width="${cellWidth}%" style="text-align: center; vertical-align: top; padding: 10px;">
        ${profile.image ? `<img src="${profile.image}" alt="${profile.name || ''}" style="width: 80px; height: 80px; display: block; margin: 0 auto 10px; border-radius: ${borderRadius}; object-fit: cover;" />` : ''}
        ${section.showName !== false && profile.name ? `<div style="font-family: ${fontStack}; font-size: 14px; font-weight: 600; color: #333333; margin: 8px 0 4px;">${profile.name}</div>` : ''}
        ${section.showTitle !== false && profile.title ? `<div style="font-family: ${fontStack}; font-size: 12px; color: #666666;">${profile.title}</div>` : ''}
      </td>`;
  });

  if (!profileCells) return '';

  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 30px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            ${profileCells}
          </tr>
        </table>
      </td>
    </tr>`;
}

function exportRecipe(section) {
  const ingredients = (section.ingredients || '').replace(/\n/g, '<br>');
  const instructions = (section.instructions || '').replace(/\n/g, '<br>');
  const fontStack = FONT_STACKS['Noto Sans Hebrew'];
  
  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 30px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="text-align: center;">
              <h2 dir="rtl" style="font-family: ${fontStack}; font-size: 24px; font-weight: 600; color: #333333; margin: 0 0 20px;">${section.title || ''}</h2>
            </td>
          </tr>
          ${section.image ? `
          <tr>
            <td style="padding-bottom: 20px;">
              <img src="${section.image}" alt="${section.title || ''}" style="width: 100%; height: auto; display: block; border-radius: 8px;" />
            </td>
          </tr>` : ''}
          <tr>
            <td dir="rtl" style="font-family: ${fontStack}; font-size: 14px; color: #333333; line-height: 1.8; text-align: right; padding-bottom: 15px;">
              ${ingredients}
            </td>
          </tr>
          <tr>
            <td dir="rtl" style="font-family: ${fontStack}; font-size: 14px; color: #333333; line-height: 1.8; text-align: right;">
              ${instructions}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function exportFooter(section) {
  const bgStyle = section.gradientEnd 
    ? `background: linear-gradient(180deg, ${section.backgroundColor} 0%, ${section.gradientEnd} 100%); background-color: ${section.backgroundColor};`
    : `background-color: ${section.backgroundColor};`;

  const text = (section.text || '').replace(/\n/g, '<br>');
  const fontStack = FONT_STACKS['Poppins'];

  return `
    <tr>
      <td style="${bgStyle} padding: ${section.padding || 30}px 20px; text-align: center; color: ${section.color || '#ffffff'}; font-family: ${fontStack}; font-size: ${section.fontSize || 14}px; line-height: 1.8;">
        ${text}
      </td>
    </tr>`;
}
