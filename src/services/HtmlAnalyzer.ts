
import { Issue } from "@/components/DebugResult";

// Helper function to extract the line number and column from HTML string
const getLineAndColumn = (html: string, position: number): { line: number; column: number } => {
  if (position >= html.length) {
    return { line: -1, column: -1 };
  }
  
  const lines = html.substring(0, position).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  
  return { line, column };
};

// Helper to extract context around an issue
const extractCodeContext = (html: string, position: number, contextLines: number = 3): string => {
  if (position < 0 || position >= html.length) {
    return '';
  }
  
  const lines = html.split('\n');
  const { line, column } = getLineAndColumn(html, position);
  
  if (line <= 0) {
    return '';
  }
  
  const startLine = Math.max(1, line - contextLines);
  const endLine = Math.min(lines.length, line + contextLines);
  
  let codeContext = '';
  for (let i = startLine; i <= endLine; i++) {
    const lineNumber = i.toString().padStart(4, ' ');
    const highlightedLine = i === line ? '> ' : '  ';
    codeContext += `${lineNumber} ${highlightedLine}${lines[i - 1]}\n`;
    
    // Add a marker for the exact column if this is the issue line
    if (i === line) {
      codeContext += `      ${' '.repeat(column - 1)}^\n`;
    }
  }
  
  return codeContext;
};

// Sample HTML analysis function
export const analyzeHtml = (html: string): {
  issues: Issue[];
  fixedCode?: string;
} => {
  const issues: Issue[] = [];
  let fixedCode: string | undefined;

  if (!html.trim()) {
    return { issues: [], fixedCode: undefined };
  }

  // Check for missing doctype
  if (!html.toLowerCase().includes('<!doctype')) {
    const position = 0; // The doctype should be at the start
    issues.push({
      type: 'warning',
      message: 'Missing DOCTYPE declaration',
      line: 1,
      column: 1,
      code: extractCodeContext(html, position),
      solution: 'Add <!DOCTYPE html> at the beginning of your HTML document',
    });
    fixedCode = `<!DOCTYPE html>\n${html}`;
  }

  // Check for unclosed tags - improved detection
  const htmlForParsing = html.replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
  const openTagsRegex = /<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*(?<!\/)>/g;
  const closeTagsRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)\s*>/g;
  const selfClosingTagsRegex = /<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*\/>/g;
  
  const openTags: Array<{ tag: string; position: number }> = [];
  const closeTags: Array<{ tag: string; position: number }> = [];
  const selfClosingTags: Array<{ tag: string; position: number }> = [];
  
  let match;
  while ((match = openTagsRegex.exec(htmlForParsing)) !== null) {
    openTags.push({ tag: match[1], position: match.index });
  }
  
  while ((match = closeTagsRegex.exec(htmlForParsing)) !== null) {
    closeTags.push({ tag: match[1], position: match.index });
  }
  
  while ((match = selfClosingTagsRegex.exec(htmlForParsing)) !== null) {
    selfClosingTags.push({ tag: match[1], position: match.index });
  }
  
  // Remove self-closing tags from open tags count
  const selfClosingTagNames = selfClosingTags.map(tag => tag.tag);
  const openTagsCount = openTags.filter(tag => !selfClosingTagNames.includes(tag.tag)).length;
  
  // Find mismatched and unclosed tags
  if (openTagsCount > closeTags.length) {
    const tagStack: Array<{ tag: string; position: number }> = [];
    let lastPosition = 0;
    
    // This is a simplified algorithm and might not catch all issues
    for (const openTag of openTags) {
      const tagName = openTag.tag;
      // Skip void elements
      if (['img', 'br', 'hr', 'meta', 'link', 'input', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'].includes(tagName.toLowerCase())) {
        continue;
      }
      
      tagStack.push(openTag);
      lastPosition = openTag.position;
    }
    
    for (const closeTag of closeTags) {
      const tagName = closeTag.tag;
      
      // Find the matching opening tag
      let matched = false;
      for (let i = tagStack.length - 1; i >= 0; i--) {
        if (tagStack[i].tag.toLowerCase() === tagName.toLowerCase()) {
          tagStack.splice(i, 1);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        // Extra closing tag without matching opening tag
        const position = closeTag.position;
        const { line, column } = getLineAndColumn(html, position);
        
        issues.push({
          type: 'error',
          message: `Extra closing tag: </${tagName}>`,
          line,
          column,
          code: extractCodeContext(html, position),
          solution: `Remove the extra </${tagName}> tag`,
        });
      }
    }
    
    // Any tags left in the stack are unclosed
    for (const unclosedTag of tagStack) {
      const { tag, position } = unclosedTag;
      const { line, column } = getLineAndColumn(html, position);
      
      issues.push({
        type: 'error',
        message: `Unclosed tag: <${tag}>`,
        line,
        column,
        code: extractCodeContext(html, position),
        solution: `Add a closing </${tag}> tag`,
      });
    }
  }

  // Check for inline styles
  const inlineStylesRegex = /<[^>]* style=["']([^"']*)["'][^>]*>/g;
  while ((match = inlineStylesRegex.exec(html)) !== null) {
    const position = match.index;
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'warning',
      message: 'Inline styles detected',
      line,
      column,
      code: extractCodeContext(html, position),
      solution: 'Consider using external CSS for better maintainability',
    });
  }

  // Check for Google Analytics
  if (html.includes('google-analytics.com/analytics.js')) {
    const position = html.indexOf('google-analytics.com/analytics.js');
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'warning',
      message: 'Using legacy Google Analytics (analytics.js)',
      line,
      column,
      code: extractCodeContext(html, position),
      solution: 'Consider upgrading to GA4 using gtag.js for better features and future support',
    });
  } else if (html.includes('googletagmanager.com/gtag')) {
    const position = html.indexOf('googletagmanager.com/gtag');
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'success',
      message: 'Using modern Google Analytics (gtag.js)',
      line,
      column,
      code: extractCodeContext(html, position),
    });
  }

  // Check for deprecated HTML tags
  const deprecatedTags = ['center', 'font', 'marquee', 'blink', 'strike'];
  for (const tag of deprecatedTags) {
    const regex = new RegExp(`<${tag}[^>]*>`, 'i');
    const match = regex.exec(html);
    
    if (match) {
      const position = match.index;
      const { line, column } = getLineAndColumn(html, position);
      
      issues.push({
        type: 'error',
        message: `Deprecated <${tag}> tag detected`,
        line,
        column,
        code: extractCodeContext(html, position),
        solution: `Replace <${tag}> with CSS equivalent styling`,
      });
    }
  }

  // Check for accessibility - alt attributes on images
  const imgTagsRegex = /<img[^>]*>/g;
  while ((match = imgTagsRegex.exec(html)) !== null) {
    const imgTag = match[0];
    const position = match.index;
    
    if (!imgTag.includes('alt=')) {
      const { line, column } = getLineAndColumn(html, position);
      
      issues.push({
        type: 'warning',
        message: 'Image missing alt attribute',
        line,
        column,
        code: extractCodeContext(html, position),
        solution: 'Add descriptive alt text to images for accessibility',
      });
    }
  }

  // Check for viewport meta tag (responsive design)
  if (!html.includes('viewport') && html.includes('<meta')) {
    const position = html.indexOf('<meta');
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'info',
      message: 'No viewport meta tag found',
      line,
      column,
      code: extractCodeContext(html, position),
      solution: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for responsive design',
    });
  }

  // Check for JavaScript syntax errors
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[1];
    const scriptPosition = match.index + match[0].indexOf(scriptContent);
    
    // Look for common JavaScript syntax errors
    // This is a simplified check - a real implementation would use a full JS parser
    const missingParenthesis = scriptContent.includes('for (') && !scriptContent.includes(') {');
    const missingSemicolon = /\blet\s+\w+\s*=\s*[^;{}\n]+(?!\s*[;{}\n])/g.test(scriptContent);
    
    if (missingParenthesis) {
      const errorPosition = scriptPosition + scriptContent.indexOf('for (');
      const { line, column } = getLineAndColumn(html, errorPosition);
      
      issues.push({
        type: 'error',
        message: 'JavaScript syntax error: Missing closing parenthesis in for loop',
        line,
        column,
        code: extractCodeContext(html, errorPosition),
        solution: 'Add the missing closing parenthesis to the for loop',
      });
    }
    
    if (missingSemicolon) {
      const match = /\blet\s+\w+\s*=\s*[^;{}\n]+(?!\s*[;{}\n])/g.exec(scriptContent);
      if (match) {
        const errorPosition = scriptPosition + match.index;
        const { line, column } = getLineAndColumn(html, errorPosition);
        
        issues.push({
          type: 'warning',
          message: 'JavaScript style issue: Missing semicolon',
          line,
          column,
          code: extractCodeContext(html, errorPosition),
          solution: 'Add semicolons to the end of statements for better code clarity',
        });
      }
    }
  }

  // Detect malformed HTML attributes
  const malformedAttributeRegex = /<[^>]+\s(\w+)=(?!['"]).+?(?=\s|\/>|>)/g;
  while ((match = malformedAttributeRegex.exec(html)) !== null) {
    const position = match.index;
    const attributeName = match[1];
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'error',
      message: `Malformed HTML attribute: ${attributeName}`,
      line,
      column,
      code: extractCodeContext(html, position),
      solution: `Wrap the attribute value in quotes: ${attributeName}="value"`,
    });
  }

  // If no issues are found, add a success message
  if (issues.length === 0) {
    issues.push({
      type: 'success',
      message: 'No significant issues found in the HTML code',
    });
  }

  return {
    issues,
    fixedCode: issues.some(i => i.type === 'error' || i.type === 'warning') ? fixedCode : undefined
  };
};

// Enhanced Google Analytics analysis
export const analyzeGoogleAnalytics = (html: string): Issue[] => {
  const issues: Issue[] = [];

  // Check for duplicate GA tags
  const gtagMatches = html.match(/gtag\(\s*['"]config['"]\s*,\s*['"][^'"]+['"]/g) || [];
  const trackingIds = new Set<string>();
  const duplicates = new Set<string>();
  
  for (const match of gtagMatches) {
    const trackingIdMatch = /['"]([^'"]+)['"](?:\s*,|\s*$)/.exec(match);
    if (trackingIdMatch) {
      const trackingId = trackingIdMatch[1];
      if (trackingIds.has(trackingId)) {
        duplicates.add(trackingId);
      } else {
        trackingIds.add(trackingId);
      }
    }
  }
  
  if (duplicates.size > 0) {
    const duplicatesList = Array.from(duplicates).join(', ');
    const position = html.indexOf(Array.from(duplicates)[0]);
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'error',
      message: `Multiple Google Analytics tags with same ID: ${duplicatesList}`,
      line,
      column,
      code: extractCodeContext(html, position),
      solution: 'Remove duplicate GA implementations to prevent data duplication',
    });
  }

  // Check for GA4 configuration
  if (html.includes('gtag') && !html.includes('G-')) {
    const position = html.indexOf('gtag');
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'warning',
      message: 'Using gtag.js without a GA4 measurement ID',
      line,
      column,
      code: extractCodeContext(html, position),
      solution: 'Add a GA4 measurement ID (format: G-XXXXXXXX) to fully leverage GA4 capabilities',
    });
  }

  // Check for consent mode
  if (html.includes('gtag') && !html.includes('consent')) {
    const position = html.indexOf('gtag');
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'info',
      message: 'Google consent mode not detected',
      line,
      column,
      code: extractCodeContext(html, position),
      solution: 'Consider implementing consent mode for better privacy compliance in regions with strict privacy laws',
    });
  }

  // Check for proper event tracking setup
  if (html.includes('gtag') && !html.includes('event')) {
    const position = html.indexOf('gtag');
    const { line, column } = getLineAndColumn(html, position);
    
    issues.push({
      type: 'info',
      message: 'No custom event tracking detected',
      line,
      column,
      code: extractCodeContext(html, position),
      solution: 'Consider adding custom event tracking for better user behavior analysis',
    });
  }

  return issues;
};

// Function to detect the framework used
export const detectFramework = (html: string): string | null => {
  // React detection
  if (html.includes('_react') || html.includes('ReactDOM') || html.includes('data-reactroot')) {
    return 'React';
  }
  
  // Vue.js detection
  if (html.includes('vue.js') || html.includes('__vue__') || html.includes('data-v-')) {
    return 'Vue.js';
  }
  
  // Angular detection
  if (html.includes('ng-') || html.includes('angular.js') || html.includes('ng-app')) {
    return 'Angular';
  }
  
  // A-Frame detection
  if (html.includes('a-scene') || html.includes('aframe.js') || html.includes('aframe-')) {
    return 'A-Frame';
  }
  
  // Phaser.js detection
  if (html.includes('phaser.js') || html.includes('Phaser.Game') || html.includes('phaser-')) {
    return 'Phaser.js';
  }
  
  return null;
};
