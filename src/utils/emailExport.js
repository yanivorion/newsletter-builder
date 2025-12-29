// Email-compatible HTML export
// Uses table-based layout with inline styles for maximum email client compatibility

// Google Fonts URL for email - includes all weights
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';

// Font stacks with proper fallbacks for email clients
// Note: Gmail doesn't support web fonts, so fallbacks are important
const FONT_STACKS = {
  'Poppins': "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  'Noto Sans Hebrew': "'Noto Sans Hebrew', 'Arial Hebrew', 'Segoe UI', Arial, sans-serif",
  'Inter': "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  'default': "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
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
      case 'accentText':
        return exportAccentText(section);
      case 'promoCard':
        return exportPromoCard(section);
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
      case 'accentText':
        return exportAccentText(section);
      case 'promoCard':
        return exportPromoCard(section);
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

  // For Gmail paste, include Google Fonts in a style block at the top
  // Gmail may strip this, but it works in many cases
  return `<style>
@import url('${GOOGLE_FONTS_URL}');
</style>
<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto; font-family: ${FONT_STACKS['default']};">
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

function exportAccentText(section) {
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = getFontStack(fontFamily);
  const direction = section.direction || 'rtl';
  const textAlign = section.contentAlign || 'right';
  const padding = section.padding || 40;
  const paddingTop = section.paddingTop ?? padding;
  const paddingBottom = section.paddingBottom ?? padding;
  const paddingLeft = section.paddingLeft ?? padding;
  const paddingRight = section.paddingRight ?? padding;
  
  const content = (section.content || '').replace(/\n\n/g, '</p><p style="margin: 0 0 1em;">').replace(/\n/g, '<br>');
  
  // Tag badge
  const tagHtml = section.tagText ? `
    <div style="display: inline-block; background-color: ${section.tagBackgroundColor || '#04D1FC'}; color: ${section.tagTextColor || '#FFFFFF'}; padding: 8px 20px; border-radius: ${section.tagBorderRadius || 8}px; font-size: ${section.tagFontSize || 14}px; font-weight: 600; font-family: ${fontStack}; margin-bottom: 24px;">
      ${section.tagText}
    </div>` : '';
  
  return `
    <tr>
      <td dir="${direction}" style="background-color: ${section.backgroundColor || '#FFFFFF'}; padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px; font-family: ${fontStack};">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="${section.tagPosition === 'top-left' ? 'left' : 'right'}">
              ${tagHtml}
            </td>
          </tr>
          <tr>
            <td style="font-size: ${section.contentFontSize || 18}px; line-height: ${section.contentLineHeight || 1.8}; color: ${section.contentColor || '#333333'}; text-align: ${textAlign};">
              <p style="margin: 0;">${content}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function exportPromoCard(section) {
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = getFontStack(fontFamily);
  const direction = section.direction || 'rtl';
  const textAlign = section.contentAlign || 'right';
  const padding = section.padding || 32;
  const paddingTop = section.paddingTop ?? padding;
  const paddingBottom = section.paddingBottom ?? padding;
  const paddingLeft = section.paddingLeft ?? padding;
  const paddingRight = section.paddingRight ?? padding;
  
  const body = (section.body || '').replace(/\n\n/g, '</p><p style="margin: 0.8em 0 0;">').replace(/\n/g, '<br>');
  
  // Determine layout based on direction and image position
  const imagePosition = section.imagePosition || 'right';
  const isImageFirst = (direction === 'rtl' && imagePosition === 'right') || (direction === 'ltr' && imagePosition === 'left');
  
  const imageHtml = section.image ? `
    <td width="${section.imageWidth || 200}" style="vertical-align: ${section.verticalAlign || 'center'};">
      <img src="${section.image}" alt="Promo" style="width: ${section.imageWidth || 200}px; height: ${section.imageHeight || 160}px; display: block; object-fit: cover; border-radius: ${section.imageBorderRadius || 12}px;" />
    </td>` : '';
  
  const contentHtml = `
    <td style="vertical-align: ${section.verticalAlign || 'center'}; text-align: ${textAlign}; padding: ${isImageFirst ? '0 0 0 ' + (section.gap || 24) + 'px' : '0 ' + (section.gap || 24) + 'px 0 0'};">
      <h3 style="margin: 0 0 16px; font-family: ${fontStack}; font-size: ${section.titleFontSize || 28}px; font-weight: ${section.titleFontWeight || 700}; color: ${section.titleColor || '#1A1A1A'}; line-height: 1.3;">
        ${section.title || 'Card Title'}
      </h3>
      <div style="font-family: ${fontStack}; font-size: ${section.bodyFontSize || 16}px; line-height: ${section.bodyLineHeight || 1.7}; color: ${section.bodyColor || '#555555'}; margin-bottom: ${section.showCta !== false ? '20px' : '0'};">
        <p style="margin: 0;">${body}</p>
      </div>
      ${section.showCta !== false && section.ctaText ? `
        <a href="${section.ctaLink || '#'}" style="color: ${section.ctaColor || '#04D1FC'}; font-family: ${fontStack}; font-size: ${section.ctaFontSize || 16}px; font-weight: ${section.ctaFontWeight || 500}; text-decoration: none;">
          ${section.ctaText}
        </a>` : ''}
    </td>`;
  
  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#F8F9FA'}; padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px; border-radius: ${section.borderRadius || 16}px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" dir="${direction}">
          <tr>
            ${isImageFirst ? imageHtml + contentHtml : contentHtml + imageHtml}
          </tr>
        </table>
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
  
  let columnsCount = 4;
  if (section.layout === '2-column') columnsCount = 2;
  else if (section.layout === '3-column') columnsCount = 3;
  else if (section.layout === '4-column') columnsCount = 4;

  const imageWidth = Math.floor((600 - 40 - (gap * (columnsCount - 1))) / columnsCount);

  let imageCells = '';
  for (let i = 0; i < images.length; i++) {
    if (!images[i]) continue;
    
    const isLastInRow = (i + 1) % columnsCount === 0;
    const focalPoint = focalPoints[i] || { x: 50, y: 50 };
    const bgColor = imageBackgrounds[i] || '';
    const overlay = imageOverlays[i] || { color: '', opacity: 0 };
    
    let cellContent = '';
    
    if (bgColor) {
      cellContent = `
        <div style="width: ${imageWidth}px; height: ${imageHeight}px; background-color: ${bgColor}; border-radius: 4px; position: relative; overflow: hidden;">
          <img src="${images[i]}" alt="Image ${i + 1}" style="width: 100%; height: 100%; display: block; object-fit: contain; object-position: ${focalPoint.x}% ${focalPoint.y}%;" />
          ${overlay.color && overlay.opacity > 0 ? `<div style="position: absolute; inset: 0; background-color: ${overlay.color}; opacity: ${overlay.opacity / 100};"></div>` : ''}
        </div>`;
    } else if (overlay.color && overlay.opacity > 0) {
      cellContent = `
        <div style="width: ${imageWidth}px; height: ${imageHeight}px; position: relative; overflow: hidden; border-radius: 4px;">
          <img src="${images[i]}" alt="Image ${i + 1}" style="width: 100%; height: 100%; display: block; object-fit: cover; object-position: ${focalPoint.x}% ${focalPoint.y}%;" />
          <div style="position: absolute; inset: 0; background-color: ${overlay.color}; opacity: ${overlay.opacity / 100};"></div>
        </div>`;
    } else {
      cellContent = `<img src="${images[i]}" alt="Image ${i + 1}" style="width: ${imageWidth}px; height: ${imageHeight}px; display: block; object-fit: cover; object-position: ${focalPoint.x}% ${focalPoint.y}%; border-radius: 4px;" />`;
    }
    
    imageCells += `
      <td style="padding: 0 ${isLastInRow ? 0 : gap}px ${gap}px 0; vertical-align: top;">
        ${cellContent}
      </td>`;
    
    if (isLastInRow && i < images.length - 1) {
      imageCells += `
    </tr>
    <tr>`;
    }
  }

  if (!imageCells) return '';

  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
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
  const fontStack = getFontStack(section.fontFamily || 'Poppins');
  const textAlign = section.textAlign || 'center';
  const bgColor = section.backgroundColor || '#FFFFFF';
  const padding = section.padding || 40;
  const paddingTop = section.paddingTop ?? padding;
  const paddingBottom = section.paddingBottom ?? padding;
  const paddingLeft = section.paddingLeft ?? padding;
  const paddingRight = section.paddingRight ?? padding;
  
  let content = '';
  
  // Logo
  if (section.logo) {
    const logoWidth = section.logoWidth || 120;
    const logoHeight = section.logoHeight || 40;
    content += `
      <tr>
        <td align="${textAlign}" style="padding-bottom: 20px;">
          <img src="${section.logo}" alt="Logo" style="width: ${logoWidth}px; height: ${logoHeight}px; display: inline-block; object-fit: contain;" />
        </td>
      </tr>`;
  }
  
  // Social icons
  if (section.showSocial !== false && section.socialLinks) {
    const socialLinks = section.socialLinks;
    const iconSize = section.socialIconSize || 24;
    const iconColor = section.socialIconColor || '#4B5563';
    
    // Social icon SVG paths
    const socialIcons = {
      facebook: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>`,
      x: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
      linkedin: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
      instagram: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
      rss: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/></svg>`,
      youtube: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
      tiktok: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${iconColor}"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
    };
    
    let iconsHtml = '';
    Object.entries(socialLinks).forEach(([platform, url]) => {
      if (url && socialIcons[platform]) {
        iconsHtml += `<a href="${url}" target="_blank" style="text-decoration: none; margin: 0 ${section.socialGap || 8}px;">${socialIcons[platform]}</a>`;
      }
    });
    
    if (iconsHtml) {
      content += `
        <tr>
          <td align="${textAlign}" style="padding-bottom: 20px;">
            ${iconsHtml}
          </td>
        </tr>`;
    }
  }
  
  // Divider
  if (section.showDivider !== false && (section.logo || (section.showSocial !== false && section.socialLinks))) {
    content += `
      <tr>
        <td style="padding: 0 0 20px;">
          <hr style="border: none; border-top: ${section.dividerWidth || 1}px solid ${section.dividerColor || '#E5E7EB'}; margin: 0;" />
        </td>
      </tr>`;
  }
  
  // Company info
  if (section.showCompanyInfo !== false && section.companyInfo) {
    content += `
      <tr>
        <td align="${textAlign}" style="padding-bottom: 12px; color: ${section.companyInfoColor || '#374151'}; font-family: ${fontStack}; font-size: ${section.companyInfoFontSize || 14}px; line-height: 1.6;">
          ${section.companyInfo}
        </td>
      </tr>`;
  }
  
  // Footer links
  if (section.showFooterLinks !== false && section.footerLinks && section.footerLinks.length > 0) {
    const separator = section.linkSeparator || '|';
    const linksHtml = section.footerLinks.map((link, i) => {
      const sep = i < section.footerLinks.length - 1 ? `<span style="margin: 0 8px; opacity: 0.5;">${separator}</span>` : '';
      return `<a href="${link.url || '#'}" style="color: ${section.linkColor || '#374151'}; font-size: ${section.linkFontSize || 14}px; text-decoration: underline;">${link.text}</a>${sep}`;
    }).join('');
    
    content += `
      <tr>
        <td align="${textAlign}" style="padding-bottom: 0; font-family: ${fontStack};">
          ${linksHtml}
        </td>
      </tr>`;
  }
  
  // Fallback for old footer format
  if (!content && section.text) {
    const text = (section.text || '').replace(/\n/g, '<br>');
    content = `
      <tr>
        <td align="${textAlign}" style="color: ${section.color || '#ffffff'}; font-family: ${fontStack}; font-size: ${section.fontSize || 14}px; line-height: 1.8;">
          ${text}
        </td>
      </tr>`;
  }

  return `
    <tr>
      <td style="background-color: ${bgColor}; padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${content}
        </table>
      </td>
    </tr>`;
}
