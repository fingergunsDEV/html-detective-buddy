
import { Issue } from "@/components/DebugResult";

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

  // Simple checks for demonstration
  // In a real implementation, this would be much more sophisticated

  // Check for missing doctype
  if (!html.toLowerCase().includes('<!doctype')) {
    issues.push({
      type: 'warning',
      message: 'Missing DOCTYPE declaration',
      solution: 'Add <!DOCTYPE html> at the beginning of your HTML document',
    });
    fixedCode = `<!DOCTYPE html>\n${html}`;
  }

  // Check for unclosed tags - very basic check
  const openTags = html.match(/<[^/][^>]*>/g) || [];
  const closeTags = html.match(/<\/[^>]*>/g) || [];
  if (openTags.length > closeTags.length) {
    issues.push({
      type: 'error',
      message: 'Unclosed HTML tags detected',
      solution: 'Ensure all tags are properly closed',
    });
  }

  // Check for inline styles
  if (html.match(/<[^>]* style=["'][^"']*["'][^>]*>/g)) {
    issues.push({
      type: 'warning',
      message: 'Inline styles detected',
      code: html.match(/<[^>]* style=["'][^"']*["'][^>]*>/g)?.[0] || '',
      solution: 'Consider using external CSS for better maintainability',
    });
  }

  // Check for Google Analytics
  if (html.includes('google-analytics.com/analytics.js')) {
    issues.push({
      type: 'warning',
      message: 'Using legacy Google Analytics (analytics.js)',
      solution: 'Consider upgrading to GA4 using gtag.js for better features and future support',
    });
  } else if (html.includes('googletagmanager.com/gtag')) {
    issues.push({
      type: 'success',
      message: 'Using modern Google Analytics (gtag.js)',
    });
  }

  // Check for deprecated HTML tags
  const deprecatedTags = ['center', 'font', 'marquee', 'blink', 'strike'];
  for (const tag of deprecatedTags) {
    const regex = new RegExp(`<${tag}[^>]*>`, 'i');
    if (regex.test(html)) {
      issues.push({
        type: 'error',
        message: `Deprecated <${tag}> tag detected`,
        code: html.match(regex)?.[0] || '',
        solution: `Replace <${tag}> with CSS equivalent styling`,
      });
    }
  }

  // Check for accessibility - alt attributes on images
  const imgTags = html.match(/<img[^>]*>/g) || [];
  for (const imgTag of imgTags) {
    if (!imgTag.includes('alt=')) {
      issues.push({
        type: 'warning',
        message: 'Image missing alt attribute',
        code: imgTag,
        solution: 'Add descriptive alt text to images for accessibility',
      });
    }
  }

  // Check for viewport meta tag (responsive design)
  if (!html.includes('viewport') && html.includes('<meta')) {
    issues.push({
      type: 'info',
      message: 'No viewport meta tag found',
      solution: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for responsive design',
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

// Mock function for Google Analytics specific analysis
export const analyzeGoogleAnalytics = (html: string): Issue[] => {
  const issues: Issue[] = [];

  // Check for duplicate GA tags
  const gaTagsCount = (html.match(/gtag/g) || []).length;
  if (gaTagsCount > 1) {
    issues.push({
      type: 'error',
      message: 'Multiple Google Analytics tags detected',
      solution: 'Remove duplicate GA implementations to prevent data duplication',
    });
  }

  // Check for GA4 configuration
  if (html.includes('gtag') && !html.includes('G-')) {
    issues.push({
      type: 'warning',
      message: 'Using gtag.js without a GA4 measurement ID',
      solution: 'Add a GA4 measurement ID (format: G-XXXXXXXX) to fully leverage GA4 capabilities',
    });
  }

  // Check for consent mode
  if (html.includes('gtag') && !html.includes('consent')) {
    issues.push({
      type: 'info',
      message: 'Google consent mode not detected',
      solution: 'Consider implementing consent mode for better privacy compliance in regions with strict privacy laws',
    });
  }

  return issues;
};

// Function to detect the framework used
export const detectFramework = (html: string): string | null => {
  if (html.includes('react')) return 'React';
  if (html.includes('vue')) return 'Vue.js';
  if (html.includes('angular')) return 'Angular';
  if (html.includes('a-scene')) return 'A-Frame';
  if (html.includes('phaser')) return 'Phaser.js';
  return null;
};
