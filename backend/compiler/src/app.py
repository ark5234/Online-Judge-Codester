from fastapi import FastAPI, Request
import docker
import tempfile
import os

app = FastAPI()
client = docker.from_env()

LANG_CONFIG = {
    "python": {
        "image": "python:3.11-slim",
        "file": "main.py",
        "run": "python main.py"
    },
    "cpp": {
        "image": "gcc:13.1.0",
        "file": "main.cpp",
        "run": "sh -c 'g++ main.cpp -o main && ./main'"
    },
    "java": {
        "image": "openjdk:21",
        "file": "Main.java",
        "run": "sh -c 'javac Main.java && java Main'"
    },
    "js": {
        "image": "node:20",
        "file": "main.js",
        "run": "node main.js"
    }
}

@app.post("/evaluate")
async def evaluate_code(request: Request):
    data = await request.json()
    code = data['code']
    language = data['language']
    input_data = data.get('input', '')
    config = LANG_CONFIG[language]
    with tempfile.TemporaryDirectory() as tmpdir:
        code_path = os.path.join(tmpdir, config['file'])
        with open(code_path, 'w') as f:
            f.write(code)
        try:
            container = client.containers.run(
                config['image'],
                config['run'],
                volumes={tmpdir: {'bind': '/app', 'mode': 'ro'}},
                working_dir='/app',
                network_disabled=True,
                mem_limit='128m',
                cpu_period=100000,
                cpu_quota=50000,
                stdin_open=True,
                detach=True
            )
            if input_data:
                container.exec_run(f"echo '{input_data}' | {config['run']}")
            result = container.logs(stdout=True, stderr=True, stream=False)
            verdict = "AC"  # Simplified: compare output in real impl
            container.remove(force=True)
            return {"verdict": verdict, "stdout": result.decode(), "stderr": ""}
        except Exception as e:
            return {"verdict": "RE", "stdout": "", "stderr": str(e)} 