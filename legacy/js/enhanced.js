/**
 * Enhanced JavaScript functionality for Vishal Bharti's portfolio
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all enhanced functionality
    initializeProjectFilter();
    initializeSkillsTabs();
    initializeResearchTimeline();
    initializeLazyLoading();
    initializeCitationChart();
    initializeAnimations();
    initializeConfidenceIntervals(); // Add the new initialization
});

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
            data: [0, 0, 0, 1, 1, 2],
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
        const animatedElements = document.querySelectorAll('.section, .publication, .project-card, .feature-card, .confidence-feature-item');
        
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

/**
 * Initialize Confidence Intervals Explorer specific functionality
 */
function initializeConfidenceIntervals() {
    // Handle tab navigation if on the confidence intervals page
    if (document.querySelector('.confidence-feature-grid')) {
        initializeFeatureHover();
        initializeMathRendering();
    }
    
    // Add confidence tab to module tabs if on StickForStats page
    const moduleTabs = document.querySelector('.module-tabs');
    if (moduleTabs && !document.querySelector('.module-tab[data-module="education"]')) {
        const educationTab = document.createElement('button');
        educationTab.className = 'module-tab';
        educationTab.setAttribute('data-module', 'education');
        educationTab.textContent = 'Educational Tools';
        moduleTabs.appendChild(educationTab);
        
        // Reinitialize module tabs
        initializeModuleTabs();
    }
}

/**
 * Add hover effects to feature cards
 */
function initializeFeatureHover() {
    const featureItems = document.querySelectorAll('.confidence-feature-item');
    
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.confidence-feature-icon i');
            if (icon) {
                icon.classList.add('fa-bounce');
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.confidence-feature-icon i');
            if (icon) {
                icon.classList.remove('fa-bounce');
            }
        });
    });
}

/**
 * Initialize math formula rendering
 */
function initializeMathRendering() {
    // Check if MathJax is already loaded
    if (typeof MathJax === 'undefined') {
        // Load MathJax for rendering mathematical formulas
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        document.head.appendChild(script);
        
        // Configure MathJax
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true
            },
            options: {
                ignoreHtmlClass: 'tex2jax_ignore',
                processHtmlClass: 'tex2jax_process'
            }
        };
    } else {
        // If MathJax is already loaded, typeset the page
        MathJax.typeset();
    }
}

/**
 * Module Tabs Initialization (for StickForStats page)
 * This function assumes a pre-existing initializeModuleTabs or adds compatibility
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