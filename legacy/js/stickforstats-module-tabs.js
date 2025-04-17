/**
 * Module tabs functionality for StickForStats page
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeModuleTabs();
});

/**
 * Initialize module tabs functionality
 */
function initializeModuleTabs() {
    const moduleTabs = document.querySelectorAll('.module-tab');
    const modulePanels = document.querySelectorAll('.module-panel');
    
    if (moduleTabs.length > 0 && modulePanels.length > 0) {
        moduleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                moduleTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get the module value
                const module = tab.getAttribute('data-module');
                
                // Show the corresponding panel
                modulePanels.forEach(panel => {
                    if (panel.getAttribute('data-module') === module) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });
    }
}