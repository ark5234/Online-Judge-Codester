#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import tempfile
import time
import signal
from flask import Flask, request, jsonify
from flask_cors import CORS
import psutil

app = Flask(__name__)
CORS(app)

class CodeExecutor:
    def __init__(self):
        self.timeout = 10  # seconds
        self.memory_limit = 512  # MB
        
    def create_temp_file(self, code, language):
        """Create a temporary file with the code"""
        ext_map = {
            'python': '.py',
            'javascript': '.js',
            'java': '.java',
            'cpp': '.cpp',
            'c': '.c'
        }
        
        ext = ext_map.get(language, '.txt')
        fd, path = tempfile.mkstemp(suffix=ext, dir='/app/temp')
        
        with os.fdopen(fd, 'w') as f:
            f.write(code)
        
        return path
    
    def execute_python(self, code, input_data=""):
        """Execute Python code"""
        try:
            file_path = self.create_temp_file(code, 'python')
            
            # Run with timeout
            process = subprocess.Popen(
                ['python3', file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            try:
                stdout, stderr = process.communicate(input=input_data, timeout=self.timeout)
                return {
                    'success': True,
                    'output': stdout,
                    'error': stderr,
                    'execution_time': 0
                }
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                return {
                    'success': False,
                    'output': '',
                    'error': 'Execution timeout',
                    'execution_time': self.timeout
                }
            finally:
                os.unlink(file_path)
                
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'execution_time': 0
            }
    
    def execute_javascript(self, code, input_data=""):
        """Execute JavaScript code"""
        try:
            file_path = self.create_temp_file(code, 'javascript')
            
            process = subprocess.Popen(
                ['node', file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            try:
                stdout, stderr = process.communicate(input=input_data, timeout=self.timeout)
                return {
                    'success': True,
                    'output': stdout,
                    'error': stderr,
                    'execution_time': 0
                }
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                return {
                    'success': False,
                    'output': '',
                    'error': 'Execution timeout',
                    'execution_time': self.timeout
                }
            finally:
                os.unlink(file_path)
                
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'execution_time': 0
            }
    
    def execute_java(self, code, input_data=""):
        """Execute Java code"""
        try:
            # Extract class name from code
            lines = code.split('\n')
            class_name = None
            for line in lines:
                if 'public class' in line:
                    class_name = line.split('public class')[1].split()[0].strip()
                    break
            
            if not class_name:
                return {
                    'success': False,
                    'output': '',
                    'error': 'No public class found',
                    'execution_time': 0
                }
            
            file_path = self.create_temp_file(code, 'java')
            class_path = file_path.replace('.java', '')
            
            # Compile
            compile_process = subprocess.run(
                ['javac', file_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if compile_process.returncode != 0:
                return {
                    'success': False,
                    'output': '',
                    'error': compile_process.stderr,
                    'execution_time': 0
                }
            
            # Execute
            process = subprocess.Popen(
                ['java', '-cp', os.path.dirname(class_path), class_name],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            try:
                stdout, stderr = process.communicate(input=input_data, timeout=self.timeout)
                return {
                    'success': True,
                    'output': stdout,
                    'error': stderr,
                    'execution_time': 0
                }
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                return {
                    'success': False,
                    'output': '',
                    'error': 'Execution timeout',
                    'execution_time': self.timeout
                }
            finally:
                # Clean up
                try:
                    os.unlink(file_path)
                    os.unlink(class_path + '.class')
                except:
                    pass
                    
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'execution_time': 0
            }
    
    def execute_cpp(self, code, input_data=""):
        """Execute C++ code"""
        try:
            file_path = self.create_temp_file(code, 'cpp')
            executable_path = file_path + '.out'
            
            # Compile
            compile_process = subprocess.run(
                ['g++', '-o', executable_path, file_path],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if compile_process.returncode != 0:
                return {
                    'success': False,
                    'output': '',
                    'error': compile_process.stderr,
                    'execution_time': 0
                }
            
            # Execute
            process = subprocess.Popen(
                [executable_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid
            )
            
            try:
                stdout, stderr = process.communicate(input=input_data, timeout=self.timeout)
                return {
                    'success': True,
                    'output': stdout,
                    'error': stderr,
                    'execution_time': 0
                }
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                return {
                    'success': False,
                    'output': '',
                    'error': 'Execution timeout',
                    'execution_time': self.timeout
                }
            finally:
                # Clean up
                try:
                    os.unlink(file_path)
                    os.unlink(executable_path)
                except:
                    pass
                    
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'execution_time': 0
            }

executor = CodeExecutor()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'service': 'Code Compiler',
        'timestamp': time.time()
    })

@app.route('/execute', methods=['POST'])
def execute_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        input_data = data.get('input', '')
        
        if not code:
            return jsonify({
                'success': False,
                'error': 'No code provided'
            }), 400
        
        # Execute based on language
        if language == 'python':
            result = executor.execute_python(code, input_data)
        elif language == 'javascript':
            result = executor.execute_javascript(code, input_data)
        elif language == 'java':
            result = executor.execute_java(code, input_data)
        elif language == 'cpp':
            result = executor.execute_cpp(code, input_data)
        else:
            return jsonify({
                'success': False,
                'error': f'Unsupported language: {language}'
            }), 400
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Code Compiler Service starting...")
    print("📊 Health check: http://localhost:8000/health")
    print("⚡ Execute code: http://localhost:8000/execute")
    app.run(host='0.0.0.0', port=8000, debug=False) 