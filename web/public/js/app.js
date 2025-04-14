document.addEventListener('DOMContentLoaded', function() {
    // Your JavaScript code here
    console.log('Revit web interface loaded');

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabSlider = document.querySelector('.tab-slider');

    function setActiveTab(tabId) {
        // Update active tab button
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });

        // Update tab slider position
        const activeTab = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (activeTab) {
            tabSlider.style.width = `${activeTab.offsetWidth}px`;
            tabSlider.style.left = `${activeTab.offsetLeft}px`;
        }

        // Update active tab pane
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabId}-tab`) {
                pane.classList.add('active');
            }
        });
    }

    // Initialize tabs
    setActiveTab('single');

    // Tab click event
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveTab(button.dataset.tab);
        });
    });

    // Resolver toggle functionality
    document.getElementById('use-custom-resolver').addEventListener('change', function(e) {
        const resolverInput = document.getElementById('resolver-input');
        resolverInput.classList.toggle('hidden', !e.target.checked);
    });

    document.getElementById('use-custom-resolver-multi').addEventListener('change', function(e) {
        const resolverInput = document.getElementById('resolver-input-multi');
        resolverInput.classList.toggle('hidden', !e.target.checked);
    });

    document.getElementById('use-custom-resolver-file').addEventListener('change', function(e) {
        const resolverInput = document.getElementById('resolver-input-file');
        resolverInput.classList.toggle('hidden', !e.target.checked);
    });

    // File upload handling
    document.getElementById('ip-file').addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : 'Choose a file or drag it here';
        document.querySelector('.file-text').textContent = fileName;
    });

    // Scroll to tool functionality
    document.getElementById('scrollToTool').addEventListener('click', function() {
        document.getElementById('dns-tool').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Handle header visibility on scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.header');
        
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });

    // Single IP lookup functionality
    document.getElementById('lookup-btn').addEventListener('click', async function() {
        const ip = document.getElementById('single-ip').value.trim();
        if (!ip) {
            showNotification('Please enter an IP address', 'error');
            return;
        }

        const useCustomResolver = document.getElementById('use-custom-resolver').checked;
        let resolvers = [];
        
        if (useCustomResolver) {
            const resolver = document.getElementById('custom-resolver').value.trim();
            if (resolver) {
                resolvers = [resolver];
            }
        }

        // Show loading state
        this.classList.add('loading');
        this.querySelector('span').style.display = 'none';
        this.querySelector('.btn-loader').style.display = 'block';

        try {
            const response = await fetch('/api/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ip, resolvers }),
            });

            const data = await response.json();
            
            // Clear previous results
            clearResults();
            
            // Show results container
            document.getElementById('results-container').classList.remove('hidden');
            
            // Add result to the results content
            displayResult(data);
            
        } catch (error) {
            showNotification('An error occurred during the lookup', 'error');
            console.error('Lookup error:', error);
        } finally {
            // Hide loading state
            this.classList.remove('loading');
            this.querySelector('span').style.display = 'block';
            this.querySelector('.btn-loader').style.display = 'none';
        }
    });

    // Multiple IPs lookup functionality
    document.getElementById('lookup-multi-btn').addEventListener('click', async function() {
        const ipsText = document.getElementById('multiple-ips').value.trim();
        if (!ipsText) {
            showNotification('Please enter IP addresses', 'error');
            return;
        }

        const ips = ipsText.split('\n').filter(ip => ip.trim() !== '');
        if (ips.length === 0) {
            showNotification('No valid IP addresses found', 'error');
            return;
        }

        const useCustomResolver = document.getElementById('use-custom-resolver-multi').checked;
        let resolvers = [];
        
        if (useCustomResolver) {
            const resolver = document.getElementById('custom-resolver-multi').value.trim();
            if (resolver) {
                resolvers = [resolver];
            }
        }

        const concurrency = parseInt(document.getElementById('concurrency').value) || 10;

        // Show loading state
        this.classList.add('loading');
        this.querySelector('span').style.display = 'none';
        this.querySelector('.btn-loader').style.display = 'block';

        try {
            const response = await fetch('/api/batch-lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ips, resolvers, concurrency }),
            });

            const data = await response.json();
            
            // Clear previous results
            clearResults();
            
            // Show results container
            document.getElementById('results-container').classList.remove('hidden');
            
            // Add results to the results content
            data.results.forEach(result => {
                displayResult(result);
            });
            
        } catch (error) {
            showNotification('An error occurred during the lookup', 'error');
            console.error('Batch lookup error:', error);
        } finally {
            // Hide loading state
            this.classList.remove('loading');
            this.querySelector('span').style.display = 'block';
            this.querySelector('.btn-loader').style.display = 'none';
        }
    });

    // File upload lookup functionality
    document.getElementById('lookup-file-btn').addEventListener('click', async function() {
        const fileInput = document.getElementById('ip-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            showNotification('Please select a file', 'error');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            const content = e.target.result;
            const ips = content.split('\n').filter(ip => ip.trim() !== '');
            
            if (ips.length === 0) {
                showNotification('No valid IP addresses found in the file', 'error');
                return;
            }

            const useCustomResolver = document.getElementById('use-custom-resolver-file').checked;
            let resolvers = [];
            
            if (useCustomResolver) {
                const resolver = document.getElementById('custom-resolver-file').value.trim();
                if (resolver) {
                    resolvers = [resolver];
                }
            }

            const concurrency = parseInt(document.getElementById('concurrency-file').value) || 10;

            // Show loading state
            this.classList.add('loading');
            this.querySelector('span').style.display = 'none';
            this.querySelector('.btn-loader').style.display = 'block';

            try {
                const response = await fetch('/api/batch-lookup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ips, resolvers, concurrency }),
                });

                const data = await response.json();
                
                // Clear previous results
                clearResults();
                
                // Show results container
                document.getElementById('results-container').classList.remove('hidden');
                
                // Add results to the results content
                data.results.forEach(result => {
                    displayResult(result);
                });
                
            } catch (error) {
                showNotification('An error occurred during the lookup', 'error');
                console.error('File lookup error:', error);
            } finally {
                // Hide loading state
                this.classList.remove('loading');
                this.querySelector('span').style.display = 'block';
                this.querySelector('.btn-loader').style.display = 'none';
            }
        };

        reader.onerror = () => {
            showNotification('Failed to read the file', 'error');
        };

        reader.readAsText(file);
    });

    // Results actions
    document.getElementById('copy-results').addEventListener('click', function() {
        const resultsContent = document.getElementById('results-content');
        const resultText = Array.from(resultsContent.querySelectorAll('.result-item')).map(item => {
            const ip = item.querySelector('.result-ip-text').textContent.trim();
            const dnsNames = Array.from(item.querySelectorAll('.dns-name')).map(name => 
                name.textContent.trim()
            ).join('\n  - ');
            
            return `${ip}:\n  - ${dnsNames}`;
        }).join('\n\n');

        navigator.clipboard.writeText(resultText)
            .then(() => {
                showNotification('Results copied to clipboard', 'success');
            })
            .catch(err => {
                showNotification('Failed to copy results', 'error');
                console.error('Copy error:', err);
            });
    });

    document.getElementById('download-results').addEventListener('click', function() {
        const resultsContent = document.getElementById('results-content');
        const resultText = Array.from(resultsContent.querySelectorAll('.result-item')).map(item => {
            const ip = item.querySelector('.result-ip-text').textContent.trim();
            const dnsNames = Array.from(item.querySelectorAll('.dns-name')).map(name => 
                name.textContent.trim()
            ).join('\n  - ');
            
            return `${ip}:\n  - ${dnsNames}`;
        }).join('\n\n');

        const blob = new Blob([resultText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'revit-results.txt';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });

    document.getElementById('clear-results').addEventListener('click', function() {
        clearResults();
        document.getElementById('results-container').classList.add('hidden');
    });

    // Helper functions
    function displayResult(result) {
        const resultsContent = document.getElementById('results-content');
        
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const resultIp = document.createElement('div');
        resultIp.className = 'result-ip';
        
        const ipText = document.createElement('div');
        ipText.className = 'result-ip-text';
        ipText.innerHTML = `<i class="fas fa-network-wired"></i> ${result.ip}`;
        
        const resultBadge = document.createElement('span');
        resultBadge.className = 'result-badge';
        resultBadge.textContent = result.dnsNames?.length || 0;
        
        resultIp.appendChild(ipText);
        resultIp.appendChild(resultBadge);
        
        const resultDnsNames = document.createElement('div');
        resultDnsNames.className = 'result-dns-names';
        
        if (result.error) {
            const errorElem = document.createElement('div');
            errorElem.className = 'result-error';
            errorElem.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.error}`;
            resultDnsNames.appendChild(errorElem);
        } else if (result.dnsNames && result.dnsNames.length > 0) {
            result.dnsNames.forEach(name => {
                const dnsName = document.createElement('div');
                dnsName.className = 'dns-name';
                dnsName.innerHTML = `<i class="fas fa-check-circle"></i> ${name}`;
                resultDnsNames.appendChild(dnsName);
            });
        } else {
            const noRecords = document.createElement('div');
            noRecords.className = 'result-no-records';
            noRecords.innerHTML = `<i class="fas fa-info-circle"></i> No DNS records found`;
            resultDnsNames.appendChild(noRecords);
        }
        
        resultItem.appendChild(resultIp);
        resultItem.appendChild(resultDnsNames);
        
        resultsContent.appendChild(resultItem);
    }

    function clearResults() {
        const resultsContent = document.getElementById('results-content');
        resultsContent.innerHTML = '';
    }

    function showNotification(message, type) {
        // Here you would implement a notification system
        // This is a simple alert for demonstration purposes
        alert(message);
    }
});
