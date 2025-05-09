from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory
from load_testing_sim.settings import StandSettings, RequestSettings
from uuid import uuid4
import subprocess
import os
import json
import logging

app = Flask(__name__)

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)

# Путь для хранения состояния симуляций
SIMULATIONS_FILE = 'simulations.json'

# Загрузка или инициализация симуляций
def load_simulations():
    try:
        if os.path.exists(SIMULATIONS_FILE):
            with open(SIMULATIONS_FILE, 'r') as f:
                data = json.load(f)
                app.logger.debug(f"Loaded simulations: {data}")
                return data
        app.logger.debug("No simulations file found, initializing empty")
        return {}
    except Exception as e:
        app.logger.error(f"Error loading simulations: {str(e)}")
        return {}

# Сохранение симуляций
def save_simulations(simulations):
    try:
        with open(SIMULATIONS_FILE, 'w') as f:
            json.dump(simulations, f)
        app.logger.debug(f"Saved simulations: {simulations}")
    except Exception as e:
        app.logger.error(f"Error saving simulations: {str(e)}")

simulations = load_simulations()

@app.route('/', methods=['GET'])
def index():
    app.logger.debug("Rendering index.html")
    return render_template('index.html')

@app.route('/result', methods=['GET'])
def result():
    stand_settings = request.args.get('stand_settings')
    request_settings = request.args.get('request_settings')
    dir_name = request.args.get('dir_name')
    
    app.logger.debug(f"Rendering result.html with stand_settings: {stand_settings}, "
                    f"request_settings: {request_settings}, dir_name: {dir_name}")
    
    return render_template('result.html',
                         stand_settings=json.loads(stand_settings) if stand_settings else None,
                         request_settings=json.loads(request_settings) if request_settings else None,
                         dir_name=dir_name)

@app.route('/', methods=['POST'])
def settings():
    data = request.get_json()
    app.logger.debug(f"Received settings: {data}")
    try:
        stand_settings = StandSettings.from_dict(data['stand_settings'])
        request_settings = RequestSettings.from_dict(data['request_settings'])
        dir_name = f'simulations/{uuid4()}'
        os.makedirs(dir_name, exist_ok=True)
        
        # Сохраняем настройки в файл
        settings_file = f"{dir_name}/settings.json"
        with open(settings_file, 'w') as f:
            json.dump(data, f)
        
        # Создаем временный скрипт для симуляции
        run_script = """
from load_testing_sim.stand import main
from load_testing_sim.settings import StandSettings, RequestSettings
import json
import sys

if __name__ == '__main__':
    settings_file = sys.argv[1]
    dir_name = sys.argv[2]
    with open(settings_file, 'r') as f:
        data = json.load(f)
    main(StandSettings.from_dict(data['stand_settings']),
         RequestSettings.from_dict(data['request_settings']),
         dir_name)
"""
        with open(f"{dir_name}/run_sim.py", 'w') as f:
            f.write(run_script)
        
        # Запускаем симуляцию в отдельном процессе
        log_file = f"{dir_name}/run.log"
        process = subprocess.Popen(
            ['python3', f"{dir_name}/run_sim.py", settings_file, dir_name],
            stdout=open(log_file, 'w'),
            stderr=subprocess.STDOUT,
            text=True
        )
        
        simulations[dir_name] = {'pid': process.pid, 'process': process, 'status': 'running'}
        save_simulations(simulations)
        app.logger.debug(f"Started simulation in {dir_name} with PID {process.pid}, logging to {log_file}")
        
        return redirect(url_for('result',
                              stand_settings=json.dumps(stand_settings.to_dict()),
                              request_settings=json.dumps(request_settings.to_dict()),
                              dir_name=dir_name))
    except Exception as e:
        app.logger.error(f"Error processing settings: {str(e)}")
        return jsonify({"status": "error", "message": f"Invalid settings: {str(e)}"}), 400

@app.route('/status/<path:dir_name>', methods=['GET'])
def check_status(dir_name):
    app.logger.debug(f"Checking status for {dir_name}")
    if dir_name not in simulations:
        app.logger.warning(f"Simulation {dir_name} not found in {simulations}")
        return jsonify({"status": "not_found"})
    
    sim = simulations[dir_name]
    process = sim['process']
    return_code = process.poll()
    
    app.logger.debug(f"Process status for {dir_name}, PID {sim['pid']}, return_code: {return_code}")
    
    if return_code is None:
        log_file = f"{dir_name}/run.log"
        logs = "Simulation running..."
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                logs = f.read()
        app.logger.debug(f"Simulation {dir_name} running, logs: {logs[:100]}...")
        return jsonify({"status": "running", "logs": logs})
    else:
        app.logger.debug(f"Simulation {dir_name} process completed with return_code {return_code}, attempting to run Gatling")
        gatling_path = os.path.abspath("../simulations/gatling-charts-highcharts-bundle-3.1.2/bin/gatling.sh")
        simulation_dir = os.path.abspath(dir_name)
        app.logger.debug(f"Using Gatling path: {gatling_path}, simulation directory: {simulation_dir}")
        
        if not os.path.exists(simulation_dir):
            app.logger.error(f"Simulation directory {simulation_dir} does not exist")
            return jsonify({"status": "error", "message": f"Simulation directory {simulation_dir} does not exist"})
        if not os.path.exists(gatling_path):
            app.logger.error(f"Gatling script not found at {gatling_path}")
            return jsonify({"status": "error", "message": f"Gatling script not found at {gatling_path}"})
        if not os.access(gatling_path, os.X_OK):
            app.logger.error(f"Gatling script at {gatling_path} is not executable")
            return jsonify({"status": "error", "message": f"Gatling script at {gatling_path} is not executable"})
        
        try:
            result = subprocess.run([gatling_path, "-ro", simulation_dir], capture_output=True, text=True, check=True)
            app.logger.debug(f"Gatling executed for {dir_name}, stdout: {result.stdout}, stderr: {result.stderr}")
            result_url = f"{dir_name}/index.html"
            result_path = os.path.abspath(result_url)
            if not os.path.exists(result_path):
                app.logger.error(f"Result file {result_path} not found after Gatling execution")
                return jsonify({"status": "error", "message": f"Result file {result_path} not found"})
            app.logger.debug(f"Returning result_url: {result_url}")
            sim['status'] = 'completed'
            save_simulations(simulations)
            app.logger.debug(f"Simulation {dir_name} completed, Gatling executed")
            return jsonify({"status": "completed", "result_url": result_url})
        except subprocess.CalledProcessError as e:
            app.logger.error(f"Error running Gatling for {dir_name}: {str(e)}, stdout: {e.stdout}, stderr: {e.stderr}")
            return jsonify({"status": "error", "message": f"Error running Gatling: {str(e)}, stdout: {e.stdout}, stderr: {e.stderr}"})

@app.route('/simulations/<path:path>')
def serve_simulation_files(path):
    simulation_dir = os.path.abspath('simulations')
    app.logger.debug(f"Serving file from {simulation_dir} for path: {path}")
    return send_from_directory(simulation_dir, path)

if __name__ == '__main__':
    app.run(debug=True)