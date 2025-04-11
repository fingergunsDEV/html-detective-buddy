
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { fetchUrlContent } from "@/services/ProxyService";

interface UrlInputProps {
  onFetch: (url: string, htmlContent: string) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onFetch }) => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUrl = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use our proxy service to fetch the URL content
      const htmlContent = await fetchUrlContent(url);
      
      // Call the callback with the URL and HTML content
      onFetch(url, htmlContent);
      
      toast({
        title: "URL Fetched Successfully",
        description: `Fetched content from ${url}`,
      });
    } catch (error) {
      console.error("Error fetching URL:", error);
      toast({
        title: "Error",
        description: "Failed to fetch URL content. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">URL Analysis</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g., example.com)"
          className="flex-grow bg-muted border-none focus-visible:ring-1 focus-visible:ring-accent"
          onKeyDown={(e) => e.key === 'Enter' && fetchUrl()}
        />
        <Button 
          onClick={fetchUrl} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? "Loading..." : "Analyze"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UrlInput;
