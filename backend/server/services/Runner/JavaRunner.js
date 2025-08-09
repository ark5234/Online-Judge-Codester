const BaseRunner = require('./BaseRunner');

class JavaRunner extends BaseRunner {
  constructor() {
    super();
    this.language = 'java';
  }

  extractClassName(code) {
    const match = code.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : 'Main';
  }

  async execute(code, input = '') {
    // If our harness defines `public class Main`, we must compile a file named Main.java
    // Otherwise Java will fail with: "class Main is public, should be declared in a file named Main.java"
    const forceMain = /public\s+class\s+Main\b/.test(code);
    const className = forceMain ? 'Main' : this.extractClassName(code);
    const path = require('path');
    const fs = require('fs');
    const javaFile = forceMain
      ? path.join(this.tempDir, `${className}.java`)
      : this.createTempFile(code, '.java');
    if (forceMain) {
      fs.writeFileSync(javaFile, code);
    }
    const classFile = path.join(this.tempDir, `${className}.class`);
    
    try {
      // Compile Java code
      console.log('☕ Compiling Java code...');
  const compileResult = await this.executeWithTimeout('javac', [javaFile]);

      if (compileResult.code !== 0) {
        return {
          success: false,
          output: '',
          error: `Compilation Error:\n${compileResult.stderr}`,
          executionTime: 0
        };
      }

      // Execute Java class
      console.log('⚡ Executing Java class...');
      const startTime = Date.now();
      const executeResult = await this.executeWithTimeout('java', [
        '-cp', this.tempDir,
        className
      ], input);
      const executionTime = Date.now() - startTime;

      const success = executeResult.code === 0;
      
      return {
        success,
        output: executeResult.stdout,
        error: executeResult.stderr,
        executionTime
      };

    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Runtime Error: ${error.message}`,
        executionTime: 0
      };
    } finally {
      // Cleanup files
  // Best-effort cleanup (java may produce multiple .class files)
  try { this.cleanup([javaFile, classFile]); } catch (_) {}
    }
  }
}

module.exports = JavaRunner;
