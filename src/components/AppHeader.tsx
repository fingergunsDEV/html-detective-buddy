
import React from 'react';
import { FileText } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
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
  );
};

export default AppHeader;
