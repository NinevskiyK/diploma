# Request Time Inference

See how we can inference request time inference
- [Real system](1_server)
- [Optimization of RT](optimization)

see [index.html](1_server/index.html) or build it yourself by Gatling (`gatling.sh -ro PATH_TO_SIMULATION.LOG`) for real system results

To see results of optimization, run `optuna-dashboard sqlite:///{PATH_TO_PARAMS-OPTIMIZATION.db} --port {PORT}` and see `localhost:PORT`