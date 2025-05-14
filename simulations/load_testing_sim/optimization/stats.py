import tqdm
from typing import List

def get_level(ls: List, limit: float | int, group_size: int = 30) -> int:
    if len(ls) < group_size:
        return -1

    for group_start in range(len(ls) - group_size, -1, -1):
        cnt = 0
        for i in range(group_start, group_start + group_size):
            cnt += (ls[i] > limit)
        if cnt <= group_size // 2:
            if group_start == len(ls) - group_size: # даже последняя группа не превысила лимит
                return -1
            return group_start + group_size // 2
    return 0

def get_degradation_level(req_per_second, resp_mean_times, degradation_limit):
    idx = get_level(resp_mean_times, degradation_limit)
    if idx == -1:
        return 10**10
    return req_per_second[idx]

def get_fail_level(req_per_second, fails_percent_per_second, fail_limit):
    idx = get_level(fails_percent_per_second, fail_limit)
    if idx == -1:
        return 10**10
    return req_per_second[idx]
    

def parse_logs(file_path, group_size = 1000):
    current_group = 0

    req_cnt = 0
    requests_per_group = []

    sum_req_times = 0
    response_mean_times = []

    fails_num = 0
    fails_percent_per_group = []

    with open(file_path, "r", encoding='utf-8') as log:
        for line in tqdm.tqdm(log.readlines()[1:]):
            tp = line.split('\t')[0]
            other = line.split('\t')[1:]
            if tp == 'REQUEST':
                start_time = int(other[3])
                process_time = int(other[4]) - start_time
                req_group = start_time // group_size
                is_ok = other[-2] == 'OK'

                while req_group > current_group:
                    requests_per_group.append(req_cnt)
                    if req_cnt == 0:
                        response_mean_times.append(0)
                        fails_percent_per_group.append(0)
                    else:
                        if req_cnt == fails_num:
                            response_mean_times.append(10**10)
                        else:
                            response_mean_times.append(sum_req_times // (req_cnt - fails_num))

                        fails_percent_per_group.append(fails_num / req_cnt)

                    req_cnt = 0
                    sum_req_times = 0
                    fails_num = 0
                    current_group += 1
                req_cnt += 1

                if not is_ok:
                    fails_num += 1
                else:
                    sum_req_times += process_time

    requests_per_group.append(req_cnt)
    if req_cnt == 0:
        response_mean_times.append(0)
        fails_percent_per_group.append(0)
    else:
        response_mean_times.append(sum_req_times // (req_cnt - fails_num))
        fails_percent_per_group.append(fails_num / req_cnt)

    return (requests_per_group, response_mean_times, fails_percent_per_group)


def get_stats(file_path, degradation_limit, fail_limit):
    fail_limit /= 100 # percent to float
    req_per_second, resp_mean_times, fails_percent_per_second = parse_logs(file_path, 1000)
    return {
        "degradation_rps": get_degradation_level(req_per_second, resp_mean_times, degradation_limit),
        "fail_rps": get_fail_level(req_per_second, fails_percent_per_second, fail_limit)
    }
    
