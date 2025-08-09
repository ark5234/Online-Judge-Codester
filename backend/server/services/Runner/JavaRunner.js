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
    const className = this.extractClassName(code);
    const javaFile = this.createTempFile(code, '.java');
    const classFile = javaFile.replace('.java', '.class');
    
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
      this.cleanup([javaFile, classFile]);
    }
  }
}

module.exports = JavaRunner;
