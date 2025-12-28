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
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&family=Assistant:wght@300;400;500;600;700&family=Heebo:wght@300;400;500;600;700&display=swap';

// Font stacks with proper fallbacks
const FONT_STACKS = {
  'Poppins': "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif",
  'Inter': "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Space Grotesk': "'Space Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'Rubik': "'Rubik', 'Arial Hebrew', Arial, sans-serif",
  'Assistant': "'Assistant', 'Arial Hebrew', Arial, sans-serif",
  'Heebo': "'Heebo', 'Arial Hebrew', Arial, sans-serif",
  'default': "'Noto Sans Hebrew', 'Arial Hebrew', 'Poppins', Arial, sans-serif"
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
      case 'styledTitle':
        return exportStyledTitle(section);
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
      case 'promoCard':
        return exportPromoCard(section);
      case 'accentText':
        return exportAccentText(section);
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
      case 'styledTitle':
        return exportStyledTitle(section);
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
      case 'promoCard':
        return exportPromoCard(section);
      case 'accentText':
        return exportAccentText(section);
      case 'footer':
        return exportFooter(section);
      default:
        return '';
    }
  }).join('\n');

  // For Gmail paste - clean table structure with inline styles only
  // Gmail strips <style> tags, so everything must be inline
  // Using dir="rtl" for proper Hebrew text alignment
  return `<table dir="rtl" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; max-width: 600px; width: 100%; margin: 0 auto; font-family: 'Noto Sans Hebrew', 'Arial Hebrew', Arial, sans-serif; border-collapse: collapse; direction: rtl;">
${sections}
</table>`;
}

function exportHeader(section) {
  const bgStyle = section.gradientEnd 
    ? `background: linear-gradient(180deg, ${section.backgroundColor || '#1a1a2e'} 0%, ${section.gradientEnd} 100%); background-color: ${section.backgroundColor || '#1a1a2e'};`
    : `background-color: ${section.backgroundColor || '#1a1a2e'};`;

  const logoWidth = section.logoWidth || 120;
  const logoHeight = section.logoHeight === 'auto' ? 'auto' : `${section.logoHeight}px`;
  const logoAlignment = section.logoAlignment || 'center';
  const logoMargin = logoAlignment === 'left' ? '0 auto 16px 0' : logoAlignment === 'right' ? '0 0 16px auto' : '0 auto 16px';
  
  const titleFontSize = section.titleFontSize || 28;
  const titleFontWeight = section.titleFontWeight || '700';
  const titleFontStyle = section.titleFontStyle || 'normal';
  const titleLetterSpacing = section.titleLetterSpacing || '-0.02em';
  const titleLineHeight = section.titleLineHeight || 1.2;
  
  const subtitleFontSize = section.subtitleFontSize || 16;
  const subtitleFontWeight = section.subtitleFontWeight || '400';
  const subtitleLetterSpacing = section.subtitleLetterSpacing || '0';
  
  const textColor = section.textColor || '#ffffff';
  const fontFamily = section.fontFamily || 'Poppins';
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Poppins'];

  // Title HTML - handle both simple and segments mode
  let titleContent = section.title || '';
  if (section.titleMode === 'segments' && section.segments && section.segments.length > 0) {
    // Build segments with different weights/styles
    titleContent = section.segments.map(seg => 
      `<span style="font-weight: ${seg.fontWeight || '700'}; font-style: ${seg.fontStyle || 'normal'}; color: ${seg.color || textColor};">${seg.text || ''}</span>`
    ).join(' ');
  }
  const titleHtml = `<h1 style="margin: 0 0 8px; font-size: ${titleFontSize}px; font-weight: ${titleFontWeight}; font-style: ${titleFontStyle}; letter-spacing: ${titleLetterSpacing}; font-family: ${fontStack}; line-height: ${titleLineHeight}; color: ${textColor};">${titleContent}</h1>`;

  // Date badge row
  const badgeRow = section.showDateBadge && section.dateBadgeText 
    ? `<tr><td align="right" style="padding: 8px 20px 16px;"><span style="background-color: ${section.dateBadgeBg || '#04D1FC'}; color: ${section.dateBadgeColor || '#ffffff'}; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; font-family: ${fontStack}; letter-spacing: 0.05em; display: inline-block;">${section.dateBadgeText}</span></td></tr>` 
    : '';

  // Hero image
  const heroImageHeight = section.heroImageHeight || 200;
  const heroImageHtml = section.heroImage 
    ? `<img src="${section.heroImage}" alt="Hero" style="width: 100%; height: ${heroImageHeight}px; max-width: 100%; display: block; margin: 0 auto 20px; object-fit: cover; border-radius: 8px;" />`
    : '';

  // Logo HTML
  const logoHtml = section.logo 
    ? `<img src="${section.logo}" alt="Logo" width="${logoWidth}" style="height: ${logoHeight}; max-width: 100%; display: block; margin: ${logoMargin}; object-fit: contain;" />`
    : '';

  // Subtitle HTML
  const subtitleHtml = section.subtitle 
    ? `<p style="margin: 0; font-size: ${subtitleFontSize}px; font-weight: ${subtitleFontWeight}; letter-spacing: ${subtitleLetterSpacing}; opacity: 0.95; font-family: ${fontStack}; line-height: 1.4; color: ${textColor};">${section.subtitle}</p>`
    : '';

  const bottomPadding = section.showDateBadge ? '8px' : '32px';

  return `<tr><td style="${bgStyle} padding: 32px 20px ${bottomPadding}; text-align: ${logoAlignment === 'center' ? 'center' : logoAlignment}; color: ${textColor};">${logoHtml}${heroImageHtml}<div style="text-align: center;">${titleHtml}${subtitleHtml}</div></td></tr>${badgeRow}`;
}

function exportStyledTitle(section) {
  const bgColor = section.backgroundColor || '#7B68EE';
  const bgStyle = section.gradientEnd 
    ? `background: linear-gradient(180deg, ${bgColor} 0%, ${section.gradientEnd || '#9370DB'} 100%); background-color: ${bgColor};`
    : `background-color: ${bgColor};`;

  const segments = section.segments || [];
  const fontSize = section.fontSize || 48;
  const letterSpacing = section.letterSpacing || '-0.02em';
  const textAlign = section.textAlign || 'right';
  const textDirection = section.textDirection || 'rtl';
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  const borderRadius = section.borderRadius || 16;
  const layout = section.layout || 'default';

  // Build segments HTML - simple inline spans
  const segmentsHtml = segments.map(seg => 
    `<span style="font-weight: ${seg.fontWeight || '700'}; color: ${seg.color || '#FFFFFF'};">${seg.text || ''}</span>`
  ).join(' ');

  const paddingTop = section.paddingTop || 24;
  const paddingBottom = section.paddingBottom || 24;
  const paddingHorizontal = section.paddingHorizontal || 24;
  const outerBg = section.outerBackgroundColor || 'transparent';

  // Strip layouts - simple side-by-side (no overlap possible in email)
  if ((layout === 'strip-left' || layout === 'strip-right') && section.stripImage) {
    const stripImageSize = section.stripImageWidth || 180;
    const stripImageRadius = section.stripImageBorderRadius || '50%';
    const imageOnLeft = layout === 'strip-left';
    
    // Simple clean layout: image next to colored strip
    return `
    <tr>
      <td style="background-color: ${outerBg}; padding: 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            ${imageOnLeft ? `
            <td width="${stripImageSize}" valign="middle" style="padding-right: 0;">
              <img src="${section.stripImage}" alt="" width="${stripImageSize}" height="${stripImageSize}" style="display: block; border-radius: ${stripImageRadius};" />
            </td>
            <td valign="middle" style="${bgStyle} padding: ${paddingTop}px ${paddingHorizontal}px ${paddingBottom}px ${paddingHorizontal}px; border-radius: 0 ${borderRadius}px ${borderRadius}px 0;">
              <h1 dir="rtl" style="margin: 0; font-size: ${fontSize}px; letter-spacing: ${letterSpacing}; line-height: 1.2; font-family: 'Noto Sans Hebrew', Arial, sans-serif; text-align: right; color: #FFFFFF;">${segmentsHtml}</h1>
            </td>
            ` : `
            <td valign="middle" style="${bgStyle} padding: ${paddingTop}px ${paddingHorizontal}px ${paddingBottom}px ${paddingHorizontal}px; border-radius: ${borderRadius}px 0 0 ${borderRadius}px;">
              <h1 dir="rtl" style="margin: 0; font-size: ${fontSize}px; letter-spacing: ${letterSpacing}; line-height: 1.2; font-family: 'Noto Sans Hebrew', Arial, sans-serif; text-align: right; color: #FFFFFF;">${segmentsHtml}</h1>
            </td>
            <td width="${stripImageSize}" valign="middle" style="padding-left: 0;">
              <img src="${section.stripImage}" alt="" width="${stripImageSize}" height="${stripImageSize}" style="display: block; border-radius: ${stripImageRadius};" />
            </td>
            `}
          </tr>
        </table>
      </td>
    </tr>`;
  }

  // Decorative image layout
  if (section.showDecorativeImage && section.decorativeImage) {
    const decorativeImageWidth = section.decorativeImageWidth || 150;
    
    return `
    <tr>
      <td style="${bgStyle} padding: ${paddingTop}px ${paddingHorizontal}px ${paddingBottom}px; border-radius: ${borderRadius}px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="${decorativeImageWidth}" valign="middle" style="padding: 8px;">
              <img src="${section.decorativeImage}" alt="" width="${decorativeImageWidth}" style="display: block; border-radius: 50%;" />
            </td>
            <td valign="middle" style="padding: 8px;">
              <h1 dir="${textDirection}" style="margin: 0; font-size: ${fontSize}px; letter-spacing: ${letterSpacing}; line-height: 1.2; font-family: ${fontStack}; text-align: ${textAlign}; color: #FFFFFF;">${segmentsHtml}</h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }

  // Standard layout - clean and simple
  const wrapperPadding = outerBg !== 'transparent' 
    ? `padding: ${section.outerPaddingTop || 12}px ${section.outerPaddingRight || 12}px ${section.outerPaddingBottom || 12}px ${section.outerPaddingLeft || 12}px;` 
    : '';

  return `
    <tr>
      <td style="background-color: ${outerBg}; ${wrapperPadding}">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="${bgStyle} padding: ${paddingTop}px ${paddingHorizontal}px ${paddingBottom}px; text-align: ${textAlign}; border-radius: ${borderRadius}px;">
              <h1 dir="${textDirection}" style="margin: 0; font-size: ${fontSize}px; letter-spacing: ${letterSpacing}; line-height: 1.2; font-family: ${fontStack}; text-align: ${textAlign}; color: #FFFFFF;">${segmentsHtml}</h1>
              ${section.subtitle ? `<p dir="${textDirection}" style="margin: 12px 0 0; font-size: ${section.subtitleFontSize || 18}px; font-family: ${fontStack}; color: ${section.subtitleColor || '#FFFFFF'}; text-align: ${textAlign};">${section.subtitle}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function exportPromoCard(section) {
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  const textDirection = section.textDirection || 'rtl';
  const dirAttr = textDirection === 'rtl' ? 'dir="rtl"' : '';
  const textAlign = textDirection === 'rtl' ? 'right' : 'left';
  
  const title = section.title || '';
  const description = section.description || '';
  const ctaText = section.ctaText || '';
  const showCta = section.showCta !== false;
  const showImage = section.layout !== 'text-only' && section.layout !== 'no-image';
  const isImageLeft = section.layout === 'image-left';
  const isImageTop = section.layout === 'image-top';
  
  const backgroundColor = section.backgroundColor || '#F5F5F7';
  const titleColor = section.titleColor || '#1D1D1F';
  const descColor = section.descColor || '#666666';
  const ctaColor = section.ctaColor || '#1D1D1F';
  
  const titleFontSize = section.titleFontSize || 24;
  const titleFontWeight = section.titleFontWeight || '600';
  const descFontSize = section.descFontSize || 15;
  const ctaFontSize = section.ctaFontSize || 14;
  
  const imageWidth = section.imageWidth || 180;
  const imageHeight = section.imageHeight || 160;
  const imageRadius = section.imageRadius || 12;
  const imageBgColor = section.imageBgColor || '#E8E8E8';
  
  const paddingVertical = section.paddingVertical || 24;
  const paddingHorizontal = section.paddingHorizontal || 24;
  const contentGap = section.contentGap || 16;
  
  // Image HTML
  const imageHtml = showImage && section.image 
    ? `<img src="${section.image}" alt="" width="${imageWidth}" height="${imageHeight}" style="display: block; object-fit: contain; border-radius: ${imageRadius}px; background-color: ${imageBgColor};" />`
    : showImage 
    ? `<div style="width: ${imageWidth}px; height: ${imageHeight}px; background-color: ${imageBgColor}; border-radius: ${imageRadius}px;"></div>`
    : '';
  
  // CTA HTML
  const ctaHtml = showCta && ctaText 
    ? `<a href="${section.ctaUrl || '#'}" style="color: ${ctaColor}; font-size: ${ctaFontSize}px; font-weight: ${section.ctaFontWeight || '500'}; text-decoration: underline; font-family: ${fontStack};">${ctaText}</a>`
    : '';
  
  // Content HTML
  const contentHtml = `<div ${dirAttr} style="font-family: ${fontStack}; text-align: ${textAlign};"><h3 style="margin: 0 0 8px; font-size: ${titleFontSize}px; font-weight: ${titleFontWeight}; color: ${titleColor}; line-height: 1.3;">${title}</h3><p style="margin: 0 0 12px; font-size: ${descFontSize}px; font-weight: ${section.descFontWeight || '400'}; color: ${descColor}; line-height: 1.5;">${description}</p>${ctaHtml}</div>`;
  
  // Image-top layout
  if (isImageTop) {
    return `<tr><td style="background-color: ${backgroundColor}; padding: ${paddingVertical}px ${paddingHorizontal}px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${showImage ? `<tr><td align="center" style="padding-bottom: ${contentGap}px;">${imageHtml}</td></tr>` : ''}<tr><td>${contentHtml}</td></tr></table></td></tr>`;
  }
  
  // Horizontal layout
  const imageCell = showImage ? `<td width="${imageWidth}" valign="middle" style="${isImageLeft ? `padding-right: ${contentGap}px;` : `padding-left: ${contentGap}px;`}">${imageHtml}</td>` : '';
  const contentCell = `<td valign="middle">${contentHtml}</td>`;
  
  return `<tr><td style="background-color: ${backgroundColor}; padding: ${paddingVertical}px ${paddingHorizontal}px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${isImageLeft ? imageCell + contentCell : contentCell + imageCell}</tr></table></td></tr>`;
}

function exportAccentText(section) {
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  const textDirection = section.textDirection || 'rtl';
  const textAlign = section.textAlign || 'right';
  const dirAttr = textDirection === 'rtl' ? 'dir="rtl"' : '';
  
  const backgroundColor = section.backgroundColor || '#FFFFFF';
  const textColor = section.textColor || '#1D1D1F';
  const fontSize = section.fontSize || 16;
  const fontWeight = section.fontWeight || '400';
  const lineHeight = section.lineHeight || 1.7;
  const paddingVertical = section.paddingVertical || 32;
  const paddingHorizontal = section.paddingHorizontal || 24;
  
  const tag = section.tag || '';
  const tagBg = section.tagBg || '#04D1FC';
  const tagColor = section.tagColor || '#FFFFFF';
  const tagPosition = section.tagPosition || 'sidebar-right';
  const tagGap = section.tagGap || 24;
  
  const content = (section.content || '').replace(/\n/g, '<br>');
  const isSidebarTag = tagPosition === 'sidebar-right' || tagPosition === 'sidebar-left';
  
  // Tag HTML
  const tagHtml = tag ? `<td width="auto" valign="middle" style="padding: 12px 20px; background-color: ${tagBg}; color: ${tagColor}; font-size: 16px; font-weight: 600; font-family: ${fontStack}; text-align: center; border-radius: 4px; white-space: nowrap;">${tag}</td>` : '';
  
  // Content HTML
  const contentHtml = `<td ${dirAttr} valign="top" style="font-family: ${fontStack}; font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${textColor}; line-height: ${lineHeight}; text-align: ${textAlign};">${content}</td>`;
  
  if (isSidebarTag && tag) {
    // Sidebar layout: tag on side, content fills rest
    const gapCell = `<td width="${tagGap}"></td>`;
    const cells = tagPosition === 'sidebar-right' 
      ? `${contentHtml}${gapCell}${tagHtml}`
      : `${tagHtml}${gapCell}${contentHtml}`;
    
    return `<tr><td style="background-color: ${backgroundColor}; padding: ${paddingVertical}px ${paddingHorizontal}px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${cells}</tr></table></td></tr>`;
  }
  
  // Top tag layout or no tag
  let topTagHtml = '';
  if (tag && !isSidebarTag) {
    let tagAlign = 'right';
    if (tagPosition === 'top-left') tagAlign = 'left';
    if (tagPosition === 'top-center') tagAlign = 'center';
    topTagHtml = `<tr><td align="${tagAlign}" style="padding-bottom: 16px;"><span style="display: inline-block; padding: 8px 20px; background-color: ${tagBg}; color: ${tagColor}; font-size: 16px; font-weight: 600; font-family: ${fontStack}; border-radius: 4px;">${tag}</span></td></tr>`;
  }
  
  return `<tr><td style="background-color: ${backgroundColor}; padding: ${paddingVertical}px ${paddingHorizontal}px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${topTagHtml}<tr><td ${dirAttr} style="font-family: ${fontStack}; font-size: ${fontSize}px; font-weight: ${fontWeight}; color: ${textColor}; line-height: ${lineHeight}; text-align: ${textAlign};">${content}</td></tr></table></td></tr>`;
}

function exportMarquee(section) {
  const items = (section.items || '').split(',').map(s => s.trim()).filter(Boolean);
  const separator = section.separator || '•';
  const fontSize = section.fontSize || 14;
  const fontWeight = section.fontWeight || '500';
  const paddingVertical = section.paddingVertical || 10;
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  
  const itemsHtml = items.map((item, i) => {
    const sep = i < items.length - 1 ? `<span style="opacity: 0.5; margin: 0 12px;">${separator}</span>` : '';
    return `<span>${item}</span>${sep}`;
  }).join('');

  return `<tr><td style="background-color: ${section.backgroundColor || '#04D1FC'}; padding: ${paddingVertical}px 20px; text-align: center; color: ${section.textColor || '#ffffff'}; font-family: ${fontStack}; font-size: ${fontSize}px; font-weight: ${fontWeight}; letter-spacing: ${section.letterSpacing || '0.02em'};">${itemsHtml}</td></tr>`;
}

function exportText(section) {
  const dirAttr = section.direction === 'rtl' ? 'dir="rtl"' : '';
  const content = (section.content || '').replace(/\n/g, '<br>');
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = getFontStack(fontFamily);
  const padding = section.padding || 20;
  
  return `<tr><td ${dirAttr} style="background-color: ${section.backgroundColor || '#ffffff'}; padding: ${padding}px 20px; font-family: ${fontStack}; font-size: ${section.fontSize || 16}px; color: ${section.color || '#333333'}; text-align: ${section.textAlign || 'right'}; line-height: 1.6;">${content}</td></tr>`;
}

function exportSectionHeader(section) {
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = FONT_STACKS[fontFamily] || FONT_STACKS['Noto Sans Hebrew'];
  const padding = section.padding || 12;
  
  return `<tr><td style="background-color: ${section.backgroundColor || '#00D4D4'}; color: ${section.color || '#ffffff'}; padding: ${padding}px 20px; text-align: center; font-family: ${fontStack}; font-size: ${section.fontSize || 18}px; font-weight: ${section.fontWeight || 700}; letter-spacing: ${section.letterSpacing || '0.1em'}; text-transform: uppercase;">${section.text || ''}</td></tr>`;
}

function exportImageCollage(section) {
  const images = section.images || [];
  if (images.length === 0) return '';

  const gap = section.gap || 8;
  const imageHeight = section.imageHeight || 180;
  const imageBackgrounds = section.imageBackgrounds || [];
  const sectionPadding = section.padding ?? 16;
  
  const isSingleLayout = section.layout === 'single' || section.layout === 'single-wide';
  
  let columnsCount = 4;
  if (isSingleLayout) columnsCount = 1;
  else if (section.layout === '2-column') columnsCount = 2;
  else if (section.layout === '3-column') columnsCount = 3;
  else if (section.layout === '4-column') columnsCount = 4;

  const containerWidth = 600 - (sectionPadding * 2);
  const totalGapWidth = gap * (columnsCount - 1);
  const imageWidth = isSingleLayout ? 600 : Math.floor((containerWidth - totalGapWidth) / columnsCount);

  let imageCells = '';
  const validImages = images.filter(img => img);
    
  for (let i = 0; i < validImages.length; i++) {
    const img = validImages[i];
    const isLastInRow = (i + 1) % columnsCount === 0;
    const isLastImage = i === validImages.length - 1;
    const bgColor = imageBackgrounds[i] || '';
    const borderRadius = isSingleLayout ? '0' : '4px';
    
    let cellContent = '';
    if (bgColor) {
      cellContent = `<table role="presentation" width="${imageWidth}" height="${imageHeight}" cellspacing="0" cellpadding="0" border="0" style="border-radius: ${borderRadius};"><tr><td style="background-color: ${bgColor}; text-align: center; vertical-align: middle;"><img src="${img}" alt="" width="${imageWidth}" height="${imageHeight}" style="display: block; border-radius: ${borderRadius};" /></td></tr></table>`;
    } else {
      cellContent = `<img src="${img}" alt="" width="${imageWidth}" height="${imageHeight}" style="display: block; border-radius: ${borderRadius}; object-fit: cover;" />`;
    }
    
    const rightPadding = isSingleLayout ? 0 : ((isLastInRow || isLastImage) ? 0 : gap);
    const bottomPadding = isSingleLayout ? 0 : gap;
    
    imageCells += `<td width="${imageWidth}" style="padding: 0 ${rightPadding}px ${bottomPadding}px 0; vertical-align: top;">${cellContent}</td>`;
    
    if (isLastInRow && !isLastImage) {
      imageCells += `</tr><tr>`;
    }
  }

  if (!imageCells) return '';

  const outerPadding = isSingleLayout && sectionPadding === 0 ? 0 : sectionPadding;

  return `<tr><td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: ${outerPadding}px;"><table role="presentation" width="${isSingleLayout ? 600 : '100%'}" cellspacing="0" cellpadding="0" border="0"><tr>${imageCells}</tr></table></td></tr>`;
}

function exportProfileCards(section) {
  const profiles = section.profiles || [];
  if (profiles.length === 0) return '';

  const columns = section.columns || 4;
  const borderRadius = section.imageShape === 'circular' ? '50%' : '8px';
  const cellWidth = Math.floor(100 / columns);
  const fontStack = FONT_STACKS['Noto Sans Hebrew'];

  let profileCells = '';
  profiles.forEach((profile) => {
    if (!profile) return;
    profileCells += `<td width="${cellWidth}%" style="text-align: center; vertical-align: top; padding: 8px;">${profile.image ? `<img src="${profile.image}" alt="${profile.name || ''}" width="80" height="80" style="display: block; margin: 0 auto 8px; border-radius: ${borderRadius}; object-fit: cover;" />` : ''}${section.showName !== false && profile.name ? `<div style="font-family: ${fontStack}; font-size: 14px; font-weight: 600; color: #333333; margin: 6px 0 2px;">${profile.name}</div>` : ''}${section.showTitle !== false && profile.title ? `<div style="font-family: ${fontStack}; font-size: 12px; color: #666666;">${profile.title}</div>` : ''}</td>`;
  });

  if (!profileCells) return '';

  return `<tr><td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 20px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>${profileCells}</tr></table></td></tr>`;
}

function exportRecipe(section) {
  const ingredients = (section.ingredients || '').replace(/\n/g, '<br>');
  const instructions = (section.instructions || '').replace(/\n/g, '<br>');
  const fontStack = FONT_STACKS['Noto Sans Hebrew'];
  
  const imageRow = section.image ? `<tr><td style="padding-bottom: 16px;"><img src="${section.image}" alt="${section.title || ''}" style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 8px;" /></td></tr>` : '';
  
  return `<tr><td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 24px 20px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="text-align: center;"><h2 dir="rtl" style="font-family: ${fontStack}; font-size: 22px; font-weight: 600; color: #333333; margin: 0 0 16px;">${section.title || ''}</h2></td></tr>${imageRow}<tr><td dir="rtl" style="font-family: ${fontStack}; font-size: 14px; color: #333333; line-height: 1.7; text-align: right; padding-bottom: 12px;">${ingredients}</td></tr><tr><td dir="rtl" style="font-family: ${fontStack}; font-size: 14px; color: #333333; line-height: 1.7; text-align: right;">${instructions}</td></tr></table></td></tr>`;
}

function exportFooter(section) {
  const bgStyle = section.gradientEnd 
    ? `background: linear-gradient(180deg, ${section.backgroundColor} 0%, ${section.gradientEnd} 100%); background-color: ${section.backgroundColor};`
    : `background-color: ${section.backgroundColor || '#333333'};`;
  const text = (section.text || '').replace(/\n/g, '<br>');
  const fontStack = FONT_STACKS['Noto Sans Hebrew'];
  const padding = section.padding || 24;

  return `<tr><td style="${bgStyle} padding: ${padding}px 20px; text-align: center; color: ${section.color || '#ffffff'}; font-family: ${fontStack}; font-size: ${section.fontSize || 14}px; line-height: 1.6;">${text}</td></tr>`;
}
