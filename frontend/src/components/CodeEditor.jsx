import React, { useRef, useEffect, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import PropTypes from "prop-types";

/**
 * Production-ready Monaco Code Editor Component
 * Features: Performance optimization, error handling, accessibility, memory management
 */
const CodeEditor = ({ 
  code, 
  setCode, 
  language = "python", 
  height = "400px",
  theme = "myCustomTheme",
  readOnly = false,
  onEditorMount,
  onEditorError,
  loading = "Loading editor...",
  options = {},
  onCodeChange,
  debounceMs = 300
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isDisposed = useRef(false);
  const debounceTimer = useRef(null);

  // Monaco language mapping with validation
  const monacoLanguageMap = useMemo(() => ({
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'csharp',
    php: 'php',
    ruby: 'ruby',
    go: 'go',
    rust: 'rust',
  }), []);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      isDisposed.current = true;
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (editorRef.current && !editorRef.current.isDisposed()) {
        try {
          editorRef.current.dispose();
        } catch (error) {
          console.warn('Editor disposal error:', error);
        }
      }
    };
  }, []);

  // Debounced code change handler
  const debouncedCodeChange = useCallback((value) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (!isDisposed.current && onCodeChange) {
        onCodeChange(value);
      }
    }, debounceMs);
  }, [onCodeChange, debounceMs]);

  // Memoized editor change handler to prevent unnecessary re-renders
  const handleEditorChange = useCallback((value) => {
    if (!isDisposed.current && setCode) {
      setCode(value || "");
      debouncedCodeChange(value || "");
    }
  }, [setCode, debouncedCodeChange]);

  // Error boundary for editor initialization
  const handleEditorError = useCallback((error) => {
    console.error('Monaco Editor Error:', error);
    if (onEditorError) {
      onEditorError(error);
    }
  }, [onEditorError]);

  // Language-specific configurations
  const getLanguageConfig = useCallback((lang, monaco) => {
    const configs = {
      python: {
        indentationRules: {
          decreaseIndentPattern: /^\s*(pass|return|raise|break|continue|else|elif|except|finally)\b/,
          increaseIndentPattern: /^.*:\s*$/,
        },
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
        completions: [
          { label: 'print', insertText: 'print(${1:value})', kind: monaco.languages.CompletionItemKind.Function },
          { label: 'def', insertText: 'def ${1:function_name}(${2:parameters}):\n\t${3:pass}', kind: monaco.languages.CompletionItemKind.Snippet },
          { label: 'if', insertText: 'if ${1:condition}:\n\t${2:pass}', kind: monaco.languages.CompletionItemKind.Snippet },
          { label: 'for', insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}', kind: monaco.languages.CompletionItemKind.Snippet },
          { label: 'while', insertText: 'while ${1:condition}:\n\t${2:pass}', kind: monaco.languages.CompletionItemKind.Snippet },
          { label: 'try', insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}', kind: monaco.languages.CompletionItemKind.Snippet },
          { label: 'class', insertText: 'class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${2:pass}', kind: monaco.languages.CompletionItemKind.Snippet }
        ]
      },
      javascript: {
        completions: [
          { label: 'console.log', insertText: 'console.log(${1:value})', kind: monaco.languages.CompletionItemKind.Function },
          { label: 'function', insertText: 'function ${1:name}(${2:parameters}) {\n\t${3:// code}\n}', kind: monaco.languages.CompletionItemKind.Snippet },
          { label: 'if', insertText: 'if (${1:condition}) {\n\t${2:// code}\n}', kind: monaco.languages.CompletionItemKind.Snippet },
          { label: 'for', insertText: 'for (${1:let i = 0}; ${2:i < length}; ${3:i++}) {\n\t${4:// code}\n}', kind: monaco.languages.CompletionItemKind.Snippet }
        ]
      }
    };
    return configs[lang] || { completions: [] };
  }, []);

  // Enhanced editor mount handler with error handling
  const handleEditorDidMount = useCallback((editor, monaco) => {
    if (isDisposed.current) return;
    
    try {
      editorRef.current = editor;
      monacoRef.current = monaco;
      
      // Define custom theme with better contrast and accessibility
      monaco.editor.defineTheme('myCustomTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '7f848e', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'c678dd' },
          { token: 'string', foreground: '98c379' },
          { token: 'number', foreground: 'd19a66' },
          { token: 'function', foreground: '61afef' },
          { token: 'variable', foreground: 'e06c75' },
          { token: 'type', foreground: 'e5c07b' },
          { token: 'class', foreground: 'e5c07b' },
          { token: 'operator', foreground: '56b6c2' },
          { token: 'delimiter', foreground: 'abb2bf' },
        ],
        colors: {
          'editor.background': '#1e1e2f',
          'editor.foreground': '#abb2bf',
          'editor.lineHighlightBackground': '#2c313c',
          'editor.selectionBackground': '#3e4451',
          'editor.inactiveSelectionBackground': '#3e4451',
          'editorCursor.foreground': '#528bff',
          'editorWhitespace.foreground': '#3b4048',
          'editorIndentGuide.background': '#3b4048',
          'editorIndentGuide.activeBackground': '#9d550fb0',
          'editor.selectionHighlightBorder': '#7f848e',
          // Accessibility improvements
          'editorError.foreground': '#f14c4c',
          'editorWarning.foreground': '#ffcc02',
          'editorInfo.foreground': '#75beff',
          'editorHint.foreground': '#eeeeff',
        }
      });
      
      // Set the theme
      monaco.editor.setTheme('myCustomTheme');
      
      // Configure language-specific features
      const langConfig = getLanguageConfig(language, monaco);
      
      if (langConfig.indentationRules && language === 'python') {
        monaco.languages.setLanguageConfiguration('python', {
          ...langConfig,
          comments: { lineComment: '#', blockComment: ['"""', '"""'] },
          brackets: [['(', ')'], ['[', ']'], ['{', '}']],
          autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
          ]
        });

        // Python auto-indentation
        monaco.languages.registerOnTypeFormattingEditProvider('python', {
          autoFormatTriggerCharacters: ['\n'],
          provideOnTypeFormattingEdits(model, position) {
            try {
              const lineContent = model.getLineContent(position.lineNumber - 1).trim();
              const shouldIndent = lineContent.endsWith(':');
              
              if (shouldIndent) {
                return [{
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: 1
                  },
                  text: '    '
                }];
              }
              return [];
            } catch (error) {
              console.warn('Auto-formatting error:', error);
              return [];
            }
          }
        });
      }

      // Add language-specific completions
      if (langConfig.completions.length > 0) {
        monaco.languages.registerCompletionItemProvider(monacoLanguageMap[language], {
          provideCompletionItems: () => {
            return {
              suggestions: langConfig.completions.map(comp => ({
                ...comp,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              }))
            };
          }
        });
      }

      // Add universal keyboard shortcuts
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
        try {
          editor.trigger('keyboard', 'editor.action.formatDocument', {});
        } catch (error) {
          console.warn('Format document error:', error);
        }
      });

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        // Save functionality handled by parent component
        if (onEditorMount) {
          onEditorMount(editor, monaco);
        }
      });

      // Add accessibility keyboard shortcuts
      editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.F1, () => {
        editor.trigger('keyboard', 'editor.action.showHover', {});
      });

      // Focus the editor for accessibility
      editor.focus();
      
      // Call parent's onMount callback
      if (onEditorMount) {
        onEditorMount(editor, monaco);
      }
    } catch (error) {
      handleEditorError(error);
    }
  }, [language, onEditorMount, handleEditorError, getLanguageConfig, monacoLanguageMap]);

  // Memoized editor options for performance
  const editorOptions = useMemo(() => ({
    // Basic editor settings
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: "on",
    
    // Font settings
    fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
    fontLigatures: true,
    fontWeight: "400",
    
    // Code folding
    folding: true,
    foldingStrategy: "indentation",
    showFoldingControls: "always",
    
    // Visual features
    renderLineHighlight: "all",
    selectOnLineNumbers: true,
    glyphMargin: true,
    bracketPairColorization: { enabled: true },
    
    // Indentation and formatting
    autoIndent: "full",
    formatOnPaste: true,
    formatOnType: true,
    detectIndentation: true,
    trimAutoWhitespace: true,
    useTabStops: false,
    
    // Auto-closing features
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    autoClosingOvertype: "always",
    autoClosingDelete: "always",
    
    // Guides and highlighting
    guides: {
      indentation: true,
      bracketPairs: true,
      bracketPairsHorizontal: true,
      highlightActiveIndentation: true,
      highlightActiveBracketPair: true
    },
    
    // Suggestions and completions
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    parameterHints: { enabled: true },
    hover: { enabled: true },
    
    // Context menu and accessibility
    contextmenu: true,
    accessibilitySupport: "auto",
    
    // Cursor and selection
    cursorBlinking: "blink",
    cursorSmoothCaretAnimation: "on",
    cursorStyle: "line",
    
    // Scrollbar
    scrollbar: {
      arrowSize: 11,
      horizontal: "auto",
      horizontalScrollbarSize: 10,
      useShadows: true,
      vertical: "auto",
      verticalScrollbarSize: 10,
    },
    
    // Advanced features
    inlineSuggest: {
      enabled: true,
      mode: "prefix",
      suppressSuggestions: false
    },
    
    // Suggest configuration
    suggest: {
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
      animations: true,
      filterGraceful: true,
      insertMode: "insert",
      maxVisibleSuggestions: 12,
      showClasses: true,
      showColors: true,
      showConstants: true,
      showConstructors: true,
      showFunctions: true,
      showKeywords: true,
      showMethods: true,
      showProperties: true,
      showSnippets: true,
      showVariables: true,
      tabCompletion: "off",
      wordBasedSuggestions: "off"
    },
    
    // Word wrap settings
    wordWrapColumn: 80,
    wordWrapBreakAfterCharacters: " \t})]?|&,;",
    wordWrapBreakBeforeCharacters: "{([+",
    
    // Unicode and special characters
    unicodeHighlight: {
      ambiguousCharacters: true,
      invisibleCharacters: false,
      nonBasicASCII: false
    },
    
    // Performance settings
    model: null,
    
    // Merge with custom options
    ...options
  }), [options]);

  // Handle loading state
  if (!code && code !== "") {
    return (
      <div 
        className="flex items-center justify-center bg-gray-900 text-white rounded-lg"
        style={{ height }}
        role="status"
        aria-label="Loading code editor"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">{loading}</span>
      </div>
    );
  }

  return (
    <div 
      className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
      role="region"
      aria-label={`Code editor for ${language}`}
    >
      <Editor
        height={height}
        defaultLanguage={monacoLanguageMap[language] || 'javascript'}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">{loading}</span>
          </div>
        }
        options={editorOptions}
        beforeMount={(monaco) => {
          // Pre-configure Monaco before mounting
          try {
            monaco.editor.setTheme('vs-dark');
          } catch (error) {
            console.warn('Monaco pre-mount error:', error);
          }
        }}
      />
    </div>
  );
};

// PropTypes for type checking and documentation
CodeEditor.propTypes = {
  code: PropTypes.string.isRequired,
  setCode: PropTypes.func.isRequired,
  language: PropTypes.oneOf(['python', 'javascript', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby', 'go', 'rust']),
  height: PropTypes.string,
  theme: PropTypes.string,
  readOnly: PropTypes.bool,
  onEditorMount: PropTypes.func,
  onEditorError: PropTypes.func,
  onCodeChange: PropTypes.func,
  loading: PropTypes.string,
  options: PropTypes.object,
  debounceMs: PropTypes.number
};

CodeEditor.defaultProps = {
  language: 'python',
  height: '400px',
  theme: 'myCustomTheme',
  readOnly: false,
  loading: 'Loading editor...',
  options: {},
  debounceMs: 300
};

export default React.memo(CodeEditor);
