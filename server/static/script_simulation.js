document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            console.log('Submit simulation');
            const serverNum = parseInt(document.getElementById('server-num').value);
            const maxUsers = parseInt(document.getElementById('user-max-users').value) || 1;
            const settings = {
                stand_settings: {
                    wp_settings: [],
                    nginx_settings: [],
                    haproxy_setting: {
                        queue_size: parseInt(document.getElementById('haproxy-queue-size').value) || 20,
                        max_conn: parseInt(document.getElementById('haproxy-max-conn').value) || 1024,
                        timeout: parseInt(document.getElementById('haproxy-timeout').value) || 30000,
                        kernel_settings: {
                            kernel_queue_size: parseInt(document.getElementById('haproxy-kernel-queue-size').value) || 0
                        }
                    }
                },
                request_settings: {
                    new_users_per_step: Array(maxUsers).fill(1),
                    step_time: parseInt(document.getElementById('user-step-time').value) || 3000,
                    timeout: parseInt(document.getElementById('user-timeout').value) || 10000,
                    type: document.getElementById('user-type').value || 'opened',
                    enable_tracing: document.getElementById('user-enable-tracing').checked
                }
            };

            for (let i = 1; i <= serverNum; i++) {
                const wpSettings = {
                    core_num: parseInt(document.getElementById(`wp-core-num-${i}`).value) || 1,
                    queue_size: parseInt(document.getElementById(`wp-queue-size-${i}`).value) || 1024,
                    max_conn: parseInt(document.getElementById(`wp-max-conn-${i}`).value) || 1024,
                    timeout: parseInt(document.getElementById(`wp-timeout-${i}`).value) || 20000,
                    process_time: {
                        mean_time: parseFloat(document.getElementById(`wp-process-mean-time-${i}`).value) || 10,
                        std_dev: parseFloat(document.getElementById(`wp-process-std-dev-${i}`).value) || 2,
                        dist_type: document.getElementById(`wp-process-dist-type-${i}`).value || 'gamma'
                    },
                    kernel_settings: {
                        kernel_queue_size: parseInt(document.getElementById(`wp-kernel-queue-size-${i}`).value) || 0
                    }
                };
                const nginxSettings = {
                    queue_size: parseInt(document.getElementById(`nginx-queue-size-${i}`).value) || 20,
                    max_conn: parseInt(document.getElementById(`nginx-max-conn-${i}`).value) || 1024,
                    timeout: parseInt(document.getElementById(`nginx-timeout-${i}`).value) || 30000,
                    kernel_settings: {
                        kernel_queue_size: parseInt(document.getElementById(`nginx-kernel-queue-size-${i}`).value) || 0
                    }
                };
                settings.stand_settings.wp_settings.push(wpSettings);
                settings.stand_settings.nginx_settings.push(nginxSettings);
            }

            console.log('Simulation settings:', settings);

            let valid = true;
            const invalidFields = [];
            if (maxUsers <= 0 || isNaN(maxUsers)) {
                valid = false;
                invalidFields.push(`request_settings.max_users: ${maxUsers}`);
            }
            if (isNaN(settings.request_settings.step_time) || settings.request_settings.step_time <= 0) {
                valid = false;
                invalidFields.push(`request_settings.step_time: ${settings.request_settings.step_time}`);
            }
            if (isNaN(settings.request_settings.timeout) || settings.request_settings.timeout <= 0) {
                valid = false;
                invalidFields.push(`request_settings.timeout: ${settings.request_settings.timeout}`);
            }
            if (!['opened', 'closed'].includes(settings.request_settings.type)) {
                valid = false;
                invalidFields.push(`request_settings.type: ${settings.request_settings.type}`);
            }
            Object.entries(settings.stand_settings.haproxy_setting).forEach(([key, val]) => {
                if (key === 'kernel_settings') {
                    if (isNaN(val.kernel_queue_size) || val.kernel_queue_size < 0) {
                        valid = false;
                        invalidFields.push(`haproxy_setting.kernel_settings.kernel_queue_size: ${val.kernel_queue_size}`);
                    }
                } else if (isNaN(val) || val <= 0) {
                    valid = false;
                    invalidFields.push(`haproxy_setting.${key}: ${val}`);
                }
            });
            settings.stand_settings.wp_settings.forEach((wp, index) => {
                Object.entries(wp).forEach(([key, val]) => {
                    if (key === 'kernel_settings') {
                        if (isNaN(val.kernel_queue_size) || val.kernel_queue_size < 0) {
                            valid = false;
                            invalidFields.push(`wp_settings[${index}].kernel_settings.kernel_queue_size: ${val.kernel_queue_size}`);
                        }
                    } else if (key === 'process_time') {
                        if (isNaN(val.mean_time) || val.mean_time <= 0) {
                            valid = false;
                            invalidFields.push(`wp_settings[${index}].process_time.mean_time: ${val.mean_time}`);
                        }
                        if (isNaN(val.std_dev) || val.std_dev < 0) {
                            valid = false;
                            invalidFields.push(`wp_settings[${index}].process_time.std_dev: ${val.std_dev}`);
                        }
                        if (!['gamma', 'lognorm', 'weibull'].includes(val.dist_type)) {
                            valid = false;
                            invalidFields.push(`wp_settings[${index}].process_time.dist_type: ${val.dist_type}`);
                        }
                    } else if (isNaN(val) || val <= 0) {
                        valid = false;
                        invalidFields.push(`wp_settings[${index}].${key}: ${val}`);
                    }
                });
            });
            settings.stand_settings.nginx_settings.forEach((nginx, index) => {
                Object.entries(nginx).forEach(([key, val]) => {
                    if (key === 'kernel_settings') {
                        if (isNaN(val.kernel_queue_size) || val.kernel_queue_size < 0) {
                            valid = false;
                            invalidFields.push(`nginx_settings[${index}].kernel_settings.kernel_queue_size: ${val.kernel_queue_size}`);
                        }
                    } else if (isNaN(val) || val <= 0) {
                        valid = false;
                        invalidFields.push(`nginx_settings[${index}].${key}: ${val}`);
                    }
                });
            });

            if (!valid) {
                console.log('Invalid fields:', invalidFields);
                alert(`Invalid fields:\n${invalidFields.join('\n')}`);
                return;
            }

            fetch('/simulation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Simulation response:', data);
                if (data.dir_name) {
                    window.location.href = `/results/${data.dir_name}`;
                } else {
                    throw new Error('No dir_name in response');
                }
            })
            .catch(error => {
                console.error('Simulation error:', error);
                alert(`Error: ${error.message}`);
            });
        });
    }

    window.addEventListener('resize', () => requestAnimationFrame(drawArrows));
});