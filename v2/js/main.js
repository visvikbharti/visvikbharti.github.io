/**
 * Main JavaScript for Vishal Bharti Portfolio v2
 * 
 * This file handles:
 * - Navigation functionality
 * - Theme switching
 * - Animations
 * - Project filtering
 * - Scroll behaviors
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all functions
  initNavbar();
  initThemeToggle();
  initProjectFilter();
  initScrollReveal();
  initCounters();
  
  // Log initialization for debugging
  console.log('Portfolio v2 initialized');
});

/**
 * Navbar functionality
 * - Toggle mobile menu
 * - Change navbar background on scroll
 * - Handle active link state
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const links = document.querySelectorAll('.nav-link');
  
  // Toggle mobile menu
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }
  
  // Add background to navbar on scroll
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
  
  // Handle active link state based on scroll position
  window.addEventListener('scroll', function() {
    let current = '';
    
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      // Adjust this value based on when you want the active state to change
      const scrollPosition = window.scrollY + 300;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
  
  // Close mobile menu when clicking a link
  links.forEach(link => {
    link.addEventListener('click', function() {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

/**
 * Theme toggle functionality
 * - Switch between light and dark mode
 * - Save preference in localStorage
 */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  
  // Check for saved user preference
  const savedTheme = localStorage.getItem('theme');
  
  // Apply saved theme or default
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    document.body.classList.remove('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
  
  // Listen for theme toggle click
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      localStorage.setItem('theme', 'light');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
  });
  
  // Also check system preference if no saved theme
  if (!savedTheme) {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('theme', 'dark');
    }
  }
}

/**
 * Project filtering functionality
 */
function initProjectFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterButtons.length === 0 || projectCards.length === 0) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Filter projects
      projectCards.forEach(card => {
        if (filter === 'all') {
          card.style.display = 'block';
        } else {
          const categories = card.getAttribute('data-category');
          if (categories && categories.includes(filter)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        }
      });
      
      // Animate filtered-in cards
      gsapAnimateFilteredCards();
    });
  });
}

/**
 * Animate filtered project cards with GSAP
 */
function gsapAnimateFilteredCards() {
  if (typeof gsap !== 'undefined') {
    gsap.from('.project-card:not([style*="display: none"])', {
      duration: 0.5,
      opacity: 0,
      y: 20,
      stagger: 0.1,
      ease: "power2.out"
    });
  }
}

/**
 * Scroll reveal animations
 * Uses Intersection Observer to trigger animations when elements come into view
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length === 0) return;
  
  const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const revealObserver = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
  
  // Initialize GSAP ScrollTrigger if available
  initGSAPScrollTriggers();
}

/**
 * Initialize GSAP ScrollTrigger animations
 */
function initGSAPScrollTriggers() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Hero section animations
    gsap.from('.hero-title', {
      duration: 1.2,
      y: 50,
      opacity: 0,
      ease: 'power3.out'
    });
    
    gsap.from('.hero-tagline', {
      duration: 1.2,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.3
    });
    
    gsap.from('.hero-actions', {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.6
    });
    
    // Section titles animation
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out'
      });
    });
    
    // Project cards staggered animation
    gsap.from('.project-card', {
      scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      duration: 0.8,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }
}

/**
 * Animate number counters
 */
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  if (counters.length === 0) return;
  
  const options = {
    threshold: 1,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-count'));
        let count = 0;
        const duration = 2000; // ms
        const interval = duration / target;
        
        const timer = setInterval(function() {
          count++;
          counter.textContent = count;
          
          if (count >= target) {
            clearInterval(timer);
          }
        }, interval);
        
        observer.unobserve(counter);
      }
    });
  }, options);
  
  counters.forEach(counter => {
    observer.observe(counter);
  });
}

/**
 * Handle smooth scrolling for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});