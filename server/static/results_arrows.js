console.log('results_arrows.js loaded');

document.addEventListener('DOMContentLoaded', () => {
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

    drawArrows();
    window.addEventListener('resize', () => requestAnimationFrame(drawArrows));
});