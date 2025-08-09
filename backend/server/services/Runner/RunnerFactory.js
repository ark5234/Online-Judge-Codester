const CppRunner = require('./CppRunner');
const JavaRunner = require('./JavaRunner');
const PythonRunner = require('./PythonRunner');
const JavaScriptRunner = require('./JavaScriptRunner');

class RunnerFactory {
  static createRunner(language) {
    const normalizedLanguage = language.toLowerCase();
    
    switch (normalizedLanguage) {
      case 'cpp':
      case 'c++':
        return new CppRunner();
        
      case 'java':
        return new JavaRunner();
        
      case 'python':
      case 'python3':
        return new PythonRunner();
        
      case 'javascript':
      case 'js':
        return new JavaScriptRunner();
        
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  static getSupportedLanguages() {
    return ['cpp', 'java', 'python', 'javascript'];
  }

  static isLanguageSupported(language) {
    const normalizedLanguage = language.toLowerCase();
    const supported = ['cpp', 'c++', 'java', 'python', 'python3', 'javascript', 'js'];
    return supported.includes(normalizedLanguage);
  }
}

module.exports = RunnerFactory;
