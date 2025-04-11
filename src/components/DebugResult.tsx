
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Bug, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export type IssueType = 'error' | 'warning' | 'info' | 'success';

export interface Issue {
  type: IssueType;
  message: string;
  code?: string;
  line?: number;
  column?: number;
  solution?: string;
}

interface DebugResultProps {
  issues: Issue[];
  fixedCode?: string;
  isLoading?: boolean;
}

const IconByType: Record<IssueType, React.ReactNode> = {
  error: <Bug className="h-4 w-4 text-debug-error" />,
  warning: <AlertTriangle className="h-4 w-4 text-debug-warning" />,
  info: <Info className="h-4 w-4 text-debug-info" />,
  success: <CheckCircle className="h-4 w-4 text-debug-success" />
};

const BadgeByType: Record<IssueType, string> = {
  error: "bg-destructive text-destructive-foreground",
  warning: "bg-debug-warning text-black",
  info: "bg-debug-info text-black",
  success: "bg-debug-success text-black"
};

const DebugResult: React.FC<DebugResultProps> = ({ issues, fixedCode, isLoading = false }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-card text-card-foreground">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <div className="animate-pulse-subtle">Analyzing code...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (issues.length === 0 && !fixedCode) {
    return (
      <Card className="bg-card text-card-foreground">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <p>Enter code or URL to begin analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>Analysis Results</span>
          <div className="flex gap-2">
            {issues.filter(i => i.type === 'error').length > 0 && (
              <Badge className={BadgeByType['error']}>
                {issues.filter(i => i.type === 'error').length} Errors
              </Badge>
            )}
            {issues.filter(i => i.type === 'warning').length > 0 && (
              <Badge className={BadgeByType['warning']}>
                {issues.filter(i => i.type === 'warning').length} Warnings
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px] pr-4">
          {issues.map((issue, idx) => (
            <div key={idx} className="mb-6">
              <div className="flex items-start gap-2">
                <div className="mt-1">{IconByType[issue.type]}</div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{issue.message}</p>
                  {issue.line && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Line {issue.line}{issue.column ? `, Column ${issue.column}` : ''}
                    </p>
                  )}
                  {issue.code && (
                    <div className="relative mt-2 mb-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="absolute right-2 top-2 h-6 px-2 text-xs z-10"
                        onClick={() => copyToClipboard(issue.code || '')}
                      >
                        <ClipboardCopy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <pre className="bg-code-highlight text-code-text p-3 pt-10 rounded text-xs overflow-x-auto whitespace-pre">
                        {issue.code}
                      </pre>
                    </div>
                  )}
                  {issue.solution && (
                    <div className="mt-2 text-sm bg-green-950/30 p-2 rounded border border-green-800/50">
                      <span className="text-debug-success font-medium">Solution: </span>
                      {issue.solution}
                    </div>
                  )}
                </div>
              </div>
              {idx < issues.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </ScrollArea>

        {fixedCode && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Refactored Code</h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-xs"
                onClick={() => copyToClipboard(fixedCode)}
              >
                <ClipboardCopy className="h-3.5 w-3.5 mr-1" />
                Copy
              </Button>
            </div>
            <pre className="bg-code-highlight text-code-text p-2 rounded text-xs overflow-x-auto">
              {fixedCode}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugResult;
