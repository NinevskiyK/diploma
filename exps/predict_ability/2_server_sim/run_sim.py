
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
