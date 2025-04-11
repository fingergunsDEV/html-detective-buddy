
import React from 'react';
import { Separator } from "@/components/ui/separator";

const AboutSection: React.FC = () => {
  return (
    <>
      <Separator className="my-8" />
      <div className="bg-card rounded-lg p-4 text-sm">
        <h2 className="font-semibold mb-2">About This Tool</h2>
        <p className="text-muted-foreground">
          The HTML Render Debug Assistant helps identify issues in your HTML, CSS, JavaScript, and Google Analytics implementation.
          It can detect common problems like unclosed tags, deprecated elements, and accessibility issues.
          URL analysis will fetch the HTML content from websites through our proxy server, providing a complete debugging experience without CORS limitations.
        </p>
      </div>
    </>
  );
};

export default AboutSection;
