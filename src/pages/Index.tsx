
import React from 'react';
import AppHeader from "@/components/AppHeader";
import CodeInputPanel from "@/components/CodeInputPanel";
import DebugResult from "@/components/DebugResult";
import AboutSection from "@/components/AboutSection";
import { useCodeAnalysis } from "@/hooks/useCodeAnalysis";

const Index = () => {
  const {
    code,
    analyzing,
    issues,
    fixedCode,
    handleCodeChange,
    handleUrlFetch,
    performAnalysis,
    clearAll
  } = useCodeAnalysis();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CodeInputPanel
            code={code}
            onCodeChange={handleCodeChange}
            onAnalyze={performAnalysis}
            onClear={clearAll}
            onUrlFetch={handleUrlFetch}
            analyzing={analyzing}
          />

          <div>
            <DebugResult 
              issues={issues} 
              fixedCode={fixedCode}
              isLoading={analyzing}
            />
          </div>
        </div>

        <AboutSection />
      </main>
    </div>
  );
};

export default Index;
