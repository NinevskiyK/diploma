import os
import optuna
from uuid import uuid4
from ..settings import StandSettings, RequestSettings
from ..stand import run_simulation
from .stats import get_stats
import copy
from typing import Dict, Any, List, Tuple

# helpers
def extract_optimizable_params(config: Dict[str, Any], prefix: str = "", path: List[str] = []) -> List[Tuple[str, Dict[str, Any]]]:
    optimizable_params = []
    
    for key, value in config.items():
        current_path = path + [key]
        
        if isinstance(value, dict):
            if 'type' in value and ('bounds' in value or 'choices' in value):
                name = '__'.join(current_path)
                optimizable_params.append((name, value))
            else:
                optimizable_params.extend(extract_optimizable_params(value, prefix, current_path))
        elif isinstance(value, list):
            for i, item in enumerate(value):
                optimizable_params.extend(extract_optimizable_params(item, prefix, current_path + [str(i)]))
    
    return optimizable_params

def suggest_param(trial: optuna.Trial, name: str, param_info: Dict[str, Any]) -> Any:
    param_type = param_info['type']
    if param_type == 'int':
        return trial.suggest_int(name, param_info['bounds'][0], param_info['bounds'][1])
    elif param_type == 'categorical':
        return trial.suggest_categorical(name, param_info['choices'])
    raise ValueError(f"Unsupported parameter type: {param_type}")

def set_nested_value(config: Dict[str, Any], path: List[str], value: Any) -> None:
    current = config
    for part in path[:-1]:
        if part.isdigit():
            current = current[int(part)]
        else:
            current = current[part]
    last_key = path[-1]
    if last_key.isdigit():
        current[int(last_key)] = value
    else:
        current[last_key] = value


def objective(trial: optuna.Trial, dir_name: str, config: Dict[str, Any], optimizable_params: List[Tuple[str, Dict[str, Any]]]) -> Tuple[float, float]:
    trial_config = copy.deepcopy(config)
    
    for name, param_info in optimizable_params:
        value = suggest_param(trial, name, param_info)
        path = name.split('__')
        set_nested_value(trial_config, path, value)
    
    stand_settings = StandSettings.from_dict(trial_config['stand_settings'])
    request_settings = RequestSettings.from_dict(trial_config['request_settings'])
    
    dir_name += "/" + str(uuid4())
    os.makedirs(dir_name, exist_ok=True)
    run_simulation(dir_name, stand_settings, request_settings)
    stats = get_stats(f'{dir_name}/simulation.log')
    
    degradation_rps = stats.get('degradation_rps', 0)
    fail_rps = stats.get('fail_rps', 0)
    
    return degradation_rps, fail_rps

def optimize_params(optimization_config: Dict[str, Any], dir_name: str, study_name: str = "params-optimization", n_trials: int = 10000, n_jobs: int = 2) -> Dict[str, Any]:
    os.makedirs(dir_name, exist_ok=True)
    optimizable_params = extract_optimizable_params(optimization_config)

    if not optimizable_params:
        raise ValueError("No optimizable parameters found in the configuration.")
    
    storage_name = f"sqlite:///{dir_name}/{study_name}.db"
    study = optuna.create_study(
        study_name=study_name,
        storage=storage_name,
        directions=["maximize", "maximize"],
        load_if_exists=True,

    )
    
    study.optimize(
        lambda trial: objective(trial, dir_name, optimization_config, optimizable_params),
        n_trials=n_trials,
        n_jobs=n_jobs
    )
    
    best_params = study.best_params
    print("Best parameters:", best_params)
    
    return best_params

