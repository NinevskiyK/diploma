document.addEventListener('DOMContentLoaded', () => {
    const svgContainer = document.getElementById('arrows-svg');
    const container = document.querySelector('.container');
    const dirName = container ? container.dataset.dirName : null;
    const logsContainer = document.getElementById('simulation-logs');
    let statusInterval = null;
    let timeoutId = null;

    console.log('dirName:', dirName); // Отладка

    // Draw arrows
    function drawArrows() {
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

        nginxWpBlocks.forEach((block, index) => {
            if (haproxyBlock) {
                drawArrow(haproxyBlock, block, `arrow-haproxy-nginx-${index + 1}`);
            }
        });
    }

    // Check simulation status
    function checkSimulationStatus() {
        if (!dirName) {
            logsContainer.textContent = 'No simulation directory specified.';
            if (statusInterval) clearInterval(statusInterval);
            if (timeoutId) clearTimeout(timeoutId);
            return;
        }

        fetch(`/status/${dirName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Status response:', data); // Отладка
                if (data.status === 'running') {
                    logsContainer.textContent = data.logs || 'Simulation running...';
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                } else if (data.status === 'completed') {
                    logsContainer.textContent = 'Simulation completed! Opening results...';
                    console.log('Attempting to open:', data.result_url); // Отладка
                    const newWindow = window.open(data.result_url, '_blank');
                    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                        console.warn('window.open failed, redirecting to:', data.result_url);
                        logsContainer.textContent += '\nPopup blocked. Redirecting to results...';
                        setTimeout(() => {
                            window.location.href = data.result_url;
                        }, 1000);
                    }
                    if (statusInterval) clearInterval(statusInterval);
                    if (timeoutId) clearTimeout(timeoutId);
                } else if (data.status === 'not_found') {
                    logsContainer.textContent = 'Simulation not found.';
                    if (statusInterval) clearInterval(statusInterval);
                    if (timeoutId) clearTimeout(timeoutId);
                } else if (data.status === 'error') {
                    logsContainer.textContent = `Error: ${data.message}`;
                    if (statusInterval) clearInterval(statusInterval);
                    if (timeoutId) clearTimeout(timeoutId);
                }
            })
            .catch(error => {
                console.error('Error checking status:', error);
                logsContainer.textContent = `Error checking simulation status: ${error.message}`;
                if (statusInterval) clearInterval(statusInterval);
                if (timeoutId) clearTimeout(timeoutId);
            });
    }

    // Initial draw and status check
    drawArrows();
    if (dirName) {
        statusInterval = setInterval(checkSimulationStatus, 5000);
        checkSimulationStatus();
        timeoutId = setTimeout(() => {
            if (statusInterval) clearInterval(statusInterval);
            logsContainer.textContent = 'Simulation timed out. Please check server logs.';
        }, 30 * 60 * 1000);
    } else {
        logsContainer.textContent = 'No simulation directory specified.';
    }
});