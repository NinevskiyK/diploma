document.addEventListener('DOMContentLoaded', () => {
    const serverNumSlider = document.getElementById('server-num');
    const serverNumValue = document.getElementById('server-num-value');
    const nginxWpContainer = document.getElementById('nginx-wp-container');
    const submitBtn = document.getElementById('submit-btn');
    const svgContainer = document.getElementById('arrows-svg');

    if (!serverNumSlider) {
        const serverCount = document.querySelectorAll('.nginx-wp-block').length;
        updateNginxWpBlocks(serverCount);
        return;
    }

    serverNumSlider.addEventListener('input', () => {
        const count = parseInt(serverNumSlider.value);
        console.log('Slider changed to:', count);
        serverNumValue.textContent = count;
        updateNginxWpBlocks(count);
    });

    function updateNginxWpBlocks(count) {
        console.log('Updating blocks:', count);
        svgContainer.innerHTML = `
            <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                    <polygon points="0 0, 6 2, 0 4" fill="#005066" />
                </marker>
            </defs>
        `;

        if (nginxWpContainer && serverNumSlider) {
            nginxWpContainer.innerHTML = '';
            for (let i = 1; i <= count; i++) {
                const block = document.createElement('div');
                block.className = 'card block nginx-wp-block';
                block.id = `nginx-wp-${i}`;
                block.style.width = '38rem';
                block.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title" style="text-align: center;">Nginx + WP #${i}</h5>
                        <div class="row">
                            <div class="col-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h6>Nginx Settings</h6>
                                        <div class="mb-3">
                                            <label for="nginx-queue-size-${i}" class="form-label">Queue Size</label>
                                            <input type="number" class="form-control" id="nginx-queue-size-${i}" value="20" min="1">
                                        </div>
                                        <div class="mb-3">
                                            <label for="nginx-max-conn-${i}" class="form-label">Max Connections</label>
                                            <input type="number" class="form-control" id="nginx-max-conn-${i}" value="1024" min="1">
                                        </div>
                                        <div class="mb-3">
                                            <label for="nginx-timeout-${i}" class="form-label">Timeout (ms)</label>
                                            <input type="number" class="form-control" id="nginx-timeout-${i}" value="30000" min="1">
                                        </div>
                                        <div class="card kernel-settings">
                                            <div class="card-body">
                                                <h6>Nginx Kernel Settings</h6>
                                                <div class="mb-3">
                                                    <label for="nginx-kernel-queue-size-${i}" class="form-label">Queue Size</label>
                                                    <input type="number" class="form-control" id="nginx-kernel-queue-size-${i}" value="0" min="0">
                                                </div>
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
                                            <label for="wp-core-num-${i}" class="form-label">Core Num</label>
                                            <input type="number" class="form-control" id="wp-core-num-${i}" value="1" min="1">
                                        </div>
                                        <div class="mb-3">
                                            <label for="wp-queue-size-${i}" class="form-label">Queue Size</label>
                                            <input type="number" class="form-control" id="wp-queue-size-${i}" value="1024" min="1">
                                        </div>
                                        <div class="mb-3">
                                            <label for="wp-max-conn-${i}" class="form-label">Max Connections</label>
                                            <input type="number" class="form-control" id="wp-max-conn-${i}" value="1024" min="1">
                                        </div>
                                        <div class="mb-3">
                                            <label for="wp-timeout-${i}" class="form-label">Timeout (ms)</label>
                                            <input type="number" class="form-control" id="wp-timeout-${i}" value="20000" min="1">
                                        </div>
                                        <div class="mb-3">
                                            <label for="wp-process-mean-time-${i}" class="form-label">Process Mean Time (ms)</label>
                                            <input type="number" class="form-control" id="wp-process-mean-time-${i}" value="10" min="1">
                                        </div>
                                        <div class="card kernel-settings">
                                            <div class="card-body">
                                                <h6>WP Kernel Settings</h6>
                                                <div class="mb-3">
                                                    <label for="wp-kernel-queue-size-${i}" class="form-label">Queue Size</label>
                                                    <input type="number" class="form-control" id="wp-kernel-queue-size-${i}" value="0" min="0">
                                                </div>
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
        }

        requestAnimationFrame(() => {
            console.log('Drawing arrows');
            const gridContainer = document.getElementById('grid-container');
            const userBlock = document.getElementById('user-block');
            const haproxyBlock = document.getElementById('haproxy-block');

            function drawArrow(startBlock, endBlock, arrowId) {
                const startRect = startBlock.getBoundingClientRect();
                const endRect = endBlock.getBoundingClientRect();
                const gridRect = gridContainer.getBoundingClientRect();

                const startX = startRect.right - gridRect.left + window.scrollX;
                const startY = startRect.top + startRect.height / 2 - gridRect.top + window.scrollY;
                const endX = endRect.left - gridRect.left + window.scrollX;
                const endY = endRect.top + endRect.height / 2 - gridRect.top + window.scrollY;

                const cornerX = startX + (endX - startX) / 2;
                const cornerY = startY;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = `
                    M ${startX},${startY}
                    H ${cornerX}
                    V ${endY}
                    H ${endX}
                `;
                path.setAttribute('d', d);
                path.setAttribute('stroke', '#005066');
                path.setAttribute('stroke-width', '4');
                path.setAttribute('fill', 'none');
                path.setAttribute('marker-end', 'url(#arrowhead)');
                path.setAttribute('id', arrowId);
                svgContainer.appendChild(path);
            }

            if (userBlock && haproxyBlock) {
                drawArrow(userBlock, haproxyBlock, 'arrow-user-haproxy');
            }

            for (let i = 1; i <= count; i++) {
                const nginxWpBlock = document.getElementById(`nginx-wp-${i}`);
                if (nginxWpBlock && haproxyBlock) {
                    drawArrow(haproxyBlock, nginxWpBlock, `arrow-haproxy-nginx-${i}`);
                }
            }
        });
    }

    if (serverNumSlider) {
        updateNginxWpBlocks(1);
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            console.log('Submit button clicked');
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
                    timeout: parseInt(document.getElementById('user-timeout').value) || 10000
                }
            };

            for (let i = 1; i <= serverNum; i++) {
                const wpSettings = {
                    core_num: parseInt(document.getElementById(`wp-core-num-${i}`).value) || 1,
                    queue_size: parseInt(document.getElementById(`wp-queue-size-${i}`).value) || 1024,
                    max_conn: parseInt(document.getElementById(`wp-max-conn-${i}`).value) || 1024,
                    timeout: parseInt(document.getElementById(`wp-timeout-${i}`).value) || 20000,
                    process_mean_time: parseInt(document.getElementById(`wp-process-mean-time-${i}`).value) || 10,
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

            console.log('Collected settings:', settings);

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
                alert(`All fields must contain valid numbers (positive for most, non-negative for kernel queue size). Invalid fields:\n${invalidFields.join('\n')}`);
                return;
            }

            console.log('Sending settings to server:', settings);
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message); });
                }
                return response.text();
            })
            .then(html => {
                console.log('Received HTML response');
                document.open();
                document.write(html);
                document.close();
            })
            .catch(error => {
                console.error('Error sending settings:', error);
                alert(`Error sending settings: ${error.message}`);
            });
        });
    }
});