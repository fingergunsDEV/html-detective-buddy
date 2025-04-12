
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

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

    // Add protocol if missing
    let fetchUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      fetchUrl = "https://" + url;
    }

    setLoading(true);
    try {
      // This would need a proxy server in production
      // For now, we'll use a mock response
      setTimeout(() => {
        setLoading(false);
        toast({
          title: "URL Analysis Limited",
          description: "Due to CORS limitations, the URL feature requires backend implementation. Please paste the HTML directly for now.",
        });
      }, 1500);
      
      // In a real implementation, we would fetch the HTML like this:
      // const response = await fetch(`/api/proxy?url=${encodeURIComponent(fetchUrl)}`);
      // if (!response.ok) throw new Error('Failed to fetch URL');
      // const html = await response.text();
      // onFetch(fetchUrl, html);
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
