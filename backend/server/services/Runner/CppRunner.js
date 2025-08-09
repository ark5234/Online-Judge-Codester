const BaseRunner = require('./BaseRunner');

class CppRunner extends BaseRunner {
  constructor() {
    super();
    this.language = 'cpp';
  }

  async execute(code, input = '') {
    const cppFile = this.createTempFile(code, '.cpp');
    const exeFile = cppFile.replace('.cpp', '.exe');
    
    try {
      // Compile C++ code
      console.log('🔧 Compiling C++ code...');
      const compileResult = await this.executeWithTimeout('g++', [
        '-o', exeFile,
        cppFile,
        '-std=c++17',
        '-O2'
      ]);

      if (compileResult.code !== 0) {
        return {
          success: false,
          output: '',
          error: `Compilation Error:\n${compileResult.stderr}`,
          executionTime: 0
        };
      }

      // Execute compiled binary
      console.log('⚡ Executing C++ binary...');
      const startTime = Date.now();
      const executeResult = await this.executeWithTimeout(exeFile, [], input);
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
      this.cleanup([cppFile, exeFile]);
    }
  }
}

module.exports = CppRunner;
