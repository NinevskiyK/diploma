from flask import Flask, request, jsonify, render_template, redirect, url_for, send_from_directory
from load_testing_sim.settings import StandSettings, RequestSettings
from uuid import uuid4
import subprocess
import os
import json
import logging
from datetime import datetime

app = Flask(__name__)

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)

# Хранилище для запущенных процессов
processes = {}

@app.route('/', methods=['GET'])
def index():
    app.logger.debug("Rendering index.html")
    return render_template('index.html')

@app.route('/simulation', methods=['GET', 'POST'])
def simulation():
    if request.method == 'GET':
        app.logger.debug("Rendering simulation.html")
        return render_template('simulation.html')
    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data:
                app.logger.error("No settings provided")
                return jsonify({"status": "error", "message": "No settings provided"}), 400
            app.logger.debug(f"Received simulation settings: {json.dumps(data, indent=2)}")

            # Валидация настроек
            stand_settings = StandSettings.from_dict(data['stand_settings'])
            request_settings = RequestSettings.from_dict(data['request_settings'])

            # Создание уникальной директории
            unique_id = f"{datetime.now().strftime('%H:%M:%S_%Y-%m-%d')}_{uuid4()}"
            dir_name = f"simulations/{unique_id}"
            os.makedirs(dir_name, exist_ok=True)

            # Сохранение настроек
            settings_file = f"{dir_name}/settings.json"
            with open(settings_file, 'w') as f:
                json.dump(data, f, indent=2)

            # Создание скрипта симуляции
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

            # Запуск симуляции
            log_file = f"{dir_name}/run.log"
            process = subprocess.Popen(
                ['python3', f"{dir_name}/run_sim.py", settings_file, dir_name],
                stdout=open(log_file, 'w'),
                stderr=subprocess.STDOUT,
                text=True
            )

            # Сохранение информации о процессе
            processes[unique_id] = {
                'pid': process.pid,
                'process': process,
                'status': 'running',
                'result_url': f"/simulations/{unique_id}/index.html"
            }
            app.logger.debug(f"Started simulation in {dir_name} with PID {process.pid}, logging to {log_file}")

            # Редирект на results с clean_dir_name
            return jsonify({'dir_name': unique_id})
        except Exception as e:
            app.logger.error(f"Error processing simulation settings: {str(e)}")
            return jsonify({"status": "error", "message": f"Invalid settings: {str(e)}"}), 400

@app.route('/params-optimization', methods=['GET', 'POST'])
def params_optimization():
    if request.method == 'GET':
        app.logger.debug("Rendering params-optimization.html")
        return render_template('params-optimization.html')
    elif request.method == 'POST':
        settings = request.get_json()
        if not settings:
            app.logger.error("No settings provided for params-optimization")
            return jsonify({'error': 'No settings provided'}), 400
        app.logger.debug(f"Params Optimization settings: {json.dumps(settings, indent=2)}")
        return jsonify({'message': 'Optimization parameters received'})

@app.route('/request-time-optimization', methods=['GET', 'POST'])
def request_time_optimization():
    if request.method == 'GET':
        app.logger.debug("Rendering request-time-optimization.html")
        return render_template('request-time-optimization.html')
    elif request.method == 'POST':
        settings = request.get_json()
        if not settings:
            app.logger.error("No settings provided for request-time-optimization")
            return jsonify({'error': 'No settings provided'}), 400
        app.logger.debug(f"Request Time Optimization settings: {json.dumps(settings, indent=2)}")
        return jsonify({'message': 'Optimization parameters received'})

@app.route('/results/<path:dir_name>', methods=['GET'])
def results(dir_name):
    clean_dir_name = dir_name.replace('simulations/', '') if dir_name.startswith('simulations/') else dir_name
    settings_path = f"simulations/{clean_dir_name}/settings.json"
    results_path = f"simulations/{clean_dir_name}/results.json"
    index_path = f"simulations/{clean_dir_name}/index.html"

    app.logger.debug(f"Processing results for dir_name: {clean_dir_name}")

    try:
        settings = {}
        if os.path.exists(settings_path):
            with open(settings_path) as f:
                settings = json.load(f)
        else:
            app.logger.warning(f"Settings file not found: {settings_path}")

        results = {}
        if os.path.exists(results_path):
            with open(results_path) as f:
                results = json.load(f)

        # Проверяем, существует ли index.html
        result_url = f"/simulations/{clean_dir_name}/index.html" if os.path.exists(index_path) else ''
        app.logger.debug(f"Rendering results.html for {clean_dir_name}, result_url: {result_url}")

        return render_template('results.html', dir_name=clean_dir_name, settings=settings, results=results, result_url=result_url)
    except Exception as e:
        app.logger.error(f"Error rendering results for {clean_dir_name}: {str(e)}")
        return render_template('results.html', dir_name=clean_dir_name, error=str(e))

@app.route('/status/<path:dir_name>', methods=['GET'])
def check_status(dir_name):
    clean_dir_name = dir_name.replace('simulations/', '') if dir_name.startswith('simulations/') else dir_name
    app.logger.debug(f"Received status request for {clean_dir_name}")

    if clean_dir_name not in processes:
        app.logger.warning(f"Simulation {clean_dir_name} not found in processes: {list(processes.keys())}")
        index_path = f"simulations/{clean_dir_name}/index.html"
        if os.path.exists(index_path):
            app.logger.debug(f"Found index.html for {clean_dir_name}, assuming completed")
            return jsonify({"status": "completed", "result_url": f"/simulations/{clean_dir_name}/index.html"})
        return jsonify({"status": "not_found"}), 404

    sim = processes[clean_dir_name]
    process = sim['process']
    return_code = process.poll()

    app.logger.debug(f"Process status for {clean_dir_name}, PID {sim['pid']}, return_code: {return_code}")

    if return_code is None:
        log_file = f"simulations/{clean_dir_name}/run.log"
        logs = "Simulation running..."
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                logs = f.read()
        app.logger.debug(f"Simulation {clean_dir_name} running, logs: {logs[:100]}...")
        return jsonify({"status": "running", "logs": logs})
    else:
        app.logger.debug(f"Simulation {clean_dir_name} process completed with return_code {return_code}, attempting to run Gatling")
        gatling_path = os.path.abspath("../simulations/gatling-charts-highcharts-bundle-3.1.2/bin/gatling.sh")
        simulation_dir = os.path.abspath(f"simulations/{clean_dir_name}")
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
            app.logger.debug(f"Gatling executed for {clean_dir_name}, stdout: {result.stdout}, stderr: {result.stderr}")
            result_url = f"/simulations/{clean_dir_name}/index.html"
            result_path = os.path.abspath(result_url.lstrip('/'))
            if not os.path.exists(result_path):
                app.logger.error(f"Result file {result_path} not found after Gatling execution")
                return jsonify({"status": "error", "message": f"Result file {result_path} not found"})
            app.logger.debug(f"Returning result_url: {result_url}")
            sim['status'] = 'completed'
            return jsonify({"status": "completed", "result_url": result_url})
        except subprocess.CalledProcessError as e:
            app.logger.error(f"Error running Gatling for {clean_dir_name}: {str(e)}, stdout: {e.stdout}, stderr: {e.stderr}")
            return jsonify({"status": "error", "message": f"Error running Gatling: {str(e)}, stdout: {e.stdout}, stderr: {e.stderr}"})

@app.route('/simulations/<path:path>')
def serve_simulation_files(path):
    simulation_dir = os.path.abspath('simulations')
    app.logger.debug(f"Serving file from {simulation_dir} for path: {path}")
    return send_from_directory(simulation_dir, path)

if __name__ == '__main__':
    os.makedirs('simulations', exist_ok=True)
    app.run(debug=True)