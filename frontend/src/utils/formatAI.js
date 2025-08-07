// Simple markdown to HTML converter for AI responses
export const formatAIResponse = (text) => {
  if (!text) return { html: '', codeBlocks: [] };
  
  let html = text;
  const codeBlocks = [];
  
  // Extract and replace code blocks with placeholders
  html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
    const language = lang || 'text';
    const blockIndex = codeBlocks.length;
    codeBlocks.push({
      language,
      code: code.trim()
    });
    
    return `<div class="my-4 relative">
      <div class="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-mono text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 rounded-t-md flex justify-between items-center">
        <span>${language}</span>
        <button class="copy-code-btn text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" data-block-index="${blockIndex}" title="Copy code">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        </button>
      </div>
      <pre class="bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto rounded-b-md border border-gray-200 dark:border-gray-700"><code class="text-sm font-mono text-gray-900 dark:text-gray-100">${escapeHtml(code.trim())}</code></pre>
    </div>`;
  });
  
  // Handle inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">$1</code>');
  
  // Handle bold text (**text**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>');
  
  // Handle italic text (*text*)
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
  
  // Handle numbered lists (1. item)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-2 list-decimal list-inside text-gray-700 dark:text-gray-300">$1</li>');
  
  // Handle bullet points (• item or - item)
  html = html.replace(/^[•-]\s+(.+)$/gm, '<li class="ml-4 mb-2 list-disc list-inside text-gray-700 dark:text-gray-300">$1</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, '<ul class="my-3 space-y-1">$&</ul>');
  
  // Handle headers (### Header)
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">$1</h1>');
  
  // Handle line breaks
  html = html.replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 dark:text-gray-300">');
  html = html.replace(/\n/g, '<br />');
  
  // Wrap in paragraphs
  html = `<p class="mb-4 text-gray-700 dark:text-gray-300">${html}</p>`;
  
  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*><\/p>/g, '');
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  
  return { html, codeBlocks };
};

// Escape HTML characters
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Copy code to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

// Extract code blocks from AI response
export const extractCodeBlocks = (text) => {
  const codeBlocks = [];
  const regex = /```(\w+)?\n([\s\S]*?)\n```/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return codeBlocks;
};
