
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CodeEditor from "@/components/CodeEditor";
import UrlInput from "@/components/UrlInput";
import DebugResult, { Issue } from "@/components/DebugResult";
import { analyzeHtml, analyzeGoogleAnalytics, detectFramework } from "@/services/HtmlAnalyzer";
import { FileText, Globe, RefreshCw, Zap } from "lucide-react";

const Index = () => {
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('code');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fixedCode, setFixedCode] = useState<string | undefined>(undefined);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const { toast } = useToast();

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleUrlFetch = (url: string, htmlContent: string) => {
    setCurrentUrl(url);
    setCode(htmlContent);
    setActiveTab('code');
    handleAnalyze();
  };

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please enter HTML code or fetch a URL first.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    // Small delay to show loading state
    setTimeout(() => {
      try {
        // Basic HTML analysis
        const htmlAnalysisResult = analyzeHtml(code);
        
        // Google Analytics specific analysis if GA code is detected
        let allIssues = [...htmlAnalysisResult.issues];
        if (code.includes('google-analytics') || code.includes('gtag')) {
          const gaIssues = analyzeGoogleAnalytics(code);
          allIssues = [...allIssues, ...gaIssues];
        }
        
        // Detect framework
        const framework = detectFramework(code);
        if (framework) {
          allIssues.push({
            type: 'info',
            message: `${framework} framework detected`,
          });
        }
        
        setIssues(allIssues);
        setFixedCode(htmlAnalysisResult.fixedCode);

        // Show toast based on results
        if (allIssues.filter(i => i.type === 'error').length > 0) {
          toast({
            title: "Analysis complete",
            description: `Found ${allIssues.filter(i => i.type === 'error').length} errors and ${allIssues.filter(i => i.type === 'warning').length} warnings.`,
            variant: "destructive",
          });
        } else if (allIssues.filter(i => i.type === 'warning').length > 0) {
          toast({
            title: "Analysis complete",
            description: `Found ${allIssues.filter(i => i.type === 'warning').length} warnings.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Analysis complete",
            description: "No significant issues found.",
          });
        }
      } catch (error) {
        console.error("Analysis error:", error);
        toast({
          title: "Analysis error",
          description: "An error occurred while analyzing the code.",
          variant: "destructive",
        });
      } finally {
        setAnalyzing(false);
      }
    }, 500);
  };

  const clearAll = () => {
    setCode('');
    setIssues([]);
    setFixedCode(undefined);
    setCurrentUrl('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto py-4">
          <h1 className="text-2xl font-bold flex items-center">
            <FileText className="mr-2 h-6 w-6 text-primary" />
            HTML Render Debug Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Troubleshoot HTML rendering issues and optimize your web code
          </p>
        </div>
      </header>

      <main className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Tabs
              defaultValue="code"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="code" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Code Input
                </TabsTrigger>
                <TabsTrigger value="url" className="flex-1">
                  <Globe className="mr-2 h-4 w-4" />
                  URL Analysis
                </TabsTrigger>
              </TabsList>
              <TabsContent value="code">
                <CodeEditor
                  title="HTML Code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Paste your HTML, CSS, or JavaScript code here..."
                />
              </TabsContent>
              <TabsContent value="url">
                <UrlInput onFetch={handleUrlFetch} />
              </TabsContent>
            </Tabs>

            <div className="flex space-x-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleAnalyze}
                disabled={analyzing || !code.trim()}
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analyze Code
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={clearAll}
                disabled={analyzing || (!code && issues.length === 0)}
              >
                Clear
              </Button>
            </div>
          </div>

          <div>
            <DebugResult 
              issues={issues} 
              fixedCode={fixedCode}
              isLoading={analyzing}
            />
          </div>
        </div>

        <Separator className="my-8" />

        <div className="bg-card rounded-lg p-4 text-sm">
          <h2 className="font-semibold mb-2">About This Tool</h2>
          <p className="text-muted-foreground">
            The HTML Render Debug Assistant helps identify issues in your HTML, CSS, JavaScript, and Google Analytics implementation.
            It can detect common problems like unclosed tags, deprecated elements, and accessibility issues.
            URL analysis will fetch the HTML content from websites through our proxy server, providing a complete debugging experience without CORS limitations.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
