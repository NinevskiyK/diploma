document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    setTimeout(drawArrows, 100);
    const startOptimizationBtn = document.getElementById('start-optimization-btn');
    if (startOptimizationBtn) {
        startOptimizationBtn.addEventListener('click', () => {
            console.log('Start params optimization');
            const serverNum = parseInt(document.getElementById('server-num').value);
            const settings = {
                request_settings: {},
                stand_settings: {
                    haproxy_setting: {},
                    nginx_settings: [],
                    wp_settings: []
                },
                server_count: serverNum
            };

            function collectParam(name, type, minId, maxId, choicesIds, singleId) {
                if (type === 'int' || type === 'float') {
                    if (singleId) {
                        const value = parseFloat(document.getElementById(singleId)?.value);
                        if (isNaN(value) || value <= 0) {
                            throw new Error(`Invalid value for ${name}: ${value}`);
                        }
                        return { type, bounds: [value, value] };
                    }
                    const min = parseFloat(document.getElementById(minId)?.value);
                    const max = parseFloat(document.getElementById(maxId)?.value);
                    if (isNaN(min) || isNaN(max) || min > max) {
                        throw new Error(`Invalid bounds for ${name}: min=${min}, max=${max}`);
                    }
                    return { type, bounds: [min, max] };
                } else {
                    if (name === 'type') {
                        const select = document.getElementById('user-type')?.value;
                        if (!select) {
                            throw new Error(`No value selected for ${name}`);
                        }
                        return { type: 'categorical', choices: [select] };
                    }
                    const choices = choicesIds
                        .filter(id => document.getElementById(id)?.checked)
                        .map(id => id.split('-').pop());
                    if (!choices.length) {
                        throw new Error(`No choices selected for ${name}`);
                    }
                    return { type: 'categorical', choices };
                }
            }

            settings.request_settings = {
                max_users: collectParam('max_users', 'int', null, null, null, 'user-max-users'),
                timeout: collectParam('timeout', 'int', null, null, null, 'user-timeout'),
                step_time: collectParam('step_time', 'int', null, null, null, 'user-step-time'),
                type: collectParam('type', 'categorical', null, null, ['user-type-opened', 'user-type-closed']),
                enable_tracing: document.getElementById('user-enable-tracing').checked
            };

            settings.stand_settings.haproxy_setting = {
                queue_size: collectParam('haproxy_queue_size', 'int', 'haproxy-queue-size-min', 'haproxy-queue-size-max'),
                max_conn: collectParam('haproxy_max_conn', 'int', 'haproxy-max-conn-min', 'haproxy-max-conn-max'),
                timeout: collectParam('haproxy_timeout', 'int', 'haproxy-timeout-min', 'haproxy-timeout-max'),
                kernel_settings: {
                    kernel_queue_size: collectParam('haproxy_kernel_queue_size', 'int', 'haproxy-kernel-queue-size-min', 'haproxy-kernel-queue-size-max')
                }
            };

            for (let i = 1; i <= serverNum; i++) {
                settings.stand_settings.nginx_settings.push({
                    queue_size: collectParam(`nginx_queue_size_${i}`, 'int', `nginx-queue-size-${i}-min`, `nginx-queue-size-${i}-max`),
                    max_conn: collectParam(`nginx_max_conn_${i}`, 'int', `nginx-max-conn-${i}-min`, `nginx-max-conn-${i}-max`),
                    timeout: collectParam(`nginx_timeout_${i}`, 'int', `nginx-timeout-${i}-min`, `nginx-timeout-${i}-max`),
                    kernel_settings: {
                        kernel_queue_size: collectParam(`nginx_kernel_queue_size_${i}`, 'int', `nginx-kernel-queue-size-${i}-min`, `nginx-kernel-queue-size-${i}-max`)
                    }
                });

                settings.stand_settings.wp_settings.push({
                    core_num: collectParam(`wp_core_num_${i}`, 'int', `wp-core-num-${i}-min`, `wp-core-num-${i}-max`),
                    queue_size: collectParam(`wp_queue_size_${i}`, 'int', `wp-queue-size-${i}-min`, `wp-queue-size-${i}-max`),
                    max_conn: collectParam(`wp_max_conn_${i}`, 'int', `wp-max-conn-${i}-min`, `wp-max-conn-${i}-max`),
                    timeout: collectParam(`wp_timeout_${i}`, 'int', `wp-timeout-${i}-min`, `wp-timeout-${i}-max`),
                    process_time: {
                        mean_time: parseFloat(document.getElementById(`wp-process-mean-time-${i}`)?.value) || 10,
                        std_dev: parseFloat(document.getElementById(`wp-process-std-dev-${i}`)?.value) || 2,
                        dist_type: document.getElementById(`wp-process-dist-type-${i}`)?.value || 'gamma'
                    },
                    kernel_settings: {
                        kernel_queue_size: collectParam(`wp_kernel_queue_size_${i}`, 'int', `wp-kernel-queue-size-${i}-min`, `wp-kernel-queue-size-${i}-max`)
                    }
                });
            }

            console.log('Params Optimization settings:', settings);

            fetch('/params-optimization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Optimization response:', data);
                alert(data.message);
                if (data.dashboard_url) {
                    // Задержка 2 секунды перед открытием дашборда
                    setTimeout(() => window.open(data.dashboard_url, '_blank'), 2000);
                }
                // Периодическая проверка статуса оптимизации
                if (data.unique_id) {
                    const checkStatus = setInterval(() => {
                        fetch(`/optimization-status/${data.unique_id}`)
                            .then(res => res.json())
                            .then(statusData => {
                                console.log('Optimization status:', statusData);
                                if (statusData.status === 'completed') {
                                    clearInterval(checkStatus);
                                    alert('Optimization completed!');
                                }
                            })
                            .catch(err => console.error('Status check error:', err));
                    }, 5000);
                }
            })
            .catch(error => {
                console.error('Optimization error:', error);
                alert(`Error: ${error.message}`);
            });
        });
    }

    window.addEventListener('resize', () => requestAnimationFrame(drawArrows));
});