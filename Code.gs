function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('LMS Resource Generator')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function generateEmbedCodes(urls, options) {
  const { 
    aspectRatio,      
    blockPopouts, 
    limitRelated,     
    forceCaptions,    
    startTime,        
    endTime,          
    hideSlideNav,     
    autoAdvance,      
    docMode,          
    driveMode,
    loadMode,
    maskContent,      
    maskMenu,         
    maskSlideNum,
    debugShields,
    shieldLeftStart, 
    shieldLeftWidth, 
    shieldRightStart 
  } = options;
  
  const urlArray = urls.split('\n');
  
  let embedCodes = urlArray.map(url => {
    url = url.trim();
    if (!url) return ''; 

    // --- 1. Global Attributes ---
    let containerStyle = '';
    let iframeStyle = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;';
    
    // Default Aspect Ratios
    if (aspectRatio === 'fixed') {
      containerStyle = `position: relative; width: 100%; height: 500px; overflow: hidden;`;
    } else if (aspectRatio === '4/3') {
      containerStyle = `position: relative; width: 100%; padding-bottom: 75%; height: 0; overflow: hidden;`;
    } else {
      containerStyle = `position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden;`;
    }

    // --- SECURITY ---
    // blockPopouts (Checked) = Strict Sandbox (Blocks fonts/symbols sometimes)
    // blockPopouts (Unchecked) = Hybrid Mode (Shields block clicks, fonts load)
    const sandboxAttrs = blockPopouts
      ? `sandbox="allow-same-origin allow-scripts allow-forms allow-presentation allow-downloads allow-modals allow-popups"` 
      : ``; 

    const loadAttr = `loading="${loadMode}"`;
    const permAttrs = `allowfullscreen="true" allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"`;
    const refPolicy = `referrerpolicy="no-referrer-when-downgrade"`;
    const noContext = `oncontextmenu="return false;"`;
    let scrollAttr = 'scrolling="no"';

    // --- 2. Generate Content ---
    let iframeHtml = '';
    const youtubeId = getYoutubeId(url);

    if (youtubeId) {
      let params = [];
      if (limitRelated) params.push('rel=0');
      if (forceCaptions) params.push('cc_load_policy=1');
      if (startTime) params.push(`start=${startTime}`);
      if (endTime) params.push(`end=${endTime}`);
      const query = params.length > 0 ? '?' + params.join('&') : '';
      iframeHtml = `<iframe ${permAttrs} src="https://www.youtube.com/embed/${youtubeId}${query}" ${sandboxAttrs} ${loadAttr} style="${iframeStyle}" frameborder="0" ${scrollAttr} ${noContext} ${refPolicy} seamless=""></iframe>`;

    } else if (url.includes("drive.google.com") && (url.includes("/file/") || url.includes("id="))) {
      let fileId = "";
      const parts = url.split('/');
      if (url.includes("/file/d/")) { fileId = parts[parts.indexOf("d") + 1]; } 
      else if (url.includes("id=")) { fileId = url.split("id=")[1].split("&")[0]; }

      if (driveMode === 'image') {
        const imgUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w4000`;
        return `<img src="${imgUrl}" alt="Drive Image" ${loadAttr} style="width: 100%; height: auto; display: block; border-radius: 8px;" ${noContext}>`;
      } else {
        iframeHtml = `<iframe ${permAttrs} src="https://drive.google.com/file/d/${fileId}/preview" ${sandboxAttrs} ${loadAttr} style="${iframeStyle}" frameborder="0" ${scrollAttr} ${noContext} ${refPolicy} seamless=""></iframe>`;
      }

    } else if (url.includes("docs.google.com/presentation")) {
      // --- GOOGLE SLIDES SPECIFIC FIX ---
      // We increased the buffer from 30px to 35px.
      // This extra height prevents the player from shrinking the slide to fit, eliminating side bars.
      if (aspectRatio === '16/9') {
        containerStyle = `position: relative; width: 100%; padding-bottom: calc(56.25% + 35px); height: 0; overflow: hidden;`;
      } else if (aspectRatio === '4/3') {
        containerStyle = `position: relative; width: 100%; padding-bottom: calc(75% + 35px); height: 0; overflow: hidden;`;
      }

      let cleanUrl = url.split('/preview')[0].split('/edit')[0].split('/mobilepresent')[0];
      if (!cleanUrl.endsWith('/embed')) {
        cleanUrl += '/embed';
      }

      let params = [];
      if (hideSlideNav) params.push('rm=minimal');
      if (autoAdvance) params.push('start=true&loop=true&delayms=3000');
      
      const separator = cleanUrl.includes('?') ? '&' : '?';
      iframeHtml = `<iframe ${permAttrs} src="${cleanUrl}${separator + params.join('&')}" ${sandboxAttrs} ${loadAttr} style="${iframeStyle}" frameborder="0" ${scrollAttr} ${noContext} ${refPolicy} seamless=""></iframe>`;

    } else if (url.includes("docs.google.com/document")) {
      let cleanUrl = url.split('/edit')[0].split('/export')[0];
      if (docMode === 'preview') {
        iframeHtml = `<iframe ${permAttrs} src="${cleanUrl}/preview" ${sandboxAttrs} ${loadAttr} style="${iframeStyle}" frameborder="0" scrolling="auto" ${noContext} ${refPolicy} seamless=""></iframe>`;
      } else {
        return `${cleanUrl}/export?format=pdf`;
      }

    } else if (url.includes("docs.google.com/forms")) {
      let cleanUrl = url.split('/viewform')[0];
      iframeHtml = `<iframe ${permAttrs} src="${cleanUrl}/viewform?embedded=true" ${sandboxAttrs} ${loadAttr} style="${iframeStyle}" frameborder="0" scrolling="auto" ${noContext} ${refPolicy} seamless=""></iframe>`;

    } else {
      return ``;
    }

    // --- 3. Apply Shields ---
    let shields = '';
    const shieldColor = debugShields ? 'rgba(255, 0, 0, 0.5)' : 'transparent';
    const cursorType = debugShields ? 'help' : 'default';

    // A. Pop-out Shield (Top Right)
    if (blockPopouts) {
      shields += `<div style="position: absolute; top: 0; right: 0; width: 100px; height: 80px; background: ${shieldColor}; z-index: 30; cursor: default;" oncontextmenu="return false;" title="Pop-out Blocked"></div>`;
    }

    // B. Manual Shields
    if (maskContent || maskSlideNum || maskMenu) {
      if (maskContent) {
        shields += `<div style="position: absolute; top: 0; left: 0; width: 100%; height: calc(100% - 50px); background: ${shieldColor}; z-index: 20; cursor: ${cursorType};" oncontextmenu="return false;" title="Content Protected"></div>`;
      }
      if (maskSlideNum) {
        shields += `<div style="position: absolute; bottom: 0; left: ${shieldLeftStart}px; width: ${shieldLeftWidth}px; height: 50px; background: ${shieldColor}; z-index: 20; cursor: ${cursorType};" oncontextmenu="return false;" title="Slide # Blocked"></div>`;
      }
      if (maskMenu) {
        shields += `<div style="position: absolute; bottom: 0; left: ${shieldRightStart}px; right: 0; height: 50px; background: ${shieldColor}; z-index: 20; cursor: ${cursorType};" oncontextmenu="return false;" title="Menu Blocked"></div>`;
      }
    }
      
    return `<div style="${containerStyle}" oncontextmenu="return false;">\n  ${iframeHtml}\n  ${shields}\n</div>`;
  });
  
  return embedCodes.filter(code => code !== '').join('\n');
}

function getYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
