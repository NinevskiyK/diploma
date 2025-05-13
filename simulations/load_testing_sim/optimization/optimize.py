import optuna
from simulations.load_testing_sim.settings import SystemSettings, RequestSettings
from simulations.load_testing_sim.stand import main

def objective(trial: optuna.Trial):
    server_num=trial.suggest_int("server_num", 1, 2)
    max_handling_connections=trial.suggest_int("max_handling_connections", 1, 1024)
    balancer_queue_size=trial.suggest_int("balancer_queue_size", 1, 1024)
    server_settings = SystemSettings(core_num=1, server_num=server_num, max_handling_connections=max_handling_connections, balancer_queue_size=balancer_queue_size, process_mean_time=6)
    request_settings = RequestSettings(new_users_per_step=[1 for _ in range(1000)], step_time=600)
    stats = main(server_settings, request_settings)
    return stats

if __name__ == "__main__":
    study_name = "example-study-5"  # Unique identifier of the study.
    storage_name = "sqlite:///{}.db".format(study_name)
    study = optuna.create_study(study_name=study_name, storage=storage_name, directions=["maximize", "maximize"])
    study.optimize(objective, n_trials=10000, n_jobs=4)
    best_params = study.best_params
    print(best_params)


    
