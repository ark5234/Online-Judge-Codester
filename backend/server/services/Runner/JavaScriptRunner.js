const BaseRunner = require('./BaseRunner');

class JavaScriptRunner extends BaseRunner {
  constructor() {
    super();
    this.language = 'javascript';
  }

  async execute(code, input = '') {
    const jsFile = this.createTempFile(code, '.js');
    
    try {
      // Execute JavaScript code with Node.js
      console.log('🔗 Executing JavaScript code...');
      const startTime = Date.now();
      const executeResult = await this.executeWithTimeout('node', [jsFile], input);
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
      this.cleanup([jsFile]);
    }
  }
}

module.exports = JavaScriptRunner;
