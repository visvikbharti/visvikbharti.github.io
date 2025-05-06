/**
 * Main JavaScript functionality for Vishal Bharti's portfolio website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the portfolio
    initializeTabs();
    setupDarkModeToggle();
    
    // Initialize enhanced features
    initializeProjectFilter();
    initializeSkillsTabs();
    initializeResearchTimeline();
    initializeLazyLoading();
    initializeCitationChart();
    initializeAnimations();
    
    // Load the default tab (home)
    loadTabContent('home');
});

/**
 * Set up tab functionality
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Load the content for selected tab
            const tabId = button.getAttribute('data-tab');
            loadTabContent(tabId);
        });
    });
}

/**
 * Load content for the selected tab
 * @param {string} tabId - The ID of the tab to load
 */
function loadTabContent(tabId) {
    const contentContainer = document.getElementById('tab-content-container');
    
    // Show loading indicator
    contentContainer.innerHTML = '<div class="loading">Loading content...</div>';
    
    // Special case for progress tab - redirect to full URL instead of AJAX loading
    if (tabId === 'progress') {
        // Use window.location to navigate to the full progress page URL
        window.location.href = `pages/${tabId}.html?t=${new Date().getTime()}`;
        return; // Don't continue with AJAX loading
    }
    
    // For all other tabs, fetch via AJAX as usual
    fetch(`pages/${tabId}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Replace content with fetched HTML
            contentContainer.innerHTML = html;
            
            // Initialize any special elements in the loaded content
            initializeLoadedContent(tabId);
        })
        .catch(error => {
            console.error('Error loading tab content:', error);
            contentContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Content</h3>
                    <p>There was a problem loading the ${tabId} content. Please try again later.</p>
                </div>
            `;
        });
}

/**
 * Initialize special elements in loaded content
 * @param {string} tabId - The ID of the loaded tab
 */
function initializeLoadedContent(tabId) {
    // Initialize checkboxes for progress tracking if on the progress tab
    if (tabId === 'progress') {
        initializeCheckboxes();
        
        // Force Week 18 to be shown as the current week - increased priority
        setTimeout(function() {
            if (typeof displayWeekData === 'function') {
                console.log("Setting Week 18, 2025 as current week");
                displayWeekData(18, 2025);
                
                // Also try to force content visibility in case it's still hidden
                const week18Content = document.getElementById('content-week-18-2025');
                const week17Content = document.getElementById('content-week-17-2025');
                
                if (week18Content) {
                    week18Content.style.display = 'block';
                    console.log("Forcing Week 18 content display");
                }
                
                if (week17Content) {
                    week17Content.style.display = 'none';
                    console.log("Hiding Week 17 content");
                }
            }
        }, 500);
        
        // Second attempt with longer delay to ensure it works
        setTimeout(function() {
            if (typeof displayWeekData === 'function') {
                console.log("Second attempt: Setting Week 18, 2025 as current week");
                displayWeekData(18, 2025);
            }
        }, 1500);
    }
    
    // Initialize form validation if on the contact tab
    if (tabId === 'contact') {
        initializeContactForm();
    }
    
    // Initialize project filter if on the projects tab
    if (tabId === 'projects') {
        initializeProjectFilter();
    }
    
    // Initialize skills tabs if on the home tab
    if (tabId === 'home') {
        initializeSkillsTabs();
        initializeResearchTimeline();
    }
    
    // Initialize module tabs if on the stickforstats tab
    if (tabId === 'stickforstats') {
        initializeModuleTabs();
    }
    
    // Initialize citation chart if on the publications tab
    if (tabId === 'publications') {
        initializeCitationChart();
    }
    
    // Lazy load images and animations for all tabs
    initializeLazyLoading();
    initializeAnimations();
}

/**
 * Initialize checkboxes for saving state
 */
function initializeCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        // Get saved state from localStorage
        const savedState = localStorage.getItem(checkbox.id);
        if (savedState === 'true') {
            checkbox.checked = true;
        }
        
        // Save state when checkbox is clicked
        checkbox.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
        });
    });
}

/**
 * Initialize contact form
 */
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Show success message (in real implementation, would send data to server)
            alert('Thank you for your message! This is a demo form, so no message was actually sent.');
            contactForm.reset();
        });
    }
}

/**
 * Set up dark mode toggle
 */
function setupDarkModeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const darkModeStyles = document.getElementById('dark-mode-styles');
    const icon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    
    // Apply saved preference
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
        darkModeStyles.disabled = false;
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        darkModeStyles.disabled = !darkModeStyles.disabled;
        
        // Toggle icon
        if (icon.classList.contains('fa-moon')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        // Save preference
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
}

/**
 * Project Filter System
 */
function initializeProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get the filter value
                const filter = button.getAttribute('data-filter');
                
                // Filter the projects
                projectCards.forEach(card => {
                    if (filter === 'all') {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        const tags = card.querySelector('.project-tags').textContent.toLowerCase();
                        if (tags.includes(filter.toLowerCase())) {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'scale(1)';
                            }, 50);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'scale(0.8)';
                            setTimeout(() => {
                                card.style.display = 'none';
                            }, 300);
                        }
                    }
                });
            });
        });
    }
}

/**
 * Skills Tab System
 */
function initializeSkillsTabs() {
    const skillTabs = document.querySelectorAll('.skill-category-tab');
    const skillCharts = document.querySelectorAll('.skill-chart');
    
    if (skillTabs.length > 0 && skillCharts.length > 0) {
        skillTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                skillTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show the corresponding chart
                const category = tab.getAttribute('data-category');
                
                skillCharts.forEach(chart => {
                    if (chart.getAttribute('data-category') === category) {
                        chart.classList.add('active');
                    } else {
                        chart.classList.remove('active');
                    }
                });
            });
        });
    }
}

/**
 * Research Timeline Navigation
 */
function initializeResearchTimeline() {
    const prevBtn = document.querySelector('.timeline-nav.prev');
    const nextBtn = document.querySelector('.timeline-nav.next');
    const timelinePeriods = document.querySelectorAll('.timeline-period');
    const yearDisplay = document.querySelector('.timeline-year');
    
    if (prevBtn && nextBtn && timelinePeriods.length > 0) {
        let currentIndex = 0;
        
        // Function to update the displayed period
        const updateTimeline = () => {
            timelinePeriods.forEach((period, index) => {
                if (index === currentIndex) {
                    period.classList.add('active');
                    if (yearDisplay) {
                        yearDisplay.textContent = period.getAttribute('data-period');
                    }
                } else {
                    period.classList.remove('active');
                }
            });
        };
        
        // Initialize with first period
        updateTimeline();
        
        // Navigate to previous period
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateTimeline();
            }
        });
        
        // Navigate to next period
        nextBtn.addEventListener('click', () => {
            if (currentIndex < timelinePeriods.length - 1) {
                currentIndex++;
                updateTimeline();
            }
        });
    }
}

/**
 * StickForStats Module Tabs
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

/**
 * Lazy Loading for Images and Videos
 */
function initializeLazyLoading() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        // Lazy load images
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if (lazyImages.length > 0) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.getAttribute('data-src');
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Lazy load videos/iframes
        const lazyVideos = document.querySelectorAll('iframe[data-src]');
        
        if (lazyVideos.length > 0) {
            const videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        video.src = video.getAttribute('data-src');
                        video.removeAttribute('data-src');
                        observer.unobserve(video);
                    }
                });
            });
            
            lazyVideos.forEach(video => {
                videoObserver.observe(video);
            });
        }
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
        
        const lazyVideos = document.querySelectorAll('iframe[data-src]');
        lazyVideos.forEach(video => {
            video.src = video.getAttribute('data-src');
            video.removeAttribute('data-src');
        });
    }
}

/**
 * Citation Chart for Publications Page
 */
function initializeCitationChart() {
    const chartCanvas = document.getElementById('citation-trend');
    
    if (chartCanvas) {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            // Load Chart.js dynamically
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
            script.onload = () => createCitationChart(chartCanvas);
            document.head.appendChild(script);
        } else {
            createCitationChart(chartCanvas);
        }
    }
}

/**
 * Create and render the citation chart
 */
function createCitationChart(canvas) {
    // Sample citation data (update with your actual data)
    const data = {
        labels: ['2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 Q1', '2024 Q2'],
        datasets: [{
            label: 'Citations',
            data: [0, 2, 5, 8, 12, 15],
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Citation Growth Over Time'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Citations: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Citations'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time Period'
                    }
                }
            }
        }
    };
    
    new Chart(canvas, config);
}

/**
 * Initialize scroll animations for elements
 */
function initializeAnimations() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const animatedElements = document.querySelectorAll('.section, .publication, .project-card, .feature-card');
        
        if (animatedElements.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fadeInUp');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    }
}