console.log('script_result.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    
    const dirNameElement = document.getElementById('dir-name');
    const statusElement = document.getElementById('status');
    const logsElement = document.getElementById('logs');

    if (!dirNameElement) {
        console.error('Error: dir-name element not found');
        if (statusElement) statusElement.textContent = 'Error';
        if (logsElement) logsElement.textContent = 'Error: dir-name element not found';
        return;
    }

    const dirName = dirNameElement.value;
    console.log('dirName:', dirName);

    if (!dirName || dirName === 'None') {
        console.error('Error: dirName is empty or None');
        if (statusElement) statusElement.textContent = 'Error';
        if (logsElement) logsElement.textContent = 'Error: dirName is empty or None';
        return;
    }

    if (!statusElement || !logsElement) {
        console.error('Error: status or logs element not found');
        return;
    }

    function updateStatus() {
        console.log(`Fetching status for ${dirName}`);
        fetch(`/status/${dirName}`)
            .then(response => {
                console.log('Status response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Status response data:', data);
                if (data.status === 'running') {
                    statusElement.textContent = 'Simulation Running';
                    logsElement.textContent = data.logs || 'Simulation running, no logs yet...';
                } else if (data.status === 'completed') {
                    statusElement.textContent = 'Simulation Completed';
                    logsElement.textContent = data.logs || 'No logs available.';
                    if (data.result_url) {
                        console.log('Redirecting to result_url:', data.result_url);
                        window.location.href = data.result_url;
                    }
                    clearInterval(interval);
                } else if (data.status === 'error') {
                    statusElement.textContent = 'Simulation Failed';
                    logsElement.textContent = data.message || 'Unknown error occurred.';
                    clearInterval(interval);
                } else {
                    statusElement.textContent = 'Simulation Not Found';
                    logsElement.textContent = 'No simulation data available.';
                    clearInterval(interval);
                }
            })
            .catch(error => {
                console.error('Status fetch error:', error);
                statusElement.textContent = 'Error Checking Status';
                logsElement.textContent = `Error: ${error.message}`;
                clearInterval(interval);
            });
    }

    // Начальный запрос статуса
    updateStatus();
    // Обновление каждые 2 секунды
    const interval = setInterval(updateStatus, 2000);
});