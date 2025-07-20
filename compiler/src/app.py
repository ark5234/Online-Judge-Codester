from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import tempfile
import os
import shutil
import docker

app = FastAPI()
client = docker.from_env()

LANG_CONFIG = {
    'cpp': {
        'image': 'ojcodester-cpp',
        'file': 'Main.cpp',
        'cmd': 'g++ Main.cpp -o Main && timeout 2s ./Main < input.txt > output.txt'
    },
    'java': {
        'image': 'ojcodester-java',
        'file': 'Main.java',
        'cmd': 'javac Main.java && timeout 2s java Main < input.txt > output.txt'
    },
    'python': {
        'image': 'ojcodester-python',
        'file': 'Main.py',
        'cmd': 'timeout 2s python3 Main.py < input.txt > output.txt'
    },
    'js': {
        'image': 'ojcodester-nodejs',
        'file': 'Main.js',
        'cmd': 'timeout 2s node Main.js < input.txt > output.txt'
    }
}

class TestCase(BaseModel):
    input: str
    expectedOutput: str
    isSample: Optional[bool] = False

class EvaluateRequest(BaseModel):
    code: str
    language: str
    testCases: List[TestCase]
    submissionId: str
    userId: str
    problemId: str

@app.post('/evaluate')
async def evaluate(req: EvaluateRequest):
    lang = req.language.lower()
    if lang not in LANG_CONFIG:
        return {'verdict': 'CE', 'stdout': '', 'stderr': 'Unsupported language'}
    config = LANG_CONFIG[lang]
    verdict = 'AC'
    all_stdout = []
    all_stderr = []
    try:
        for idx, tc in enumerate(req.testCases):
            with tempfile.TemporaryDirectory() as tmpdir:
                code_path = os.path.join(tmpdir, config['file'])
                input_path = os.path.join(tmpdir, 'input.txt')
                with open(code_path, 'w', encoding='utf-8') as f:
                    f.write(req.code)
                with open(input_path, 'w', encoding='utf-8') as f:
                    f.write(tc.input)
                # Mount temp dir to /app in container
                try:
                    container = client.containers.run(
                        config['image'],
                        command=['bash', '-c', config['cmd']],
                        working_dir='/app',
                        volumes={tmpdir: {'bind': '/app', 'mode': 'rw'}},
                        network_disabled=True,
                        mem_limit='256m',
                        cpu_period=100000,
                        cpu_quota=50000,  # 0.5 CPU
                        detach=True,
                        remove=True,
                        stdout=True,
                        stderr=True,
                        user=1000  # non-root
                    )
                    exit_code = container.wait(timeout=5)['StatusCode']
                    stdout = container.logs(stdout=True, stderr=False).decode(errors='ignore')
                    stderr = container.logs(stdout=False, stderr=True).decode(errors='ignore')
                except Exception as e:
                    verdict = 'CE'
                    all_stderr.append(str(e))
                    break
                # Read output
                output_path = os.path.join(tmpdir, 'output.txt')
                if os.path.exists(output_path):
                    with open(output_path, 'r', encoding='utf-8') as f:
                        output = f.read().strip()
                else:
                    output = ''
                # Compare output
                if exit_code != 0:
                    verdict = 'RE'
                    all_stderr.append(stderr)
                    break
                elif output != tc.expectedOutput.strip():
                    verdict = 'WA'
                    all_stdout.append(output)
                    break
                else:
                    all_stdout.append(output)
        return {
            'verdict': verdict,
            'stdout': '\n'.join(all_stdout),
            'stderr': '\n'.join(all_stderr)
        }
    except Exception as e:
        return {'verdict': 'RE', 'stdout': '', 'stderr': str(e)} 