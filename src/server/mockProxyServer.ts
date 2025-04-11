
import { createServer, Response } from 'miragejs';

/**
 * Sets up a mock server to simulate our proxy API during development
 */
export function setupMockServer() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Setting up mock proxy server for development');
    
    return createServer({
      routes() {
        this.namespace = 'api';

        this.get('/proxy', async (schema, request) => {
          const url = request.queryParams.url;
          
          if (!url) {
            return new Response(400, {}, { error: 'URL parameter is required' });
          }

          try {
            // In a real implementation, we would fetch the URL server-side
            // For this mock, we'll return sample HTML based on the URL
            
            // Simulate a slight delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            if (url.includes('example.com')) {
              return `
<!DOCTYPE html>
<html>
<head>
  <title>Example Domain</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { background-color: #f0f0f2; margin: 0; padding: 0; font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif; }
    div { width: 600px; margin: 5em auto; padding: 2em; background-color: #fdfdff; border-radius: 0.5em; box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02); }
    a:link, a:visited { color: #38488f; text-decoration: none; }
    @media (max-width: 700px) { div { margin: 0 auto; width: auto; } }
  </style>
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-123456789-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-123456789-1');
    gtag('config', 'UA-123456789-2'); // Duplicate tracking code
  </script>
</head>
<body>
  <div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
    <img src="example.jpg" />
  </div>
</body>
</html>
              `;
            } else if (url.includes('error.test')) {
              return `
<!DOCTYPE html>
<html>
<head>
  <title>Error Test Page</title>
</head>
<body>
  <h1>Error Test Page<h1>
  <div class=container>
    <p>This page has unclosed tags and errors.</p>
    <center>This uses deprecated center tag</center>
    <div style="color:red">Inline styles used here</style>
    <img src="missing.jpg">
    <div id=test>Missing quotes on attributes</div>
    <script>
      // Error in JavaScript
      function calculateTotal(items) {
        let total = 0;
        for (let i = 0; i < items.length; i++ {
          total += items[i].price;
        }
        return total;
      }
    </script>
  </div>
</body>
              `;
            } else {
              return `
<!DOCTYPE html>
<html>
<head>
  <title>${url}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>URL Analysis</h1>
  <p>This is a placeholder for ${url}</p>
</body>
</html>
              `;
            }
          } catch (error) {
            console.error('Error in mock proxy server:', error);
            return new Response(500, {}, { error: 'Failed to process URL' });
          }
        });
      }
    });
  }
  
  return null;
}
