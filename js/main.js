
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initNavbar();
    initScrollIndicator();
    initParallax();
    initMobileMenu();
    
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
        observer.observe(el);
    });
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
}

function initScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    document.body.appendChild(indicator);

    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        indicator.style.width = scrolled + '%';
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#!') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    initCourseSearch();
    initNewsletterForm();
    initAnimatedCounters();
});

function initCourseSearch() {
    const searchInput = document.getElementById('course-search') || document.getElementById('topic-search');
    const clearBtn = document.getElementById('clear-search-btn');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        filterTopics(query);
        
        if (query.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    });
}

function clearSearch() {
    const searchInput = document.getElementById('course-search') || document.getElementById('topic-search');
    const clearBtn = document.getElementById('clear-search-btn');
    
    if (searchInput) {
        searchInput.value = '';
        filterTopics('');
        clearBtn.classList.add('hidden');
    }
}

function filterTopics(query) {
    const topics = document.querySelectorAll('.topic-card, .course-card');
    let visibleCount = 0;
    
    topics.forEach(topic => {
        const title = topic.getAttribute('data-title') || '';
        const category = topic.getAttribute('data-category') || topic.getAttribute('data-subject') || '';
        const text = topic.textContent.toLowerCase();
        
        const matches = query === '' || 
                       title.toLowerCase().includes(query) ||
                       category.toLowerCase().includes(query) ||
                       text.includes(query);
        
        if (matches) {
            topic.style.display = 'block';
            visibleCount++;
        } else {
            topic.style.display = 'none';
        }
    });
    
    const container = document.getElementById('topics-container') || document.getElementById('courses-container') || document.getElementById('topics-grid');
    if (!container) return;
    
    let noResults = document.getElementById('no-results');
    if (visibleCount === 0 && query !== '') {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'no-results';
            noResults.className = 'col-span-full text-center py-12';
            noResults.innerHTML = '<p class="text-gray-500 text-lg">Темы не найдены. Попробуйте другой запрос.</p>';
            container.appendChild(noResults);
        }
    } else if (noResults) {
        noResults.remove();
    }
}

function filterByCategory(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-700', 'border-2', 'border-gray-200');
    });
    
    if (event && event.target) {
        event.target.classList.add('active', 'bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'text-white');
        event.target.classList.remove('bg-white', 'text-gray-700', 'border-2', 'border-gray-200');
    }
    
    const topics = document.querySelectorAll('.topic-card, .course-card');
    topics.forEach(topic => {
        const topicCategory = topic.getAttribute('data-category') || topic.getAttribute('data-subject') || '';
        
        if (category === 'all' || topicCategory === category) {
            topic.style.display = 'block';
        } else {
            topic.style.display = 'none';
        }
    });
    
    const searchInput = document.getElementById('course-search') || document.getElementById('topic-search');
    if (searchInput) {
        searchInput.value = '';
        clearSearch();
    }
}

function toggleFavorite(btn) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas', 'text-red-500');
        btn.classList.add('bg-red-50');
        showNotification('Курс добавлен в избранное');
    } else {
        icon.classList.remove('fas', 'text-red-500');
        icon.classList.add('far', 'text-gray-600');
        btn.classList.remove('bg-red-50');
        showNotification('Курс удален из избранного');
    }
}

function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('newsletter-email').value;
        const messageEl = document.getElementById('newsletter-message');
        
        messageEl.textContent = 'Спасибо за подписку! Проверьте вашу почту.';
        messageEl.className = 'text-sm text-green-200 mt-4';
        
        setTimeout(() => {
            form.reset();
            messageEl.textContent = '';
        }, 3000);
    });
}

function initAnimatedCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const text = element.textContent;
    const number = parseInt(text.replace(/[^0-9]/g, ''));
    const suffix = text.replace(/[0-9]/g, '');
    const duration = 2000;
    const increment = number / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            element.textContent = number + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 16);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-6 bg-white text-gray-800 px-6 py-4 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas fa-check-circle text-green-500"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const advantages = {
    1: {
        title: 'Образовательная платформа Skystep',
        text: [
            'Всё обучение на нашей собственной онлайн-платформе.',
            'Все материалы, включая записи вебинаров, домашки и база задач - на одной платформе.'
        ]
    },
    2: {
        title: 'Вебинары и видеоуроки',
        text: [
            'Основа нашего подхода - онлайн-вебинары и видеоуроки.',
            'Разбирай задачи с преподавателями онлайн, задавай вопросы и получай подробные ответы.'
        ]
    },
    3: {
        title: 'ДЗ по 1-й части ЕГЭ с автопроверкой',
        text: [
            'Регулярные тренировки и выполнения заданий в срок - залог успеха и правильного подхода к достижению цели.',
            'Возможность задать вопрос по задаче и получить ответ сразу в домашней работе.'
        ]
    },
    4: {
        title: 'Разборы пробных вариантов ЕГЭ',
        text: [
            'Скачивайте, распечатывайте и решайте регулярные пробники.',
            'Загружайте на платформу и получайте баллы в соответствии с критериями оценки ЕГЭ.'
        ]
    }
};

function showAdvantage(num) {
    document.querySelectorAll('.advantage-nav-btn').forEach((btn, index) => {
        if (index + 1 === num) {
            btn.classList.add('active', 'bg-blue-600', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
        } else {
            btn.classList.remove('active', 'bg-blue-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
        }
    });

    const advantage = advantages[num];
    if (!advantage) return;

    const content = document.getElementById('advantage-content');
    content.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <span class="text-sm font-semibold text-blue-600">0${num} из 9</span>
        </div>
        <h3 class="text-3xl md:text-4xl font-black text-gray-800 mb-6">
            ${advantage.title}
        </h3>
        <div class="space-y-4 text-lg text-gray-600">
            ${advantage.text.map(p => `<p>${p}</p>`).join('')}
        </div>
    `;
}

function showStatsYear(year) {
    document.querySelectorAll('.stat-tab').forEach(tab => {
        tab.classList.remove('active', 'bg-white/30');
        tab.classList.add('bg-white/10', 'text-white/80');
    });
    event.target.classList.add('active', 'bg-white/30');
    event.target.classList.remove('bg-white/10', 'text-white/80');
    
    const statsContent = document.getElementById('stats-content');
    const stats = {
        'platform': [
            { value: '444', text: 'курса и интенсива на платформе' },
            { value: '6 560+', text: 'вебинаров мы провели в 2024 году' },
            { value: '77 600+', text: 'пользователей были с нами в 2024 году' }
        ],
        '2024': [
            { value: '98%', text: 'успешных выпускников' },
            { value: '245', text: 'стобалльников' },
            { value: '89', text: 'средний балл по ЕГЭ' }
        ],
        '2023': [
            { value: '97%', text: 'успешных выпускников' },
            { value: '198', text: 'стобалльников' },
            { value: '87', text: 'средний балл по ЕГЭ' }
        ]
    };
    
    const currentStats = stats[year] || stats['platform'];
    statsContent.innerHTML = currentStats.map((stat, index) => `
        <div class="stat-card scroll-reveal">
            <div class="stat-number mb-4" data-value="${stat.value.replace(/[^0-9]/g, '')}">${stat.value}</div>
            <p class="text-lg opacity-90">${stat.text}</p>
        </div>
    `).join('');
    
    initAnimatedCounters();
}

function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    
    if (parallaxElements.length === 0) return;
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrolled;
            const elementHeight = rect.height;
            const windowHeight = window.innerHeight;
            
            if (rect.bottom >= 0 && rect.top <= windowHeight) {
                const speed = 0.3;
                const yPos = -(scrolled - elementTop) * speed;
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
    });
}

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            const icon = document.getElementById('mobile-menu-icon');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    
    if (!mobileMenu || !icon) return;
    
    if (mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.remove('hidden');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        mobileMenu.classList.add('hidden');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}
