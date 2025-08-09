const BaseRunner = require('./BaseRunner');

class PythonRunner extends BaseRunner {
  constructor() {
    super();
    this.language = 'python';
  }

  async execute(code, input = '') {
    const pythonFile = this.createTempFile(code, '.py');
    
    try {
      // Execute Python code directly
      console.log('🐍 Executing Python code...');
      const startTime = Date.now();
      let executeResult;
      try {
        executeResult = await this.executeWithTimeout('python', [pythonFile], input);
      } catch (err) {
        // If 'python' is missing, try 'python3' as a fallback
        if (/ENOENT/i.test(err.message)) {
          try {
            executeResult = await this.executeWithTimeout('python3', [pythonFile], input);
          } catch (err2) {
            throw err; // propagate original ENOENT so outer layers can trigger remote fallback
          }
        } else {
          throw err;
        }
      }
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
      this.cleanup([pythonFile]);
    }
  }
}

module.exports = PythonRunner;
