document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    setTimeout(drawArrows, 100);
    const startOptimizationBtn = document.getElementById('start-optimization-btn');
    if (startOptimizationBtn) {
        startOptimizationBtn.addEventListener('click', () => {
            console.log('Start request time optimization');
            const serverNum = parseInt(document.getElementById('server-num').value);
            const settings = {
                request_settings: {},
                stand_settings: {
                    haproxy_setting: {},
                    nginx_settings: [],
                    wp_settings: []
                },
                server_count: serverNum,
                limits: {}
            };

            function collectParam(name, type, minId, maxId, choicesIds, singleId, allowZero = false) {
                if (type === 'int' || type === 'float') {
                    if (singleId) {
                        const value = parseFloat(document.getElementById(singleId)?.value);
                        if (isNaN(value) || (!allowZero && value <= 0)) {
                            throw new Error(`Invalid value for ${name}: ${value}`);
                        }
                        return type === 'int' ? parseInt(value) : value;
                    }
                    const min = parseFloat(document.getElementById(minId)?.value);
                    const max = parseFloat(document.getElementById(maxId)?.value);
                    if (isNaN(min) || isNaN(max) || min > max || (!allowZero && (min <= 0 || max <= 0))) {
                        throw new Error(`Invalid bounds for ${name}: min=${min}, max=${max}`);
                    }
                    return { type, bounds: [min, max] };
                } else {
                    if (name === 'type') {
                        const select = document.getElementById('user-type')?.value;
                        if (!select) {
                            throw new Error(`No value selected for ${name}`);
                        }
                        return select;
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
                queue_size: collectParam('haproxy_queue_size', 'int', null, null, null, 'haproxy-queue-size'),
                max_conn: collectParam('haproxy_max_conn', 'int', null, null, null, 'haproxy-max-conn'),
                timeout: collectParam('haproxy_timeout', 'int', null, null, null, 'haproxy-timeout'),
                kernel_settings: {
                    kernel_queue_size: collectParam('haproxy_kernel_queue_size', 'int', null, null, null, 'haproxy-kernel-queue-size', true)
                }
            };

            for (let i = 1; i <= serverNum; i++) {
                settings.stand_settings.nginx_settings.push({
                    queue_size: collectParam(`nginx_queue_size_${i}`, 'int', null, null, null, `nginx-queue-size-${i}`),
                    max_conn: collectParam(`nginx_max_conn_${i}`, 'int', null, null, null, `nginx-max-conn-${i}`),
                    timeout: collectParam(`nginx_timeout_${i}`, 'int', null, null, null, `nginx-timeout-${i}`),
                    kernel_settings: {
                        kernel_queue_size: collectParam(`nginx_kernel_queue_size_${i}`, 'int', null, null, null, `nginx-kernel-queue-size-${i}`, true)
                    }
                });

                settings.stand_settings.wp_settings.push({
                    core_num: collectParam(`wp_core_num_${i}`, 'int', null, null, null, `wp-core-num-${i}`),
                    queue_size: collectParam(`wp_queue_size_${i}`, 'int', null, null, null, `wp-queue-size-${i}`),
                    max_conn: collectParam(`wp_max_conn_${i}`, 'int', null, null, null, `wp-max-conn-${i}`),
                    timeout: collectParam(`wp_timeout_${i}`, 'int', null, null, null, `wp-timeout-${i}`),
                    process_time: {
                        mean_time: collectParam(`wp_process_mean_time_${i}`, 'float', `wp-process-mean-time-${i}-min`, `wp-process-mean-time-${i}-max`, null, null, true),
                        std_dev: collectParam(`wp_process_std_dev_${i}`, 'float', `wp-process-std-dev-${i}-min`, `wp-process-std-dev-${i}-max`, null, null, true),
                        dist_type: collectParam(`wp_process_dist_type_${i}`, 'categorical', null, null, [
                            `wp-process-dist-type-${i}-gamma`,
                            `wp-process-dist-type-${i}-lognorm`,
                            `wp-process-dist-type-${i}-weibull`
                        ])
                    },
                    kernel_settings: {
                        kernel_queue_size: collectParam(`wp_kernel_queue_size_${i}`, 'int', null, null, null, `wp-kernel-queue-size-${i}`, true)
                    }
                });
            }

            settings.limits = {
                degradation_limit: parseInt(document.getElementById('degradation-limit').value) || 1000,
                degradation_rps: parseInt(document.getElementById('degradation-rps').value) || 100,
                fail_limit: parseFloat(document.getElementById('fail-limit').value) || 5,
                fail_rps: parseInt(document.getElementById('fail-rps').value) || 200
            };
            if (Object.values(settings.limits).some(v => isNaN(v) || v <= 0)) {
                alert('All limit fields must be positive numbers');
                return;
            }

            console.log('Request Time Optimization settings:', settings);

            fetch('/request-time-optimization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Optimization response:', data);
                alert(data.message);
            })
            .catch(error => {
                console.error('Optimization error:', error);
                alert(`Error: ${error.message}`);
            });
        });
    }

    window.addEventListener('resize', () => requestAnimationFrame(drawArrows));
});