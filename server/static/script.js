document.addEventListener('DOMContentLoaded', () => {
    const serverNumSlider = document.getElementById('server-num');
    const serverNumValue = document.getElementById('server-num-value');
    const nginxWpContainer = document.getElementById('nginx-wp-container');
    const submitBtn = document.getElementById('submit-btn');
    const startOptimizationBtn = document.getElementById('start-optimization-btn');
    const svgContainer = document.getElementById('arrows-svg');

    // Draw arrows
    function drawArrows() {
        if (!svgContainer) return;
        svgContainer.innerHTML = `
            <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill="#005066" />
                </marker>
            </defs>
        `;

        const gridContainer = document.getElementById('grid-container');
        const userBlock = document.getElementById('user-block');
        const haproxyBlock = document.getElementById('haproxy-block');
        const nginxWpBlocks = document.querySelectorAll('.nginx-wp-block');

        function drawArrow(startBlock, endBlock, arrowId) {
            const startRect = startBlock.getBoundingClientRect();
            const endRect = endBlock.getBoundingClientRect();
            const gridRect = gridContainer.getBoundingClientRect();

            const startX = startRect.right - gridRect.left;
            const startY = startRect.top + startRect.height / 2 - gridRect.top;
            const endX = endRect.left - gridRect.left;
            const endY = endRect.top + endRect.height / 2 - gridRect.top;

            const cornerX = startX + (endX - startX) / 2;
            const cornerY = startY;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${startX},${startY} H ${cornerX} V ${endY} H ${endX}`;
            path.setAttribute('d', d);
            path.setAttribute('stroke', '#005066');
            path.setAttribute('stroke-width', '4');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            path.setAttribute('id', arrowId);
            svgContainer.appendChild(path);
        }

        requestAnimationFrame(() => {
            if (userBlock && haproxyBlock) drawArrow(userBlock, haproxyBlock, 'arrow-user-haproxy');
            nginxWpBlocks.forEach((block, index) => {
                if (haproxyBlock) drawArrow(haproxyBlock, block, `arrow-haproxy-nginx-${index + 1}`);
            });
        });
    }

    // Update Nginx+WP blocks
    function updateNginxWpBlocks(count, isOptimization = false, isRequestTime = false) {
        if (!nginxWpContainer) return;
        nginxWpContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const block = document.createElement('div');
            block.className = 'card block nginx-wp-block';
            block.id = `nginx-wp-${i}`;
            block.style.width = '38rem';
            const prefix = isOptimization ? '-min" class="form-control" min="1"' : '" class="form-control" min="1"';
            block.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title" style="text-align: center;">Nginx + WP #${i}</h5>
                    <div class="row">
                        <div class="col-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6>Nginx Settings</h6>
                                    <div class="mb-3">
                                        <label for="nginx-queue-size-${i}${prefix}>Queue Size${isOptimization ? ' (Min)' : ''}</label>
                                        <input type="number" id="nginx-queue-size-${i}${prefix} value="20">
                                    </div>
                                    ${isOptimization ? `
                                    <div class="mb-3">
                                        <label for="nginx-queue-size-${i}-max" class="form-label">Queue Size (Max)</label>
                                        <input type="number" id="nginx-queue-size-${i}-max" class="form-control" min="1" value="50">
                                    </div>` : ''}
                                    <div class="mb-3">
                                        <label for="nginx-max-conn-${i}${prefix}>Max Connections${isOptimization ? ' (Min)' : ''}</label>
                                        <input type="number" id="nginx-max-conn-${i}${prefix} value="1024">
                                    </div>
                                    ${isOptimization ? `
                                    <div class="mb-3">
                                        <label for="nginx-max-conn-${i}-max" class="form-label">Max Connections (Max)</label>
                                        <input type="number" id="nginx-max-conn-${i}-max" class="form-control" min="1" value="2048">
                                    </div>` : ''}
                                    <div class="mb-3">
                                        <label for="nginx-timeout-${i}${prefix}>Timeout (ms${isOptimization ? ', Min' : ''})</label>
                                        <input type="number" id="nginx-timeout-${i}${prefix} value="30000">
                                    </div>
                                    ${isOptimization ? `
                                    <div class="mb-3">
                                        <label for="nginx-timeout-${i}-max" class="form-label">Timeout (ms, Max)</label>
                                        <input type="number" id="nginx-timeout-${i}-max" class="form-control" min="1" value="40000">
                                    </div>` : ''}
                                    <div class="card kernel-settings">
                                        <div class="card-body">
                                            <h6>Nginx Kernel Settings</h6>
                                            <div class="mb-3">
                                                <label for="nginx-kernel-queue-size-${i}${prefix}>Queue Size${isOptimization ? ' (Min)' : ''}</label>
                                                <input type="number" id="nginx-kernel-queue-size-${i}${prefix} value="0" min="0">
                                            </div>
                                            ${isOptimization ? `
                                            <div class="mb-3">
                                                <label for="nginx-kernel-queue-size-${i}-max" class="form-label">Queue Size (Max)</label>
                                                <input type="number" id="nginx-kernel-queue-size-${i}-max" class="form-control" min="0" value="100">
                                            </div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card">
                                <div class="card-body">
                                    <h6>WP Settings</h6>
                                    <div class="mb-3">
                                        <label for="wp-core-num-${i}${prefix}>Core Num${isOptimization ? ' (Min)' : ''}</label>
                                        <input type="number" id="wp-core-num-${i}${prefix} value="1">
                                    </div>
                                    ${isOptimization ? `
                                    <div class="mb-3">
                                        <label for="wp-core-num-${i}-max" class="form-label">Core Num (Max)</label>
                                        <input type="number" id="wp-core-num-${i}-max" class="form-control" min="1" value="4">
                                    </div>` : ''}
                                    <div class="mb-3">
                                        <label for="wp-queue-size-${i}${prefix}>Queue Size${isOptimization ? ' (Min)' : ''}</label>
                                        <input type="number" id="wp-queue-size-${i}${prefix} value="1024">
                                    </div>
                                    ${isOptimization ? `
                                    <div class="mb-3">
                                        <label for="wp-queue-size-${i}-max" class="form-label">Queue Size (Max)</label>
                                        <input type="number" id="wp-queue-size-${i}-max" class="form-control" min="1" value="2048">
                                    </div>` : ''}
                                    <div class="mb-3">
                                        <label for="wp-max-conn-${i}${prefix}>Max Connections${isOptimization ? ' (Min)' : ''}</label>
                                        <input type="number" id="wp-max-conn-${i}${prefix} value="1024">
                                    </div>
                                    ${isOptimization ? `
                                    <div class="mb-3">
                                        <label for="wp-max-conn-${i}-max" class="form-label">Max Connections (Max)</label>
                                        <input type="number" id="wp-max-conn-${i}-max" class="form-control" min="1" value="2048">
                                    </div>` : ''}
                                    <div class="mb-3">
                                        <label for="wp-timeout-${i}${prefix}>Timeout (ms${isOptimization ? ', Min' : ''})</label>
                                        <input type="number" id="wp-timeout-${i}${prefix} value="20000">
                                    </div>
                                    ${isOptimization ? `
                                    <div class="mb-3">
                                        <label for="wp-timeout-${i}-max" class="form-label">Timeout (ms, Max)</label>
                                        <input type="number" id="wp-timeout-${i}-max" class="form-control" min="1" value="30000">
                                    </div>` : ''}
                                    <div class="mb-3">
                                        <label for="wp-process-mean-time-${i}${isOptimization || isRequestTime ? '-min' : ''}" class="form-label">Process Mean Time (ms${isOptimization || isRequestTime ? ', Min' : ''})</label>
                                        <input type="number" id="wp-process-mean-time-${i}${isOptimization || isRequestTime ? '-min' : ''}" class="form-control" min="0" step="0.1" value="10">
                                    </div>
                                    ${(isOptimization || isRequestTime) ? `
                                    <div class="mb-3">
                                        <label for="wp-process-mean-time-${i}-max" class="form-label">Process Mean Time (ms, Max)</label>
                                        <input type="number" id="wp-process-mean-time-${i}-max" class="form-control" min="0" step="0.1" value="20">
                                    </div>` : ''}
                                    <div class="mb-3">
                                        <label for="wp-process-std-dev-${i}${isOptimization || isRequestTime ? '-min' : ''}" class="form-label">Process Std Dev (ms${isOptimization || isRequestTime ? ', Min' : ''})</label>
                                        <input type="number" id="wp-process-std-dev-${i}${isOptimization || isRequestTime ? '-min' : ''}" class="form-control" min="0" step="0.1" value="2">
                                    </div>
                                    ${(isOptimization || isRequestTime) ? `
                                    <div class="mb-3">
                                        <label for="wp-process-std-dev-${i}-max" class="form-label">Process Std Dev (ms, Max)</label>
                                        <input type="number" id="wp-process-std-dev-${i}-max" class="form-control" min="0" step="0.1" value="5">
                                    </div>` : ''}
                                    ${(isOptimization || isRequestTime) ? `
                                    <div class="mb-3">
                                        <label class="form-label">Process Distribution Type</label>
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="wp-process-dist-type-${i}-gamma" checked>
                                            <label for="wp-process-dist-type-${i}-gamma" class="form-check-label">Gamma</label>
                                        </div>
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="wp-process-dist-type-${i}-lognorm" checked>
                                            <label for="wp-process-dist-type-${i}-lognorm" class="form-check-label">Lognorm</label>
                                        </div>
                                        <div class="form-check">
                                            <input type="checkbox" class="form-check-input" id="wp-process-dist-type-${i}-weibull" checked>
                                            <label for="wp-process-dist-type-${i}-weibull" class="form-check-label">Weibull</label>
                                        </div>
                                    </div>` : `
                                    <div class="mb-3">
                                        <label for="wp-process-dist-type-${i}" class="form-label">Process Distribution Type</label>
                                        <select class="form-select" id="wp-process-dist-type-${i}">
                                            <option value="gamma" selected>Gamma</option>
                                            <option value="lognorm">Lognorm</option>
                                            <option value="weibull">Weibull</option>
                                        </select>
                                    </div>`}
                                    <div class="card kernel-settings">
                                        <div class="card-body">
                                            <h6>WP Kernel Settings</h6>
                                            <div class="mb-3">
                                                <label for="wp-kernel-queue-size-${i}${prefix}>Queue Size${isOptimization ? ' (Min)' : ''}</label>
                                                <input type="number" id="wp-kernel-queue-size-${i}${prefix} value="0" min="0">
                                            </div>
                                            ${isOptimization ? `
                                            <div class="mb-3">
                                                <label for="wp-kernel-queue-size-${i}-max" class="form-label">Queue Size (Max)</label>
                                                <input type="number" id="wp-kernel-queue-size-${i}-max" class="form-control" min="0" value="100">
                                            </div>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            nginxWpContainer.appendChild(block);
        }
        drawArrows();
    }

    // Initialize slider
    if (serverNumSlider && serverNumValue) {
        const isOptimization = window.location.pathname === '/params-optimization';
        const isRequestTime = window.location.pathname === '/request-time-optimization';
        serverNumSlider.addEventListener('input', () => {
            const count = parseInt(serverNumSlider.value);
            serverNumValue.textContent = count;
            updateNginxWpBlocks(count, isOptimization, isRequestTime);
        });
        updateNginxWpBlocks(parseInt(serverNumSlider.value), isOptimization, isRequestTime);
    }

    // Simulation logic
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            console.log('Submit simulation');
            const serverNum = parseInt(serverNumSlider.value);
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

    // Optimization logic (Params Optimization and Request Time Optimization)
    if (startOptimizationBtn) {
        startOptimizationBtn.addEventListener('click', () => {
            console.log('Start optimization');
            const serverNum = parseInt(serverNumSlider.value);
            const isRequestTime = window.location.pathname === '/request-time-optimization';
            const settings = { parameters: [], server_count: serverNum };

            // Helper to collect bounds or choices
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

            // User settings
            settings.parameters.push(
                collectParam('max_users', 'int', 'user-max-users-min', 'user-max-users-max'),
                collectParam('timeout', 'int', 'user-timeout-min', 'user-timeout-max'),
                collectParam('step_time', 'int', 'user-step-time-min', 'user-step-time-max'),
                collectParam('type', 'categorical', null, null, ['user-type-opened', 'user-type-closed'])
            );

            // HAProxy settings
            settings.parameters.push(
                collectParam('haproxy_queue_size', 'int', 'haproxy-queue-size-min', 'haproxy-queue-size-max'),
                collectParam('haproxy_max_conn', 'int', 'haproxy-max-conn-min', 'haproxy-max-conn-max'),
                collectParam('haproxy_timeout', 'int', 'haproxy-timeout-min', 'haproxy-timeout-max'),
                collectParam('haproxy_kernel_queue_size', 'int', 'haproxy-kernel-queue-size-min', 'haproxy-kernel-queue-size-max')
            );

            // Nginx+WP settings
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

            // Request Time Optimization limits
            if (isRequestTime) {
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
            }

            console.log('Optimization settings:', settings);

            const endpoint = isRequestTime ? '/request-time-optimization' : '/params-optimization';
            fetch(endpoint, {
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

    // Redraw arrows on resize
    window.addEventListener('resize', () => requestAnimationFrame(drawArrows));
});