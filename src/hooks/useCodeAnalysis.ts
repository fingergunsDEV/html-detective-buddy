
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { analyzeHtml, analyzeGoogleAnalytics, detectFramework } from "@/services/HtmlAnalyzer";
import { Issue } from "@/components/DebugResult";

export const useCodeAnalysis = () => {
  const [code, setCode] = useState<string>('');
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
    performAnalysis(htmlContent);
  };

  const performAnalysis = (codeToAnalyze: string = code) => {
    // Ensure codeToAnalyze is a string
    const codeString = codeToAnalyze || '';
    
    if (!codeString.trim()) {
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
        const htmlAnalysisResult = analyzeHtml(codeString);
        
        // Google Analytics specific analysis if GA code is detected
        let allIssues = [...htmlAnalysisResult.issues];
        if (codeString.includes('google-analytics') || codeString.includes('gtag')) {
          const gaIssues = analyzeGoogleAnalytics(codeString);
          allIssues = [...allIssues, ...gaIssues];
        }
        
        // Detect framework
        const framework = detectFramework(codeString);
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

  return {
    code,
    analyzing,
    issues,
    fixedCode,
    currentUrl,
    handleCodeChange,
    handleUrlFetch,
    performAnalysis,
    clearAll
  };
};
