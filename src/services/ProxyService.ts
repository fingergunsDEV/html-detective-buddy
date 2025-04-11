
// Proxy service to fetch HTML content from external URLs

/**
 * Fetch HTML content from a URL via our proxy server
 * @param url The URL to fetch
 * @returns The HTML content as a string
 */
export const fetchUrlContent = async (url: string): Promise<string> => {
  try {
    // Ensure URL has a protocol
    let fetchUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      fetchUrl = "https://" + url;
    }
    
    // Use the proxy endpoint to fetch the URL
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(fetchUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error("Error in proxy service:", error);
    throw error;
  }
};
