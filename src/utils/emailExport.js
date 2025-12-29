// Email-compatible HTML export - Minified for smaller size

// Google Fonts URL (shorter - only essential weights)
const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap';

// Minify HTML - removes whitespace, newlines, and compresses output
function minifyHTML(html) {
  return html
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/>\s+</g, '><')        // Remove space between tags
    .replace(/\s*;\s*/g, ';')       // Remove space around semicolons
    .replace(/\s*:\s*/g, ':')       // Remove space around colons in styles
    .replace(/\s*,\s*/g, ',')       // Remove space around commas
    .replace(/;\s*"/g, '"')         // Remove trailing semicolon before quote
    .replace(/"\s+style/g, '" style') // Keep space before style attr
    .replace(/"\s+width/g, '" width') // Keep space before width attr
    .replace(/"\s+height/g, '" height')
    .replace(/"\s+align/g, '" align')
    .replace(/"\s+valign/g, '" valign')
    .replace(/"\s+cellspacing/g, '" cellspacing')
    .replace(/"\s+cellpadding/g, '" cellpadding')
    .replace(/"\s+border/g, '" border')
    .replace(/"\s+role/g, '" role')
    .replace(/"\s+alt/g, '" alt')
    .replace(/"\s+src/g, '" src')
    .replace(/"\s+href/g, '" href')
    .replace(/"\s+dir/g, '" dir')
    .replace(/"\s+colspan/g, '" colspan')
    .replace(/"\s+rowspan/g, '" rowspan')
    .trim();
}

// Shorter font stacks for smaller output
const FONT_STACKS = {
  'Poppins': "Poppins,Arial,sans-serif",
  'Noto Sans Hebrew': "'Noto Sans Hebrew',Arial,sans-serif",
  'Inter': "Inter,Arial,sans-serif",
  'default': "Arial,sans-serif"
};

function getFontStack(fontFamily) {
  return FONT_STACKS[fontFamily] || FONT_STACKS['default'];
}

// Wrap content in container frame - compact output
function wrapWithContainer(content, container) {
  if (!container) return content;
  
  const pt = container.outerPaddingTop ?? container.outerPadding ?? 0;
  const pb = container.outerPaddingBottom ?? container.outerPadding ?? 0;
  const pl = container.outerPaddingLeft ?? container.outerPadding ?? 0;
  const pr = container.outerPaddingRight ?? container.outerPadding ?? 0;
  const bg = container.outerBackgroundColor || 'transparent';
  const bw = container.innerBorderWidth || 0;
  const bc = container.innerBorderColor || '#E5E5E5';
  const br = container.innerBorderRadius || 0;
  const ibg = container.innerBackgroundColor || 'transparent';
  const img = container.backgroundImage;
  
  // Skip if no styling needed
  if (pt === 0 && pb === 0 && pl === 0 && pr === 0 && bg === 'transparent' && bw === 0 && br === 0 && ibg === 'transparent' && !img) {
    return content;
  }
  
  let s = `background-color:${ibg};`;
  if (bw > 0) s += `border:${bw}px solid ${bc};`;
  if (br > 0) s += `border-radius:${br}px;`;
  if (img) s += `background-image:url(${img});background-size:100% auto;background-position:center;background-repeat:no-repeat;`;
  
  return `<tr><td style="background-color:${bg};padding:${pt}px ${pr}px ${pb}px ${pl}px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${s}">${content}</table></td></tr>`;
}

export function exportToHTML(newsletter) {
  if (!newsletter || !newsletter.sections) {
    return '';
  }

  // Page settings with defaults
  const pageSettings = newsletter.pageSettings || {};
  const outerBg = pageSettings.outerBackgroundColor || '#F5F5F5';
  const outerPadding = pageSettings.outerPadding ?? 20;
  const innerBg = pageSettings.innerBackgroundColor || '#FFFFFF';
  const innerBorderWidth = pageSettings.innerBorderWidth ?? 0;
  const innerBorderColor = pageSettings.innerBorderColor || '#E5E5E5';
  const innerBorderRadius = pageSettings.innerBorderRadius ?? 0;

  const sections = newsletter.sections.map(section => {
    let content;
    switch (section.type) {
      case 'header':
        content = exportHeader(section);
        break;
      case 'marquee':
        content = exportMarquee(section);
        break;
      case 'text':
        content = exportText(section);
        break;
      case 'sectionHeader':
        content = exportSectionHeader(section);
        break;
      case 'accentText':
        content = exportAccentText(section);
        break;
      case 'promoCard':
        content = exportPromoCard(section);
        break;
      case 'imageCollage':
        content = exportImageCollage(section);
        break;
      case 'profileCards':
        content = exportProfileCards(section);
        break;
      case 'recipe':
        content = exportRecipe(section);
        break;
      case 'footer':
        content = exportFooter(section);
        break;
      default:
        content = '';
    }
    return section.container ? wrapWithContainer(content, section.container) : content;
  }).join('\n');

  // Build inner container style
  const innerContainerStyle = `background-color: ${innerBg};${innerBorderWidth > 0 ? ` border: ${innerBorderWidth}px solid ${innerBorderColor};` : ''}${innerBorderRadius > 0 ? ` border-radius: ${innerBorderRadius}px;` : ''} overflow: hidden;`;

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
        <o:AllowPNG/>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet">
  
  <style type="text/css">
    @import url('${GOOGLE_FONTS_URL}');
    
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    .email-container { width: 100% !important; max-width: 600px !important; }
    
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; }
    }
  </style>
  
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${outerBg}; font-family: ${FONT_STACKS['default']}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: ${outerBg};">
    <tr>
      <td align="center" style="padding: ${outerPadding}px 10px;">
        <!--[if mso]>
        <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; ${innerContainerStyle} margin: 0 auto;">
          ${sections}
        </table>
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Export for Gmail paste - cleaner version without full HTML structure
export function exportForGmail(newsletter) {
  if (!newsletter || !newsletter.sections) {
    return '';
  }

  // Page settings with defaults
  const pageSettings = newsletter.pageSettings || {};
  const outerBg = pageSettings.outerBackgroundColor || '#F5F5F5';
  const outerPadding = pageSettings.outerPadding ?? 20;
  const innerBg = pageSettings.innerBackgroundColor || '#FFFFFF';
  const innerBorderWidth = pageSettings.innerBorderWidth ?? 0;
  const innerBorderColor = pageSettings.innerBorderColor || '#E5E5E5';
  const innerBorderRadius = pageSettings.innerBorderRadius ?? 0;

  const sections = newsletter.sections.map(section => {
    let content;
    switch (section.type) {
      case 'header':
        content = exportHeader(section, true); // true = isGmail
        break;
      case 'marquee':
        content = exportMarquee(section);
        break;
      case 'text':
        content = exportText(section);
        break;
      case 'sectionHeader':
        content = exportSectionHeader(section);
        break;
      case 'accentText':
        content = exportAccentText(section);
        break;
      case 'promoCard':
        content = exportPromoCard(section, true); // true = isGmail
        break;
      case 'imageCollage':
        content = exportImageCollage(section, true); // true = isGmail
        break;
      case 'profileCards':
        content = exportProfileCards(section);
        break;
      case 'recipe':
        content = exportRecipe(section, true); // true = isGmail
        break;
      case 'footer':
        content = exportFooter(section);
        break;
      default:
        content = '';
    }
    return section.container ? wrapWithContainer(content, section.container) : content;
  }).join('\n');

  // Build inner container style
  const innerContainerStyle = `background-color: ${innerBg};${innerBorderWidth > 0 ? ` border: ${innerBorderWidth}px solid ${innerBorderColor};` : ''}${innerBorderRadius > 0 ? ` border-radius: ${innerBorderRadius}px;` : ''} overflow: hidden;`;

  // For Gmail - Minified output
  const html = `<table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" style="background-color:${outerBg};width:80%;max-width:600px;margin:0 auto;font-family:${FONT_STACKS['default']};table-layout:fixed"><tr><td style="padding:${outerPadding}px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${innerContainerStyle}width:100%;table-layout:fixed">${sections}</table></td></tr></table>`;
  
  return minifyHTML(html);
}

function exportHeader(section, isGmail = false) {
  const bgStyle = section.gradientEnd 
    ? `background: linear-gradient(180deg, ${section.backgroundColor || '#4A90D9'} 0%, ${section.gradientEnd} 100%); background-color: ${section.backgroundColor || '#4A90D9'};`
    : `background-color: ${section.backgroundColor || '#4A90D9'};`;

  const logoWidth = section.logoWidth || 120;
  const logoHeight = section.logoHeight === 'auto' ? 'auto' : `${section.logoHeight}px`;
  const logoAlignment = section.logoAlignment || 'center';
  
  const titleFontSize = section.titleFontSize || 28;
  const titleFontWeight = section.titleFontWeight || '700';
  const titleFontStyle = section.titleFontStyle || 'normal';
  const titleLetterSpacing = section.titleLetterSpacing || '-0.02em';
  const titleLineHeight = section.titleLineHeight || 1.2;
  
  const subtitleFontSize = section.subtitleFontSize || 16;
  const subtitleFontWeight = section.subtitleFontWeight || '400';
  const textColor = section.textColor || '#ffffff';
  const fontStack = FONT_STACKS['Poppins'];

  // Date badge
  const badgeHtml = section.showDateBadge && section.dateBadgeText ? `
    <tr>
      <td align="right" style="padding: 0 20px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;">
          <tr>
            <td style="background-color: ${section.dateBadgeBg || '#04D1FC'}; color: ${section.dateBadgeColor || '#ffffff'}; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; font-family: ${fontStack}; letter-spacing: 0.05em;">
              ${section.dateBadgeText}
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';

  // Hero image - use 100% width for Gmail auto-fit
  const heroImageHeight = section.heroImageHeight || 200;
  const heroImageHtml = section.heroImage ? `
    <tr>
      <td align="center" style="padding: 0 20px 24px;">
        <img src="${section.heroImage}" alt="Hero" style="width: 100%; max-width: 560px; height: auto; display: block; border-radius: 8px;" />
      </td>
    </tr>` : '';

  // Logo - use percentage-based max-width for Gmail
  const logoStyle = isGmail 
    ? `max-width: ${logoWidth}px; height: auto; display: block; object-fit: contain;`
    : `width: ${logoWidth}px; height: ${logoHeight}; display: block; object-fit: contain;`;

  return `
    <tr>
      <td style="${bgStyle}">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed">
          ${section.logo ? `
          <tr>
            <td align="${logoAlignment}" style="padding: 40px 20px 20px;">
              <img src="${section.logo}" alt="Logo" style="${logoStyle}" />
            </td>
          </tr>` : ''}
          ${heroImageHtml}
          <tr>
            <td align="center" style="padding: 0 20px ${section.showDateBadge ? '20px' : '40px'};">
              <h1 style="margin: 0 0 10px; font-size: ${titleFontSize}px; font-weight: ${titleFontWeight}; font-style: ${titleFontStyle}; letter-spacing: ${titleLetterSpacing}; font-family: ${fontStack}; line-height: ${titleLineHeight}; color: ${textColor};">
                ${section.title || ''}
              </h1>
              ${section.subtitle ? `<p style="margin: 0; font-size: ${subtitleFontSize}px; font-weight: ${subtitleFontWeight}; opacity: 0.95; font-family: ${fontStack}; line-height: 1.4; color: ${textColor};">${section.subtitle}</p>` : ''}
            </td>
          </tr>
          ${badgeHtml}
        </table>
      </td>
    </tr>`;
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
      ? `<span style="opacity: 0.5; margin: 0 12px;">${separator}</span>` 
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
  const bgColor = section.backgroundColor || '#04D1FC';
  const gradientEnd = section.gradientEnd;
  const gradientDirection = section.gradientDirection || '90deg';
  
  const bgStyle = gradientEnd 
    ? `background: linear-gradient(${gradientDirection}, ${bgColor} 0%, ${gradientEnd} 100%); background-color: ${bgColor};`
    : `background-color: ${bgColor};`;
  
  const paddingTop = section.paddingTop ?? section.padding ?? 14;
  const paddingBottom = section.paddingBottom ?? section.padding ?? 14;
  const paddingLeft = section.paddingLeft ?? 24;
  const paddingRight = section.paddingRight ?? 24;
  const borderRadius = section.borderRadius || 0;
  
  // Use table for border-radius support
  return `
    <tr>
      <td style="padding: 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed">
          <tr>
            <td style="${bgStyle} color: ${section.color || '#ffffff'}; padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px; text-align: center; font-family: ${fontStack}; font-size: ${section.fontSize || 14}px; font-weight: ${section.fontWeight || 600}; letter-spacing: ${section.letterSpacing || '0.08em'}; text-transform: uppercase; border-radius: ${borderRadius}px;">
              ${section.text || ''}
            </td>
          </tr>
        </table>
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
  const tagToContentGap = section.tagToContentGap ?? 40;
  
  const content = (section.content || '').replace(/\n\n/g, '</p><p style="margin: 0 0 1em;">').replace(/\n/g, '<br>');
  
  // Tag badge - use nested table for proper centering
  const tagAlign = section.tagPosition === 'top-left' ? 'left' : 'right';
  const tagHtml = section.tagText ? `
    <tr>
      <td align="${tagAlign}" style="padding-bottom: ${tagToContentGap}px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;">
          <tr>
            <td align="center" valign="middle" style="background-color: ${section.tagBackgroundColor || '#04D1FC'}; color: ${section.tagTextColor || '#FFFFFF'}; padding: 10px 24px; border-radius: ${section.tagBorderRadius || 8}px; font-size: ${section.tagFontSize || 14}px; font-weight: 600; font-family: ${fontStack}; line-height: 1.2; mso-padding-alt: 12px 24px;">
              ${section.tagText}
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';
  
  return `
    <tr>
      <td dir="${direction}" style="background-color: ${section.backgroundColor || '#FFFFFF'}; padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-family: ${fontStack};">
          ${tagHtml}
          <tr>
            <td style="font-size: ${section.contentFontSize || 18}px; line-height: ${section.contentLineHeight || 1.8}; color: ${section.contentColor || '#333333'}; text-align: ${textAlign}; font-family: ${fontStack};">
              <p style="margin: 0;">${content}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function exportPromoCard(section, isGmail = false) {
  const fontFamily = section.fontFamily || 'Noto Sans Hebrew';
  const fontStack = getFontStack(fontFamily);
  const direction = section.direction || 'rtl';
  const textAlign = section.contentAlign || 'right';
  const padding = section.padding || 32;
  const paddingTop = section.paddingTop ?? padding;
  const paddingBottom = section.paddingBottom ?? padding;
  const paddingLeft = section.paddingLeft ?? padding;
  const paddingRight = section.paddingRight ?? padding;
  const titleToBodyGap = section.titleToBodyGap ?? 16;
  const bodyToCtaGap = section.bodyToCtaGap ?? 20;
  const gap = section.gap || 24;
  
  const body = (section.body || '').replace(/\n\n/g, '</p><p style="margin: 0.8em 0 0;">').replace(/\n/g, '<br>');
  
  // Image dimensions - fixed size with object-fit cover
  const imageWidth = section.imageWidth || 200;
  const imageHeight = section.imageHeight || 160;
  const imageBorderRadius = section.imageBorderRadius || 12;
  
  // Determine layout based on direction and image position
  const imagePosition = section.imagePosition || 'right';
  const isImageFirst = (direction === 'rtl' && imagePosition === 'right') || (direction === 'ltr' && imagePosition === 'left');
  
  // Fixed size container with image using object-fit: cover
  const imageCell = section.image ? `
    <td width="${imageWidth}" valign="${section.verticalAlign || 'middle'}" style="vertical-align: ${section.verticalAlign || 'middle'}; width: ${imageWidth}px;">
      <div style="width: ${imageWidth}px; height: ${imageHeight}px; border-radius: ${imageBorderRadius}px; overflow: hidden;">
        <img src="${section.image}" alt="Promo" style="width: ${imageWidth}px; height: ${imageHeight}px; display: block; object-fit: cover;" />
      </div>
    </td>` : '';
  
  const gapCell = section.image ? `<td width="${gap}" style="width: ${gap}px;"></td>` : '';
  
  const contentCell = `
    <td valign="${section.verticalAlign || 'middle'}" style="vertical-align: ${section.verticalAlign || 'middle'}; text-align: ${textAlign};">
      <h3 style="margin: 0 0 ${titleToBodyGap}px; font-family: ${fontStack}; font-size: ${section.titleFontSize || 28}px; font-weight: ${section.titleFontWeight || 700}; color: ${section.titleColor || '#1A1A1A'}; line-height: 1.3;">
        ${section.title || 'Card Title'}
      </h3>
      <div style="font-family: ${fontStack}; font-size: ${section.bodyFontSize || 16}px; line-height: ${section.bodyLineHeight || 1.7}; color: ${section.bodyColor || '#555555'}; margin-bottom: ${section.showCta !== false ? bodyToCtaGap + 'px' : '0'};">
        <p style="margin: 0;">${body}</p>
      </div>
      ${section.showCta !== false && section.ctaText ? `
        <a href="${section.ctaLink || '#'}" style="color: ${section.ctaColor || '#04D1FC'}; font-family: ${fontStack}; font-size: ${section.ctaFontSize || 16}px; font-weight: ${section.ctaFontWeight || 500}; text-decoration: none;">
          ${section.ctaText}
        </a>` : ''}
    </td>`;
  
  const rowContent = isImageFirst 
    ? imageCell + gapCell + contentCell 
    : contentCell + gapCell + imageCell;
  
  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#F8F9FA'}; padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px; border-radius: ${section.borderRadius || 16}px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" dir="${direction}" style="table-layout:fixed;">
          <tr>
            ${rowContent}
          </tr>
        </table>
      </td>
    </tr>`;
}

// Collage layout presets
const COLLAGE_PRESETS = {
  'single': [[1]],
  'single-wide': [[1, 1]],
  '2-horizontal': [[1, 2]],
  '2-vertical': [[1], [2]],
  '2-left-large': [[1, 1, 2], [1, 1, 2]],
  '2-right-large': [[1, 2, 2], [1, 2, 2]],
  '2-top-large': [[1, 1], [1, 1], [2, 2]],
  '2-bottom-large': [[1, 1], [2, 2], [2, 2]],
  '3-horizontal': [[1, 2, 3]],
  '3-vertical': [[1], [2], [3]],
  '3-left-featured': [[1, 1, 2], [1, 1, 3]],
  '3-right-featured': [[1, 2, 2], [3, 2, 2]],
  '3-top-featured': [[1, 1], [2, 3]],
  '3-bottom-featured': [[1, 2], [3, 3]],
  '3-center-featured': [[1, 2, 2, 3], [1, 2, 2, 3]],
  '3-l-shape': [[1, 1, 2], [3, 3, 3]],
  '3-reverse-l': [[1, 2, 2], [3, 3, 3]],
  '4-grid': [[1, 2], [3, 4]],
  '4-horizontal': [[1, 2, 3, 4]],
  '4-left-featured': [[1, 1, 2], [1, 1, 3], [1, 1, 4]],
  '4-right-featured': [[1, 2, 2], [3, 2, 2], [4, 2, 2]],
  '4-top-featured': [[1, 1, 1], [2, 3, 4]],
  '4-bottom-featured': [[1, 2, 3], [4, 4, 4]],
  '4-mosaic-1': [[1, 1, 2], [3, 4, 4]],
  '4-mosaic-2': [[1, 2, 2], [3, 3, 4]],
  '4-center-split': [[1, 1, 2, 2], [3, 3, 4, 4]],
  '4-corners': [[1, 1, 2, 2], [1, 1, 2, 2], [3, 3, 4, 4], [3, 3, 4, 4]],
  '5-top-row': [[1, 2, 3], [4, 4, 5]],
  '5-bottom-row': [[1, 1, 2], [3, 4, 5]],
  '5-featured-left': [[1, 1, 2, 3], [1, 1, 4, 5]],
  '5-featured-right': [[1, 2, 3, 3], [4, 5, 3, 3]],
  '5-cross': [[1, 2, 2, 3], [4, 2, 2, 5]],
  '5-gallery': [[1, 1, 2, 2], [3, 4, 4, 5]],
  '5-pinterest': [[1, 1, 2], [1, 1, 3], [4, 5, 3]],
  '6-grid': [[1, 2, 3], [4, 5, 6]],
  '6-horizontal': [[1, 2, 3, 4, 5, 6]],
  '6-featured-top': [[1, 1, 2, 2], [3, 4, 5, 6]],
  '6-featured-bottom': [[1, 2, 3, 4], [5, 5, 6, 6]],
  '6-magazine': [[1, 1, 2, 3], [1, 1, 4, 5], [1, 1, 6, 6]],
  '6-mosaic': [[1, 2, 2, 3], [4, 4, 5, 6]],
  '6-tall-left': [[1, 2, 3], [1, 4, 5], [1, 6, 6]],
  '6-tall-right': [[1, 2, 3], [4, 5, 3], [6, 6, 3]],
  '7-gallery': [[1, 1, 2, 2, 3], [4, 5, 5, 6, 7]],
  '8-grid': [[1, 2, 3, 4], [5, 6, 7, 8]],
  '8-featured': [[1, 1, 2, 3, 4], [1, 1, 5, 6, 7], [1, 1, 8, 8, 8]],
  '9-grid': [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  '10-mosaic': [[1, 1, 2, 3, 3], [1, 1, 4, 5, 5], [6, 7, 8, 9, 10]],
  'filmstrip': [[1, 2, 3, 4, 5]],
  'polaroid-3': [[1, 1, 2, 2, 3, 3]],
  't-shape': [[1, 1, 1], [2, 3, 4]],
  'inverted-t': [[1, 2, 3], [4, 4, 4]],
  'staircase': [[1, 2, 2], [1, 3, 3], [4, 4, 4]],
  'diagonal': [[1, 1, 2, 3], [4, 5, 5, 3], [4, 6, 6, 6]],
};

function exportImageCollage(section, isGmail = false) {
  const images = section.images || [];
  if (images.length === 0) return '';

  const gap = section.gap || 8;
  const imageHeight = section.imageHeight || 200;
  const focalPoints = section.focalPoints || [];
  const imageBackgrounds = section.imageBackgrounds || [];
  const imageOverlays = section.imageOverlays || [];
  const layout = section.layout || '4-grid';
  
  // Get the preset
  const preset = COLLAGE_PRESETS[layout] || COLLAGE_PRESETS['4-grid'];
  const rows = preset.length;
  const cols = preset[0]?.length || 1;
  
  // Row height for aspect ratio
  const rowHeightUnit = Math.floor(imageHeight / rows);
  
  // Build a map of cells with their spans
  const cellMap = new Map();
  const processedIds = new Set();
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = preset[r][c];
      if (processedIds.has(cellId)) continue;
      
      // Calculate column span
      let colSpan = 1;
      while (c + colSpan < cols && preset[r][c + colSpan] === cellId) {
        colSpan++;
      }
      
      // Calculate row span
      let rowSpan = 1;
      while (r + rowSpan < rows && preset[r + rowSpan]?.[c] === cellId) {
        rowSpan++;
      }
      
      processedIds.add(cellId);
      cellMap.set(cellId, { row: r, col: c, colSpan, rowSpan, imageIndex: cellId - 1 });
    }
  }
  
  // Build HTML rows
  let tableRowsHtml = '';
  
  for (let r = 0; r < rows; r++) {
    let rowHtml = '<tr>';
    const renderedInThisRow = new Set();
    
    for (let c = 0; c < cols; c++) {
      const cellId = preset[r][c];
      
      // Skip if this cell was already rendered (part of a multi-row span from above)
      const cellInfo = cellMap.get(cellId);
      if (!cellInfo || cellInfo.row !== r || renderedInThisRow.has(cellId)) continue;
      
      // Check if this cell starts on a previous row (rowspan from above)
      if (cellInfo.row < r) continue;
      
      renderedInThisRow.add(cellId);
      
      const { colSpan, rowSpan, imageIndex } = cellInfo;
      const image = images[imageIndex];
      const focalPoint = focalPoints[imageIndex] || { x: 50, y: 50 };
      const bgColor = imageBackgrounds[imageIndex] || '';
      const overlay = imageOverlays[imageIndex] || { color: '', opacity: 0 };
      
      // Calculate cell dimensions - use percentages
      const cellWidthPct = Math.round((colSpan / cols) * 100);
      const cellHeightPx = (rowHeightUnit * rowSpan) + (gap * (rowSpan - 1));
      
      // Is this the last column or last row?
      const isLastColInRow = (c + colSpan >= cols);
      const isLastRow = (r + rowSpan >= rows);
      const marginRight = isLastColInRow ? 0 : gap;
      const marginBottom = isLastRow ? 0 : gap;
      
      // Build cell content - use 100% width images with margin for gaps
      let cellContent;
      if (image) {
        const objectFit = bgColor ? 'contain' : 'cover';
        const overlayDiv = overlay.color && overlay.opacity > 0 
          ? `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${overlay.color}; opacity: ${overlay.opacity / 100};"></div>` 
          : '';
        
        // Use margin for gaps instead of padding - more reliable in email clients
        cellContent = `
          <div style="position: relative; width: calc(100% - ${marginRight}px); max-width: calc(100% - ${marginRight}px); height: ${cellHeightPx}px; border-radius: 8px; overflow: hidden; background-color: ${bgColor || 'transparent'}; margin-right: ${marginRight}px; margin-bottom: ${marginBottom}px;">
            <img src="${image}" alt="Image ${cellId}" style="display: block; width: 100%; max-width: 100%; height: ${cellHeightPx}px; object-fit: ${objectFit}; object-position: ${focalPoint.x}% ${focalPoint.y}%;" />
            ${overlayDiv}
          </div>`;
      } else {
        cellContent = `
          <div style="width: calc(100% - ${marginRight}px); height: ${cellHeightPx}px; background-color: #f4f4f5; border-radius: 8px; display: table; margin-right: ${marginRight}px; margin-bottom: ${marginBottom}px;">
            <div style="display: table-cell; vertical-align: middle; text-align: center; color: #a1a1aa; font-size: 14px;">
              ${cellId}
            </div>
          </div>`;
      }
      
      rowHtml += `
        <td${colSpan > 1 ? ` colspan="${colSpan}"` : ''}${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ''} width="${cellWidthPct}%" valign="top" style="vertical-align: top;">
          ${cellContent}
        </td>`;
    }
    
    rowHtml += '</tr>';
    tableRowsHtml += rowHtml;
  }

  if (!tableRowsHtml) return '';

  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed">
          ${tableRowsHtml}
        </table>
      </td>
    </tr>`;
}

function exportProfileCards(section) {
  const profiles = section.profiles || [];
  if (profiles.length === 0) return '';

  const columns = section.columns || 4;
  const borderRadius = section.imageShape === 'circular' ? '50%' : '8px';
  const cellWidthPct = Math.floor(100 / columns);
  const fontStack = FONT_STACKS['Poppins'];

  let profileCells = '';
  profiles.forEach((profile, i) => {
    if (!profile) return;
    
    profileCells += `
      <td width="${cellWidthPct}%" valign="top" style="text-align: center; vertical-align: top; padding: 10px;">
        ${profile.image ? `<img src="${profile.image}" alt="${profile.name || ''}" width="80" height="80" style="width: 80px; height: 80px; display: block; margin: 0 auto 10px; border-radius: ${borderRadius}; object-fit: cover;" />` : 
        `<div style="width: 80px; height: 80px; margin: 0 auto 10px; border-radius: ${borderRadius}; background-color: #E0E0E0; display: table;">
          <div style="display: table-cell; vertical-align: middle; text-align: center; color: #999; font-size: 32px;">👤</div>
        </div>`}
        ${section.showName !== false && profile.name ? `<div style="font-family: ${fontStack}; font-size: 14px; font-weight: 600; color: #333333; margin: 8px 0 4px;">${profile.name}</div>` : ''}
        ${section.showTitle !== false && profile.title ? `<div style="font-family: ${fontStack}; font-size: 12px; color: #666666;">${profile.title}</div>` : ''}
      </td>`;
  });

  if (!profileCells) return '';

  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 30px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed">
          <tr>
            ${profileCells}
          </tr>
        </table>
      </td>
    </tr>`;
}

function exportRecipe(section, isGmail = false) {
  const ingredients = (section.ingredients || '').replace(/\n/g, '<br>');
  const instructions = (section.instructions || '').replace(/\n/g, '<br>');
  const fontStack = FONT_STACKS['Noto Sans Hebrew'];
  
  return `
    <tr>
      <td style="background-color: ${section.backgroundColor || '#ffffff'}; padding: 30px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed">
          <tr>
            <td align="center">
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
  
  // Logo - use responsive width
  if (section.logo) {
    const logoWidth = section.logoWidth || 120;
    const logoHeight = section.logoHeight || 40;
    content += `
      <tr>
        <td align="${textAlign}" style="padding-bottom: 20px;">
          <img src="${section.logo}" alt="Logo" style="max-width: ${logoWidth}px; height: auto; display: inline-block; object-fit: contain;" />
        </td>
      </tr>`;
  }
  
  // Social icons - use image-based icons for email compatibility
  if (section.showSocial !== false && section.socialLinks) {
    const socialLinks = section.socialLinks;
    const iconSize = section.socialIconSize || 24;
    
    let iconsHtml = '';
    const platforms = ['facebook', 'x', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok'];
    
    platforms.forEach(platform => {
      const url = socialLinks[platform];
      if (url) {
        // Use simple text-based icons for email compatibility
        const iconMap = {
          facebook: 'f',
          x: '𝕏',
          twitter: '𝕏',
          linkedin: 'in',
          instagram: '📷',
          youtube: '▶',
          tiktok: '♪'
        };
        iconsHtml += `
          <a href="${url}" target="_blank" style="display: inline-block; width: ${iconSize}px; height: ${iconSize}px; line-height: ${iconSize}px; text-align: center; text-decoration: none; color: ${section.socialIconColor || '#4B5563'}; font-size: ${Math.floor(iconSize * 0.6)}px; font-weight: bold; margin: 0 ${section.socialGap || 8}px; border-radius: 50%; background-color: #f0f0f0;">${iconMap[platform]}</a>`;
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
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed">
            <tr>
              <td style="border-top: ${section.dividerWidth || 1}px solid ${section.dividerColor || '#E5E7EB'};"></td>
            </tr>
          </table>
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
        <td align="${textAlign}" style="font-family: ${fontStack};">
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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed">
          ${content}
        </table>
      </td>
    </tr>`;
}
