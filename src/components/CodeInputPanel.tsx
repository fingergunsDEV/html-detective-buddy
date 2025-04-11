
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Globe, RefreshCw, Zap } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import UrlInput from "@/components/UrlInput";

interface CodeInputPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  onUrlFetch: (url: string, htmlContent: string) => void;
  analyzing: boolean;
}

const CodeInputPanel: React.FC<CodeInputPanelProps> = ({
  code,
  onCodeChange,
  onAnalyze,
  onClear,
  onUrlFetch,
  analyzing,
}) => {
  const [activeTab, setActiveTab] = useState<string>('code');

  return (
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
            onChange={onCodeChange}
            placeholder="Paste your HTML, CSS, or JavaScript code here..."
          />
        </TabsContent>
        <TabsContent value="url">
          <UrlInput onFetch={onUrlFetch} />
        </TabsContent>
      </Tabs>

      <div className="flex space-x-2">
        <Button 
          className="flex-1 bg-primary hover:bg-primary/90"
          onClick={onAnalyze}
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
          onClick={onClear}
          disabled={analyzing || (!code && code.length === 0)}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default CodeInputPanel;
