# Simulator

Contains of framework for load testing simulator and example of using by recreating stand

## How to run?

### Create virtual environment
```
cd simulations
python3 -m venv env # create virtual environment
source env/bin/activate # activate it
pip install -r requirements.txt # install packages
```

### Run simulations
Adjust [settings](load_testing_sim/settings.py) as you want, then run:

```
python3 run.py
```

### Create gatling report
Copy path to log file (usually `{REPO_PATH}/simulations/logs/logs_{TIME}`) and run:
```
./gatling-charts-highcharts-bundle-3.1.2/bin/gatling.sh -ro {LOG_DIR_PATH}
```