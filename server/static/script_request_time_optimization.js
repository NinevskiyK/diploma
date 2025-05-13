document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    const startOptimizationBtn = document.getElementById('start-optimization-btn');
    if (startOptimizationBtn) {
        startOptimizationBtn.addEventListener('click', () => {
            console.log('Start request time optimization');
            const serverNum = parseInt(document.getElementById('server-num').value);
            const settings = { parameters: [], server_count: serverNum };

            function collectParam(name, type, minId, maxId, choicesIds) {
                if (type === 'int') {
                    const min = parseInt(document.getElementById(minId)?.value);
                    const max = parseInt(document.getElementById(maxId)?.value);
                    if (isNaN(min) || isNaN(max) || min > max) {
                        throw new Error(`Invalid bounds for ${name}: min=${min}, max=${max}`);
                    }
                    return { name, type, bounds: [min, max] };
                } else {
                    const choices = choicesIds
                        .filter(id => document.getElementById(id)?.checked)
                        .map(id => id.split('-').pop());
                    if (!choices.length) {
                        throw new Error(`No choices selected for ${name}`);
                    }
                    return { name, type: 'categorical', choices };
                }
            }

            settings.parameters.push(
                collectParam('max_users', 'int', 'user-max-users-min', 'user-max-users-max'),
                collectParam('timeout', 'int', 'user-timeout-min', 'user-timeout-max'),
                collectParam('step_time', 'int', 'user-step-time-min', 'user-step-time-max'),
                collectParam('type', 'categorical', null, null, ['user-type-opened', 'user-type-closed'])
            );

            settings.parameters.push(
                collectParam('haproxy_queue_size', 'int', 'haproxy-queue-size-min', 'haproxy-queue-size-max'),
                collectParam('haproxy_max_conn', 'int', 'haproxy-max-conn-min', 'haproxy-max-conn-max'),
                collectParam('haproxy_timeout', 'int', 'haproxy-timeout-min', 'haproxy-timeout-max'),
                collectParam('haproxy_kernel_queue_size', 'int', 'haproxy-kernel-queue-size-min', 'haproxy-kernel-queue-size-max')
            );

            for (let i = 1; i <= serverNum; i++) {
                settings.parameters.push(
                    collectParam(`nginx_queue_size_${i}`, 'int', `nginx-queue-size-${i}-min`, `nginx-queue-size-${i}-max`),
                    collectParam(`nginx_max_conn_${i}`, 'int', `nginx-max-conn-${i}-min`, `nginx-max-conn-${i}-max`),
                    collectParam(`nginx_timeout_${i}`, 'int', `nginx-timeout-${i}-min`, `nginx-timeout-${i}-max`),
                    collectParam(`nginx_kernel_queue_size_${i}`, 'int', `nginx-kernel-queue-size-${i}-min`, `nginx-kernel-queue-size-${i}-max`),
                    collectParam(`wp_core_num_${i}`, 'int', `wp-core-num-${i}-min`, `wp-core-num-${i}-max`),
                    collectParam(`wp_queue_size_${i}`, 'int', `wp-queue-size-${i}-min`, `wp-queue-size-${i}-max`),
                    collectParam(`wp_max_conn_${i}`, 'int', `wp-max-conn-${i}-min`, `wp-max-conn-${i}-max`),
                    collectParam(`wp_timeout_${i}`, 'int', `wp-timeout-${i}-min`, `wp-timeout-${i}-max`),
                    collectParam(`wp_process_mean_time_${i}`, 'int', `wp-process-mean-time-${i}-min`, `wp-process-mean-time-${i}-max`),
                    collectParam(`wp_process_std_dev_${i}`, 'int', `wp-process-std-dev-${i}-min`, `wp-process-std-dev-${i}-max`),
                    collectParam(`wp_process_dist_type_${i}`, 'categorical', null, null, [
                        `wp-process-dist-type-${i}-gamma`,
                        `wp-process-dist-type-${i}-lognorm`,
                        `wp-process-dist-type-${i}-weibull`
                    ])
                );
            }

            const limits = {
                degradation_limit: parseInt(document.getElementById('degradation-limit').value) || 1000,
                degradation_rps: parseInt(document.getElementById('degradation-rps').value) || 100,
                fail_limit: parseFloat(document.getElementById('fail-limit').value) || 5,
                fail_rps: parseInt(document.getElementById('fail-rps').value) || 200
            };
            if (Object.values(limits).some(v => isNaN(v) || v <= 0)) {
                alert('All limit fields must be positive numbers');
                return;
            }
            settings.limits = limits;

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