document.addEventListener('DOMContentLoaded', () => {
    // State management
    let releaseData = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let selectedUpdate = null;

    // DOM Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const searchInput = document.getElementById('search-input');
    const filterTags = document.querySelectorAll('.filter-tag');
    const skeletonLoader = document.getElementById('skeleton-loader');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-btn');
    const emptyState = document.getElementById('empty-state');
    const releasesContainer = document.getElementById('releases-container');

    // Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelTweetBtn = document.getElementById('cancel-tweet-btn');
    const sendTweetBtn = document.getElementById('send-tweet-btn');
    const contextPreviewText = document.getElementById('context-preview-text');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCounter = document.getElementById('char-counter');
    const progressRingCircle = document.getElementById('progress-ring-circle');

    // Circular Progress Setup for Character Counter
    const radius = progressRingCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressRingCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressRingCircle.style.strokeDashoffset = circumference;

    // Set progress ring offset based on characters
    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        progressRingCircle.style.strokeDashoffset = offset;
    }

    // Convert HTML block to plain text helper
    function getPlainText(html) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        // Strip code block text slightly nicer or just plain text
        return tempDiv.textContent || tempDiv.innerText || "";
    }

    // Fetch releases from Backend API
    async function fetchReleases() {
        showLoader();
        try {
            const response = await fetch('/api/releases');
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Server error occurred');
            }
            const data = await response.json();
            releaseData = data.releases;
            renderReleases();
        } catch (error) {
            showError(error.message);
        }
    }

    // UI State Switchers
    function showLoader() {
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
        skeletonLoader.classList.remove('hidden');
        releasesContainer.classList.add('hidden');
        errorState.classList.add('hidden');
        emptyState.classList.add('hidden');
    }

    function hideLoader() {
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
        skeletonLoader.classList.add('hidden');
    }

    function showError(msg) {
        hideLoader();
        errorMessage.textContent = msg;
        errorState.classList.remove('hidden');
        releasesContainer.classList.add('hidden');
    }

    // Render Releases with Filters
    function renderReleases() {
        hideLoader();
        releasesContainer.innerHTML = '';
        
        let hasContent = false;

        releaseData.forEach(entry => {
            // Filter the updates in this entry
            const filteredUpdates = entry.updates.filter(update => {
                // Category match
                const categoryMatch = currentFilter === 'all' || update.type.toLowerCase() === currentFilter.toLowerCase();
                
                // Text search match
                const plainText = getPlainText(update.content).toLowerCase();
                const searchMatch = !searchQuery || 
                                    plainText.includes(searchQuery.toLowerCase()) || 
                                    update.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    entry.date.toLowerCase().includes(searchQuery.toLowerCase());
                
                return categoryMatch && searchMatch;
            });

            if (filteredUpdates.length > 0) {
                hasContent = true;

                // Create date grouping element
                const dateGroup = document.createElement('div');
                dateGroup.className = 'date-group';

                const heading = document.createElement('div');
                heading.className = 'date-heading';
                heading.innerHTML = `<i class="fa-regular fa-calendar"></i> ${entry.date}`;
                dateGroup.appendChild(heading);

                // Add cards for each update
                filteredUpdates.forEach(update => {
                    const card = document.createElement('div');
                    card.className = 'card update-card';
                    card.id = `card-${entry.date.replace(/[^a-zA-Z0-9]/g, '')}-${update.type}`;
                    
                    const badgeClass = `badge-${update.type.toLowerCase()}`;
                    
                    card.innerHTML = `
                        <div class="card-header-meta">
                            <span class="category-badge ${badgeClass}">${update.type}</span>
                        </div>
                        <div class="update-body">
                            ${update.content}
                        </div>
                        <div class="card-actions">
                            <button class="tweet-action-btn" title="Tweet this update">
                                <i class="fa-brands fa-x-twitter"></i>
                                <span>Tweet Update</span>
                            </button>
                        </div>
                    `;

                    // Handle card click to select
                    card.addEventListener('click', (e) => {
                        // Prevent click triggers from buttons
                        if (e.target.closest('.tweet-action-btn') || e.target.closest('a')) {
                            return;
                        }
                        
                        // Select/Deselect
                        document.querySelectorAll('.update-card').forEach(c => c.classList.remove('selected'));
                        
                        if (selectedUpdate && selectedUpdate.cardId === card.id) {
                            selectedUpdate = null;
                        } else {
                            card.classList.add('selected');
                            selectedUpdate = {
                                cardId: card.id,
                                date: entry.date,
                                type: update.type,
                                content: update.content,
                                link: entry.link
                            };
                        }
                    });

                    // Handle Tweet button click
                    const tweetBtn = card.querySelector('.tweet-action-btn');
                    tweetBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openTweetComposer(entry.date, update.type, update.content, entry.link);
                    });

                    dateGroup.appendChild(card);
                });

                releasesContainer.appendChild(dateGroup);
            }
        });

        if (hasContent) {
            releasesContainer.classList.remove('hidden');
            emptyState.classList.add('hidden');
        } else {
            releasesContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
        }
    }

    // Tweet Modal Logic
    function openTweetComposer(date, type, content, link) {
        const plainText = getPlainText(content).replace(/\s+/g, ' ').trim();
        contextPreviewText.textContent = `[${date}] ${type}: ${plainText}`;
        
        // Formulate highly engaging default tweet template
        let emoji = '🚀';
        let prefix = `New BigQuery ${type}`;
        
        switch (type.toLowerCase()) {
            case 'change':
                emoji = '⚙️';
                prefix = 'BigQuery Change';
                break;
            case 'breaking':
                emoji = '⚠️';
                prefix = 'BigQuery Breaking Change';
                break;
            case 'announcement':
                emoji = '📢';
                prefix = 'BigQuery Announcement';
                break;
            case 'issue':
                emoji = '🛠️';
                prefix = 'BigQuery Issue';
                break;
        }

        // Calculate available size (280 - tags - URL links if any)
        // X intents shorten URLs automatically, but let's be safe.
        const tags = " #BigQuery #GoogleCloud";
        const overheadLen = emoji.length + prefix.length + tags.length + 6; // formatting spaces
        const availableTextLen = 280 - overheadLen;
        
        let displayContent = plainText;
        if (displayContent.length > availableTextLen) {
            displayContent = displayContent.substring(0, availableTextLen - 3) + '...';
        }

        tweetTextarea.value = `${emoji} ${prefix}: ${displayContent}${tags}`;
        
        updateCharCounter();
        
        tweetModal.classList.add('show');
    }

    function closeTweetComposer() {
        tweetModal.classList.remove('show');
    }

    function updateCharCounter() {
        const currentLen = tweetTextarea.value.length;
        const remaining = 280 - currentLen;
        
        charCounter.textContent = remaining;
        
        // Update circular ring progress
        const percent = Math.min(100, (currentLen / 280) * 100);
        setProgress(percent);

        // Color schemes for warnings
        if (remaining < 0) {
            progressRingCircle.style.stroke = 'var(--accent-red)';
            charCounter.style.color = 'var(--accent-red)';
            sendTweetBtn.disabled = true;
            sendTweetBtn.style.opacity = 0.5;
        } else if (remaining <= 20) {
            progressRingCircle.style.stroke = 'var(--accent-orange)';
            charCounter.style.color = 'var(--accent-orange)';
            sendTweetBtn.disabled = false;
            sendTweetBtn.style.opacity = 1;
        } else {
            progressRingCircle.style.stroke = 'var(--accent-teal)';
            charCounter.style.color = 'var(--text-secondary)';
            sendTweetBtn.disabled = false;
            sendTweetBtn.style.opacity = 1;
        }
    }

    // Event Listeners for Filters
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilter = tag.getAttribute('data-category');
            renderReleases();
        });
    });

    // Search input handler with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            renderReleases();
        }, 200);
    });

    // Refresh, Retries, Close events
    refreshBtn.addEventListener('click', fetchReleases);
    retryBtn.addEventListener('click', fetchReleases);
    
    closeModalBtn.addEventListener('click', closeTweetComposer);
    cancelTweetBtn.addEventListener('click', closeTweetComposer);
    
    tweetTextarea.addEventListener('input', updateCharCounter);

    // Modal click out to close
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetComposer();
        }
    });

    // Send/Broadcast Tweet
    sendTweetBtn.addEventListener('click', () => {
        const text = encodeURIComponent(tweetTextarea.value);
        const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(twitterIntentUrl, '_blank', 'noopener,noreferrer');
        closeTweetComposer();
    });

    // Init page load
    fetchReleases();
});
