
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  placeholder?: string;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  title,
  placeholder = "Paste your code here...",
  className = "",
}) => {
  return (
    <Card className={`bg-card text-card-foreground ${className}`}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="code-editor min-h-[200px] bg-muted font-mono text-sm resize-none border-none focus-visible:ring-1 focus-visible:ring-accent"
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
