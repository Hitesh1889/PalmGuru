import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Basic Markdown renderer for headers, bold, and lists
// This is a simplified renderer. For complex markdown, a dedicated library like 'marked' or 'react-markdown' would be better.
// However, given the constraint of not using external libraries unless specified, this simple approach is used.
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const renderLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-semibold mb-2 text-blue-300">{line.substring(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold mb-3 text-pink-400">{line.substring(3)}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-3xl font-extrabold mb-4 text-purple-400">{line.substring(2)}</h1>;
    }

    // Unordered lists
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-4 list-disc text-gray-200">{line.substring(2)}</li>;
    }
    if (line.startsWith('* ')) {
        return <li key={index} className="ml-4 list-disc text-gray-200">{line.substring(2)}</li>;
    }

    // Bold text
    let processedLine: React.ReactNode = line;
    // Process **bold**
    processedLine = String(processedLine).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Process *italic* (simple, not conflicting with bold for now)
    processedLine = String(processedLine).replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Simple way to handle paragraphs, wrapping in <p> tags
    return <p key={index} className="mb-2 text-gray-200" dangerouslySetInnerHTML={{ __html: processedLine }}></p>;
  };

  const lines = content.split('\n');
  let inList = false;

  return (
    <div>
      {lines.map((line, index) => {
        const isListItem = line.startsWith('- ') || line.startsWith('* ');

        if (isListItem && !inList) {
          inList = true;
          return (
            <ul key={`list-start-${index}`} className="mb-2">
              {renderLine(line, index)}
            </ul>
          );
        } else if (!isListItem && inList) {
          inList = false;
          return (
            <React.Fragment key={`list-end-${index}`}>
              {renderLine(line, index)}
            </React.Fragment>
          );
        } else {
          return renderLine(line, index);
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;
