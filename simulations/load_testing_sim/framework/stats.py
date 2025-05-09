import tqdm

DEGRADATION_LIMIT = 100
FAIL_LIMIT = 0.05 # 5%

def get_degradation_level(req_per_second, resp_mean_times):
    if resp_mean_times[-1] < DEGRADATION_LIMIT:
        return 10**10
    for req_num, resp_time in zip(req_per_second[::-1], resp_mean_times[::-1]):
        if resp_time < DEGRADATION_LIMIT:
            return req_num
    return 10**10

def get_fail_level(req_per_second, fails_per_second):
    if fails_per_second[-1] / req_per_second[-1] < FAIL_LIMIT:
        return 10**10
    for req_num, fail_num in zip(req_per_second[::-1], fails_per_second[::-1]):
        if fail_num / req_num < FAIL_LIMIT:
            return req_num
    return 10**10
    

def parse_logs(file_path):
    current_second = 0
    req_cnt = 0
    requests_per_second = []

    sum_req_times = 0
    response_mean_times = []

    fails_num = 0
    fails_per_second = []

    with open(file_path, "r", encoding='utf-8') as log:
        for line in tqdm.tqdm(log.readlines()[1:]):
            tp = line.split('\t')[0]
            other = line.split('\t')[1:]
            if tp == 'REQUEST':
                start_time = int(other[3])
                process_time = int(other[4]) - start_time
                req_second = start_time // 1000
                if req_second > current_second:
                    while current_second != req_second:
                        requests_per_second.append(req_cnt)
                        fails_per_second.append(fails_num)
                        if req_cnt == 0:
                            response_mean_times.append(0)
                        else:
                            response_mean_times.append(sum_req_times // (req_cnt - fails_num))
                        req_cnt = 0
                        sum_req_times = 0
                        fails_num = 0
                        current_second += 1
                req_cnt += 1
                if other[-2] == 'KO':
                    fails_num += 1
                else:
                    sum_req_times += process_time
    requests_per_second.append(req_cnt)
    if req_cnt == 0:
        response_mean_times.append(0)
    else:
        response_mean_times.append(sum_req_times // (req_cnt - fails_num))
    return (requests_per_second, response_mean_times, fails_per_second)


def get_stats(file_path):
    try:
        req_per_second, resp_mean_times, fails_per_second = parse_logs(file_path)
        return (get_degradation_level(req_per_second, resp_mean_times), get_fail_level(req_per_second, fails_per_second))
    except:
        print("Got no stats")

    
