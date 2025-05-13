function drawArrows() {
    const svgContainer = document.getElementById('arrows-svg');
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

function updateNginxWpBlocks(count, isOptimization = false, isRequestTime = false) {
    const nginxWpContainer = document.getElementById('nginx-wp-container');
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
        `;
        nginxWpContainer.appendChild(block);
    }
    drawArrows();
}

function initSlider() {
    const serverNumSlider = document.getElementById('server-num');
    const serverNumValue = document.getElementById('server-num-value');
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
}