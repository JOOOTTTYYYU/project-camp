const AppState = {
    progress: JSON.parse(localStorage.getItem('skystep_progress') || '{}'),
    theme: localStorage.getItem('skystep_theme') || 'light',
    viewMode: localStorage.getItem('skystep_viewMode') || 'grid',
    stats: JSON.parse(localStorage.getItem('skystep_stats') || '{}'),
    recentViews: JSON.parse(localStorage.getItem('skystep_recentViews') || '[]'),
    topicFeedback: JSON.parse(localStorage.getItem('skystep_topicFeedback') || '{}')
};

function initFeatures() {
    if (typeof AppState === 'undefined') {
        console.error('AppState is not defined');
        return;
    }
    
    initTheme();
    initProgress();
    initViewMode();
    updateTopicsCount();
    updateProgressStats();
    updateRecentTopics();
    
    setTimeout(() => {
        updateProgressIndicators();
    }, 100);
}

function searchTopics() {
    const searchTerm = document.getElementById('topic-search')?.value.toLowerCase() || '';
    const topics = document.querySelectorAll('.topic-card');
    let visibleCount = 0;
    
    topics.forEach(topic => {
        const title = (topic.dataset.title || '').toLowerCase();
        const category = (topic.dataset.category || topic.dataset.subject || '').toLowerCase();
        const content = topic.textContent.toLowerCase();
        
        const matches = title.includes(searchTerm) || 
                       category.includes(searchTerm) || 
                       content.includes(searchTerm);
        
        if (matches && searchTerm) {
            highlightSearchTerm(topic, searchTerm);
        } else {
            removeHighlight(topic);
        }
        
        const isVisible = !searchTerm || matches;
        topic.style.display = isVisible ? 'block' : 'none';
        if (isVisible) visibleCount++;
    });
    
    updateTopicsCount(visibleCount);
    applyCurrentFilters();
}

function highlightSearchTerm(element, term) {
    const title = element.querySelector('h3');
    if (title && term) {
        const regex = new RegExp(`(${term})`, 'gi');
        title.innerHTML = title.textContent.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    }
}

function removeHighlight(element) {
    const title = element.querySelector('h3');
    if (title) {
        title.innerHTML = title.textContent;
    }
}

function sortTopics(mode) {
    const container = document.getElementById('topics-grid');
    if (!container) return;
    
    const topics = Array.from(container.querySelectorAll('.topic-card'));
    
    topics.sort((a, b) => {
        const titleA = (a.dataset.title || '').toLowerCase();
        const titleB = (b.dataset.title || '').toLowerCase();
        
        if (mode === 'alphabet') {
            return titleA.localeCompare(titleB, 'ru');
        } else if (mode === 'popular') {
            const viewsA = AppState.stats[a.dataset.title]?.views || 0;
            const viewsB = AppState.stats[b.dataset.title]?.views || 0;
            return viewsB - viewsA;
        }
        return 0;
    });
    
    topics.forEach(topic => container.appendChild(topic));
}

function toggleViewMode() {
    const container = document.getElementById('topics-grid');
    const icon = document.getElementById('view-icon');
    if (!container || !icon) return;
    
    AppState.viewMode = AppState.viewMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem('skystep_viewMode', AppState.viewMode);
    
    if (AppState.viewMode === 'list') {
        container.classList.remove('grid', 'md:grid-cols-2', 'lg:grid-cols-3');
        container.classList.add('flex', 'flex-col', 'gap-4');
        icon.classList.remove('fa-th');
        icon.classList.add('fa-list');
        
        document.querySelectorAll('.topic-card').forEach(card => {
            card.classList.remove('grid');
            card.classList.add('flex', 'flex-row');
            const img = card.querySelector('.relative.h-32');
            if (img) {
                img.classList.remove('h-32', 'md:h-48');
                img.classList.add('w-48', 'h-32', 'flex-shrink-0');
            }
        });
    } else {
        container.classList.remove('flex', 'flex-col');
        container.classList.add('grid', 'md:grid-cols-2', 'lg:grid-cols-3');
        icon.classList.remove('fa-list');
        icon.classList.add('fa-th');
        
        document.querySelectorAll('.topic-card').forEach(card => {
            card.classList.remove('flex', 'flex-row');
            const img = card.querySelector('.relative');
            if (img) {
                img.classList.remove('w-48');
                img.classList.add('h-32', 'md:h-48');
            }
        });
    }
}


function renderRatingStars(topicTitle, rating) {
    if (typeof rating === 'undefined' || rating === null) {
        const ratings = JSON.parse(localStorage.getItem('skystep_ratings') || '{}');
        rating = ratings[topicTitle] || 0;
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += `<i class="fas fa-star text-yellow-400 text-xs cursor-pointer hover:text-yellow-500" onclick="rateTopic('${topicTitle}', ${i + 1}, event)"></i>`;
    }
    if (hasHalfStar) {
        html += `<i class="fas fa-star-half-alt text-yellow-400 text-xs cursor-pointer hover:text-yellow-500" onclick="rateTopic('${topicTitle}', ${fullStars + 1}, event)"></i>`;
    }
    for (let i = 0; i < emptyStars; i++) {
        html += `<i class="far fa-star text-yellow-400 text-xs cursor-pointer hover:text-yellow-500" onclick="rateTopic('${topicTitle}', ${fullStars + hasHalfStar + i + 1}, event)"></i>`;
    }
    html += `<span class="text-xs text-gray-500 ml-1">${rating > 0 ? rating.toFixed(1) : '0.0'}</span>`;
    return html;
}

function rateTopic(topicTitle, rating, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const ratings = JSON.parse(localStorage.getItem('skystep_ratings') || '{}');
    ratings[topicTitle] = rating;
    localStorage.setItem('skystep_ratings', JSON.stringify(ratings));
    
    updateRatingDisplay(topicTitle, rating);
}

function updateRatingDisplay(topicTitle, rating) {
    document.querySelectorAll(`[data-title="${topicTitle}"]`).forEach(card => {
        const ratingContainer = card.querySelector('.rating-container');
        if (ratingContainer) {
            ratingContainer.innerHTML = renderRatingStars(topicTitle, rating);
        }
    });
    
    if (typeof updateRatingDisplay === 'function' && window.updateRatingDisplay !== updateRatingDisplay) {
        if (window.updateRatingDisplay) window.updateRatingDisplay(topicTitle, rating);
    }
}

function markTopicComplete(topicTitle, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    if (!AppState.progress[topicTitle]) {
        AppState.progress[topicTitle] = { completed: false, date: null };
    }
    AppState.progress[topicTitle].completed = !AppState.progress[topicTitle].completed;
    AppState.progress[topicTitle].date = AppState.progress[topicTitle].completed ? new Date().toISOString() : null;
    
    localStorage.setItem('skystep_progress', JSON.stringify(AppState.progress));
    updateProgressIndicators();
    updateProgressStats();
    updateStreakCounter();
}

function updateProgressIndicators() {
    document.querySelectorAll('.topic-card').forEach(card => {
        const title = card.dataset.title;
        const progress = AppState.progress[title];
        let indicator = card.querySelector('.progress-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'progress-indicator absolute top-2 right-2 z-20';
            card.querySelector('.relative').appendChild(indicator);
        }
        
        if (progress?.completed) {
            indicator.innerHTML = '<i class="fas fa-check-circle text-green-500 bg-white rounded-full p-1"></i>';
        } else {
            indicator.innerHTML = '';
        }
    });
}

function updateProgressStats() {
    const total = document.querySelectorAll('.topic-card').length;
    const completed = Object.values(AppState.progress).filter(p => p.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const statsElement = document.getElementById('progress-stats');
    if (statsElement) {
        statsElement.innerHTML = `
            <div class="flex flex-wrap items-center gap-4 text-sm">
                <span class="stats-badge">
                    <i class="fas fa-check-circle"></i>
                    Изучено: <strong>${completed}/${total}</strong>
                </span>
                <span class="stats-badge">
                    <i class="fas fa-chart-line"></i>
                    Прогресс: <strong>${percentage}%</strong>
                </span>
                <div class="progress-bar" style="width: 150px; height: 8px;">
                    <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    
    updateStreakCounter();
}

function updateStreakCounter() {
    const today = new Date().toDateString();
    const lastStudy = localStorage.getItem('skystep_lastStudy');
    let streak = parseInt(localStorage.getItem('skystep_streak') || '0');
    
    if (lastStudy !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStudy === yesterday.toDateString()) {
            streak++;
        } else if (lastStudy !== today) {
            streak = 1;
        }
        
        localStorage.setItem('skystep_streak', streak);
        localStorage.setItem('skystep_lastStudy', today);
    }
    
    const streakElement = document.getElementById('streak-counter');
    if (streakElement) {
        streakElement.innerHTML = `
            <div class="stats-badge">
                <i class="fas fa-fire text-orange-500"></i>
                Дней подряд: <strong>${streak}</strong>
            </div>
        `;
    }
}

function updateTopicsCount(count) {
    const total = document.querySelectorAll('.topic-card').length;
    const visible = count !== undefined ? count : document.querySelectorAll('.topic-card[style*="display: block"], .topic-card:not([style*="display: none"])').length;
    const countElement = document.getElementById('topics-count');
    if (countElement) {
        countElement.textContent = `Найдено тем: ${visible} из ${total}`;
    }
}

function initTheme() {
    if (AppState.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-theme');
    }
    updateThemeToggle();
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('skystep_theme', AppState.theme);
    
    if (AppState.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-theme');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-theme');
    }
    updateThemeToggle();
}

function updateThemeToggle() {
    const toggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    toggles.forEach(toggle => {
        if (toggle) {
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-sun', 'fa-moon');
                icon.classList.add(AppState.theme === 'dark' ? 'fa-sun' : 'fa-moon');
            }
        }
    });
}

function initProgress() {
    updateProgressIndicators();
}

function initViewMode() {
    if (AppState.viewMode === 'list') {
        setTimeout(() => toggleViewMode(), 100);
    }
}

function trackTopicView(topicTitle) {
    if (!AppState.stats[topicTitle]) {
        AppState.stats[topicTitle] = { views: 0, firstView: Date.now() };
    }
    AppState.stats[topicTitle].views++;
    AppState.stats[topicTitle].lastView = Date.now();
    localStorage.setItem('skystep_stats', JSON.stringify(AppState.stats));
    
    if (!AppState.recentViews.includes(topicTitle)) {
        AppState.recentViews.unshift(topicTitle);
        if (AppState.recentViews.length > 5) {
            AppState.recentViews = AppState.recentViews.slice(0, 5);
        }
    } else {
        AppState.recentViews = AppState.recentViews.filter(t => t !== topicTitle);
        AppState.recentViews.unshift(topicTitle);
    }
    localStorage.setItem('skystep_recentViews', JSON.stringify(AppState.recentViews));
    updateRecentTopics();
}

function updateRecentTopics() {
    const container = document.getElementById('recent-topics');
    const list = document.getElementById('recent-topics-list');
    if (!container || !list) return;
    
    if (AppState.recentViews.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    list.innerHTML = '';
    
    AppState.recentViews.forEach(topicTitle => {
        const topicCard = document.querySelector(`[data-title="${topicTitle}"]`);
        if (topicCard) {
            const subject = topicCard.dataset.subject || topicCard.dataset.category || '';
            const badge = document.createElement('a');
            badge.href = '#';
            badge.className = 'text-sm transition-all';
            badge.textContent = topicTitle;
            badge.onclick = function(e) {
                e.preventDefault();
                openTopicModal(topicCard);
            };
            list.appendChild(badge);
        }
    });
}

function getSimilarTopics(topicTitle) {
    const currentCard = document.querySelector(`[data-title="${topicTitle}"]`);
    if (!currentCard) return [];
    
    const currentSubject = currentCard.dataset.subject || currentCard.dataset.category || '';
    const allTopics = Array.from(document.querySelectorAll('.topic-card'));
    
    return allTopics
        .filter(card => {
            const subject = card.dataset.subject || card.dataset.category || '';
            return subject === currentSubject && card.dataset.title !== topicTitle;
        })
        .slice(0, 3)
        .map(card => ({
            title: card.dataset.title,
            subject: card.dataset.subject || card.dataset.category || '',
            card: card
        }));
}

function showTopicFeedback(topicTitle) {
    const feedback = AppState.topicFeedback[topicTitle] || null;
    const modal = document.getElementById('topic-modal');
    if (!modal) return;
    
    const feedbackSection = modal.querySelector('#topic-feedback-section');
    if (!feedbackSection) {
        const modalBody = document.getElementById('topic-modal-body');
        if (modalBody) {
            const section = document.createElement('div');
            section.id = 'topic-feedback-section';
            section.className = 'mt-8 pt-6 border-t border-gray-200';
            section.innerHTML = `
                <h3 class="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Оцените полезность</h3>
                <p class="text-gray-600 mb-4 dark:text-gray-300">Помогла ли вам эта карточка решить задачу?</p>
                <div class="flex gap-4">
                    <button onclick="submitTopicFeedback('${topicTitle}', true)" class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all">
                        <i class="fas fa-check mr-2"></i> Да, помогла
                    </button>
                    <button onclick="submitTopicFeedback('${topicTitle}', false)" class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all">
                        <i class="fas fa-times mr-2"></i> Нет, не помогла
                    </button>
                </div>
                ${feedback ? `<p class="mt-4 text-sm text-gray-500">Спасибо за ваш отзыв!</p>` : ''}
            `;
            modalBody.appendChild(section);
        }
    }
}

function submitTopicFeedback(topicTitle, helpful) {
    AppState.topicFeedback[topicTitle] = {
        helpful: helpful,
        date: Date.now()
    };
    localStorage.setItem('skystep_topicFeedback', JSON.stringify(AppState.topicFeedback));
    
    const section = document.getElementById('topic-feedback-section');
    if (section) {
        section.innerHTML = `
            <h3 class="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Оцените полезность</h3>
            <p class="text-green-600 font-semibold">
                <i class="fas fa-check-circle mr-2"></i>
                Спасибо за ваш отзыв! Ваше мнение помогает нам улучшать платформу.
            </p>
        `;
    }
}

function applyCurrentFilters() {
    const subject = document.getElementById('filter-subject')?.value || 'all';
    const searchTerm = document.getElementById('topic-search')?.value.toLowerCase() || '';
    
    document.querySelectorAll('.topic-card').forEach(topic => {
        const topicSubject = topic.dataset.subject || topic.dataset.category || '';
        const matchesSubject = subject === 'all' || topicSubject === subject;
        const matchesSearch = !searchTerm || 
            (topic.dataset.title || '').toLowerCase().includes(searchTerm) ||
            topicSubject.toLowerCase().includes(searchTerm);
        
        topic.style.display = (matchesSubject && matchesSearch) ? 'block' : 'none';
    });
    
    updateTopicsCount();
}

function shareTopic(topicTitle, event) {
    if (event) event.stopPropagation();
    
    const url = window.location.href.split('#')[0] + `#topic-${encodeURIComponent(topicTitle)}`;
    
    if (navigator.share) {
        navigator.share({
            title: topicTitle,
            text: `Изучи тему "${topicTitle}" на Skystep`,
            url: url
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Ссылка скопирована!');
        });
    }
}

function printTopic() {
    const modal = document.getElementById('topic-modal');
    if (!modal) return;
    
    const printContent = modal.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function markTrainingComplete(topicTitle, index) {
    if (!AppState.progress[topicTitle]) {
        AppState.progress[topicTitle] = { completed: false, training: [] };
    }
    if (!AppState.progress[topicTitle].training) {
        AppState.progress[topicTitle].training = [];
    }
    
    const trainingIndex = AppState.progress[topicTitle].training.indexOf(index);
    if (trainingIndex > -1) {
        AppState.progress[topicTitle].training.splice(trainingIndex, 1);
    } else {
        AppState.progress[topicTitle].training.push(index);
    }
    
    localStorage.setItem('skystep_progress', JSON.stringify(AppState.progress));
}

function showTrainingAnswers(topicTitle) {
    const answers = document.querySelectorAll(`[data-topic="${topicTitle}"] .training-answer`);
    answers.forEach(answer => {
        answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
    });
}

function reportError(topicTitle, event) {
    if (event) event.stopPropagation();
    
    const error = prompt('Опишите ошибку или проблему:');
    if (error) {
        console.log('Error report:', { topic: topicTitle, error });
        showNotification('Спасибо за обратную связь!');
    }
}

function renderTopicMap() {
    const container = document.getElementById('topic-map-container');
    if (!container) return;
    
    if (typeof topicMap === 'undefined') {
        console.warn('topicMap is not defined');
        return;
    }
    
    let html = '<div class="topic-map">';
    html += '<h2 class="text-lg font-bold mb-3 cursor-pointer" onclick="toggleTopicMap()">';
    html += '<i class="fas fa-chevron-right mr-2 transform transition-transform" id="topic-map-icon"></i>';
    html += '<span>Карта тем</span>';
    html += '</h2>';
    html += '<div id="topic-map-content" class="hidden">';
    html += '<div class="topic-map-subjects">';
    
    Object.keys(topicMap).forEach(subject => {
        html += '<div class="topic-map-subject">';
        html += '<h3 class="cursor-pointer" onclick="toggleSubject(\'' + subject + '\')">';
        html += '<i class="fas fa-chevron-right" id="icon-' + subject + '"></i>';
        html += '<span>' + subject + '</span>';
        html += '</h3>';
        html += '<div id="subject-' + subject + '" class="hidden">';
        
        Object.keys(topicMap[subject]).forEach(grade => {
            html += '<div class="topic-map-grade">';
            html += '<h4 class="cursor-pointer" onclick="toggleGrade(\'' + subject + '\', \'' + grade + '\')">';
            html += '<i class="fas fa-chevron-right" id="icon-' + subject + '-' + grade + '"></i>';
            html += '<span>' + grade + '</span>';
            html += '</h4>';
            html += '<div id="grade-' + subject + '-' + grade + '" class="hidden">';
            
            Object.keys(topicMap[subject][grade]).forEach(section => {
                html += '<div class="topic-map-section">';
                html += '<h5 class="cursor-pointer" onclick="toggleSection(\'' + subject + '\', \'' + grade + '\', \'' + section + '\')">';
                html += '<i class="fas fa-chevron-right" id="icon-' + subject + '-' + grade + '-' + section + '"></i>';
                html += '<span>' + section + '</span>';
                html += '</h5>';
                html += '<div id="section-' + subject + '-' + grade + '-' + section + '" class="hidden">';
                
                topicMap[subject][grade][section].forEach(topic => {
                    const topicCard = document.querySelector('[data-title="' + topic + '"]');
                    if (topicCard) {
                        html += '<div class="topic-map-item">';
                        html += '<a href="#" onclick="event.preventDefault(); openTopicModal(document.querySelector(\'[data-title=\\\'' + topic + '\\\']\')); return false;">' + topic + '</a>';
                        html += '</div>';
                    } else {
                        html += '<div class="topic-map-item">';
                        html += '<span style="color: #94a3b8;">' + topic + '</span>';
                        html += '</div>';
                    }
                });
                
                html += '</div>';
                html += '</div>';
            });
            
            html += '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    html += '</div>';
    container.innerHTML = html;
}

function toggleTopicMap() {
    const content = document.getElementById('topic-map-content');
    const icon = document.getElementById('topic-map-icon');
    if (content && icon) {
        content.classList.toggle('hidden');
        icon.classList.toggle('rotate-90');
    }
}

function toggleSubject(subject) {
    const element = document.getElementById('subject-' + subject);
    const icon = document.getElementById('icon-' + subject);
    const header = icon ? icon.closest('h3') : null;
    if (element && icon) {
        element.classList.toggle('hidden');
        icon.classList.toggle('rotate-90');
        if (header) {
            header.classList.toggle('active');
        }
    }
}

function toggleGrade(subject, grade) {
    const element = document.getElementById('grade-' + subject + '-' + grade);
    const icon = document.getElementById('icon-' + subject + '-' + grade);
    const header = icon ? icon.closest('h4') : null;
    if (element && icon) {
        element.classList.toggle('hidden');
        icon.classList.toggle('rotate-90');
        if (header) {
            header.classList.toggle('active');
        }
    }
}

function toggleSection(subject, grade, section) {
    const element = document.getElementById('section-' + subject + '-' + grade + '-' + section);
    const icon = document.getElementById('icon-' + subject + '-' + grade + '-' + section);
    const header = icon ? icon.closest('h5') : null;
    if (element && icon) {
        element.classList.toggle('hidden');
        icon.classList.toggle('rotate-90');
        if (header) {
            header.classList.toggle('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (typeof initFeatures === 'function') {
        initFeatures();
    }
    if (document.getElementById('topic-map-container')) {
        setTimeout(() => {
            renderTopicMap();
        }, 500);
    }
});

