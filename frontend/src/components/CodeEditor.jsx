import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ 
  code, 
  setCode, 
  language = "python", 
  height = "400px",
  theme = "myCustomTheme",
  readOnly = false 
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Monaco language mapping
  const monacoLanguageMap = {
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
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Define custom theme with better contrast
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
      }
    });
    
    // Set the theme
    monaco.editor.setTheme('myCustomTheme');
    
    // Configure Python language with enhanced features
    monaco.languages.setLanguageConfiguration('python', {
      indentationRules: {
        decreaseIndentPattern: /^\s*(pass|return|raise|break|continue|else|elif|except|finally)\b/,
        increaseIndentPattern: /^.*:\s*$/,
      },
      wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
      comments: {
        lineComment: '#',
        blockComment: ['"""', '"""']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    });

    // Enhanced Python auto-indentation with smart dedent
    monaco.languages.registerOnTypeFormattingEditProvider('python', {
      autoFormatTriggerCharacters: ['\n'],
      provideOnTypeFormattingEdits(model, position) {
        try {
          const lineContent = model.getLineContent(position.lineNumber - 1).trim();
          const shouldIndent = lineContent.endsWith(':');
          const shouldDedent = /^(return|break|continue|pass|raise|else|elif|except|finally)\b/.test(lineContent);
          
          let indent = '    '; // Default 4 spaces
          
          if (shouldDedent) {
            // Decrease indentation for control flow keywords
            indent = '';
          } else if (shouldIndent) {
            // Increase indentation after colon
            indent = '        '; // 8 spaces
          } else {
            // Maintain current indentation level
            const prevLine = position.lineNumber > 1 ? model.getLineContent(position.lineNumber - 1) : '';
            const prevIndent = prevLine.match(/^\s*/)?.[0] || '';
            if (prevIndent && !lineContent.match(/^\s*(else|elif|except|finally)\b/)) {
              indent = prevIndent;
            }
          }
          
          return [{
            range: {
              startLineNumber: position.lineNumber,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: 1
            },
            text: indent
          }];
        } catch (error) {
          console.warn('Auto-formatting error:', error);
          return [];
        }
      }
    });

    // Add Python-specific completions
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print a value to the console'
          },
          {
            label: 'def',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'def ${1:function_name}(${2:parameters}):\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a new function'
          },
          {
            label: 'if',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'If statement'
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For loop'
          },
          {
            label: 'while',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'while ${1:condition}:\n\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'While loop'
          },
          {
            label: 'try',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Try-except block'
          },
          {
            label: 'class',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${2:pass}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a new class'
          },
          {
            label: 'import',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'import ${1:module}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Import a module'
          },
          {
            label: 'from',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'from ${1:module} import ${2:item}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Import specific item from module'
          },
          {
            label: 'list',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'list(${1:iterable})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a list'
          },
          {
            label: 'dict',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'dict(${1:key_value_pairs})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a dictionary'
          },
          {
            label: 'set',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'set(${1:iterable})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a set'
          },
          {
            label: 'range',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'range(${1:start}, ${2:stop}, ${3:step})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a range object'
          },
          {
            label: 'len',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'len(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get the length of an object'
          },
          {
            label: 'str',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'str(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convert object to string'
          },
          {
            label: 'int',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'int(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convert object to integer'
          },
          {
            label: 'float',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'float(${1:object})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Convert object to float'
          }
        ];
        return { suggestions };
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.trigger('keyboard', 'editor.action.formatDocument', {});
    }, 'editor.action.formatDocument');

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save functionality can be handled by parent component
    }, 'editor.action.save');

    // Focus the editor
    editor.focus();
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  return (
    <Editor
      height={height}
      defaultLanguage={monacoLanguageMap[language]}
      value={code}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      theme={theme}
      readOnly={readOnly}
      options={{
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
        fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
        fontLigatures: true,
        
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
          comments: true,
          strings: true
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
          horizontalHasLess: false,
          horizontalScrollbarSize: 10,
          horizontalSliderSize: 9,
          scrollByPage: false,
          useShadows: true,
          vertical: "auto",
          verticalHasLess: false,
          verticalScrollbarSize: 10,
          verticalSliderSize: 7
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
          automaticallyShowFirstSuggestion: false,
          filterGraceful: true,
          hideStatusBar: false,
          insertMode: "insert",
          localityBonus: false,
          maxVisibleSuggestions: 12,
          selectionMode: "whenQuickSuggestion",
          showClasses: true,
          showColors: true,
          showConstants: true,
          showConstructors: true,
          showDeprecated: true,
          showEnums: true,
          showEnumsMembers: true,
          showEvents: true,
          showFields: true,
          showFiles: true,
          showFolders: true,
          showFunctions: true,
          showIcons: true,
          showInterfaces: true,
          showIssues: true,
          showKeywords: true,
          showMethods: true,
          showModules: true,
          showNamespaces: true,
          showOperators: true,
          showProperties: true,
          showReferences: true,
          showSnippets: true,
          showStructs: true,
          showTypeParameters: true,
          showUnits: true,
          showUsers: true,
          showValues: true,
          showVariables: true,
          showWords: true,
          snippetsPreventQuickSuggestions: true,
          suggestOnTriggerCharacters: true,
          tabCompletion: "off",
          wordBasedSuggestions: "off"
        },
        
        // Word wrap settings
        wordWrapColumn: 80,
        wordWrapBreakAfterCharacters: " \t})]?|&,;",
        wordWrapBreakBeforeCharacters: "{([+",
        wordWrapMinified: true,
        wrappingIndent: "none",
        wrappingStrategy: "simple",
        
        // Unicode and special characters
        unicodeHighlight: {
          ambiguousCharacters: true,
          invisibleCharacters: false,
          nonBasicASCII: false
        },
        unusualLineTerminators: "prompt",
        
        // Word separators
        wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
        wordBasedSuggestions: "off"
      }}
    />
  );
};

export default CodeEditor; 