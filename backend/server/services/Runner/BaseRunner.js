const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class BaseRunner {
  constructor() {
    this.timeout = 10000; // 10 seconds
    this.tempDir = path.join(os.tmpdir(), 'codester-exec');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  createTempFile(code, extension) {
    const fileName = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
    const filePath = path.join(this.tempDir, fileName);
    fs.writeFileSync(filePath, code);
    return filePath;
  }

  cleanup(filePaths) {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${filePath}:`, error.message);
      }
    });
  }

  async executeWithTimeout(command, args, input = '', cwd = null) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd: cwd || this.tempDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let isResolved = false;

      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          process.kill('SIGKILL');
          reject(new Error('Execution timeout'));
        }
      }, this.timeout);

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          resolve({
            code,
            stdout: stdout.trim(),
            stderr: stderr.trim()
          });
        }
      });

      process.on('error', (error) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          reject(error);
        }
      });

      // Send input if provided
      if (input) {
        process.stdin.write(input);
      }
      process.stdin.end();
    });
  }
}

module.exports = BaseRunner;
