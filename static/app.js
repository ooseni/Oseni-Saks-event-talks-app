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
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const resultsCount = document.getElementById('results-count');
    const lastUpdated = document.getElementById('last-updated');
    const toastContainer = document.getElementById('toast-container');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    // Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelTweetBtn = document.getElementById('cancel-tweet-btn');
    const sendTweetBtn = document.getElementById('send-tweet-btn');
    const contextPreviewText = document.getElementById('context-preview-text');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCounter = document.getElementById('char-counter');
    const progressRingCircle = document.getElementById('progress-ring-circle');
    const tweetWarningMsg = document.getElementById('tweet-warning-msg');

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
            
            // Save to Local Storage Cache
            localStorage.setItem('bq_releases_cache', JSON.stringify(releaseData));
            updateLastUpdatedTime(new Date());
            
            exportCsvBtn.disabled = releaseData.length === 0;
            renderReleases();
        } catch (error) {
            exportCsvBtn.disabled = true;
            // If we have cached data, don't show full screen error, just toast it
            if (releaseData && releaseData.length > 0) {
                hideLoader();
                showToast("Failed to refresh. Showing offline cached version.");
            } else {
                showError(error.message);
            }
        }
    }

    // UI State Switchers
    function showLoader() {
        refreshBtn.classList.add('spinning');
        refreshBtn.disabled = true;
        exportCsvBtn.disabled = true;
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
        let matchCount = 0;
        let totalCount = 0;

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
                matchCount += filteredUpdates.length;

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
                            <button class="copy-action-btn" title="Copy text to clipboard">
                                <i class="fa-regular fa-copy"></i>
                                <span>Copy</span>
                            </button>
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

                    // Handle Copy button click
                    const copyBtn = card.querySelector('.copy-action-btn');
                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const plainText = getPlainText(update.content).replace(/\s+/g, ' ').trim();
                        navigator.clipboard.writeText(`[${entry.date}] ${update.type}: ${plainText}`)
                            .then(() => {
                                // Double feedback: button text change + global toast popup
                                const icon = copyBtn.querySelector('i');
                                const span = copyBtn.querySelector('span');
                                icon.className = 'fa-solid fa-check';
                                span.textContent = 'Copied!';
                                copyBtn.classList.add('copied');
                                showToast("Update copied to clipboard");
                                setTimeout(() => {
                                    icon.className = 'fa-regular fa-copy';
                                    span.textContent = 'Copy';
                                    copyBtn.classList.remove('copied');
                                }, 2000);
                            });
                    });

                    dateGroup.appendChild(card);
                });

                releasesContainer.appendChild(dateGroup);
            }
        });

        // Update Filter/Result count indicator
        if (searchQuery || currentFilter !== 'all') {
            resultsCount.textContent = `Found ${matchCount} matching update${matchCount === 1 ? '' : 's'} out of ${totalCount}`;
            resultsCount.classList.remove('hidden');
        } else {
            resultsCount.classList.add('hidden');
        }

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
            tweetWarningMsg.classList.remove('hidden');
        } else if (remaining <= 20) {
            progressRingCircle.style.stroke = 'var(--accent-orange)';
            charCounter.style.color = 'var(--accent-orange)';
            sendTweetBtn.disabled = false;
            sendTweetBtn.style.opacity = 1;
            tweetWarningMsg.classList.add('hidden');
        } else {
            progressRingCircle.style.stroke = 'var(--accent-teal)';
            charCounter.style.color = 'var(--text-secondary)';
            sendTweetBtn.disabled = false;
            sendTweetBtn.style.opacity = 1;
            tweetWarningMsg.classList.add('hidden');
        }
    }

    // Dynamic global toast popup
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Last updated timestamp display
    function updateLastUpdatedTime(date) {
        lastUpdated.textContent = `Last checked: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        lastUpdated.classList.remove('hidden');
    }

    // Initialize theme on load
    function initTheme() {
        const activeTheme = localStorage.getItem('theme') || 'dark';
        const icon = themeToggleBtn.querySelector('i');
        if (activeTheme === 'light') {
            document.body.classList.add('light-theme');
            icon.className = 'fa-solid fa-moon';
        } else {
            document.body.classList.remove('light-theme');
            icon.className = 'fa-solid fa-sun';
        }
    }

    // Toggle between light and dark themes
    function toggleTheme() {
        const icon = themeToggleBtn.querySelector('i');
        const isLight = document.body.classList.toggle('light-theme');
        if (isLight) {
            localStorage.setItem('theme', 'light');
            icon.className = 'fa-solid fa-moon';
            showToast("Swapped to light mode");
        } else {
            localStorage.setItem('theme', 'dark');
            icon.className = 'fa-solid fa-sun';
            showToast("Swapped to dark mode");
        }
    }

    // Local Storage Caching Loader
    function loadCachedReleases() {
        const cached = localStorage.getItem('bq_releases_cache');
        if (cached) {
            try {
                releaseData = JSON.parse(cached);
                exportCsvBtn.disabled = releaseData.length === 0;
                renderReleases();
                
                // Show offline last checks if cached
                const mockDate = new Date();
                updateLastUpdatedTime(mockDate);
            } catch (e) {
                localStorage.removeItem('bq_releases_cache');
            }
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
        if (e.target.value) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value;
            renderReleases();
        }, 200);
    });

    // Clear search keyword text
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearchBtn.classList.add('hidden');
        renderReleases();
    });

    // Export currently filtered releases to CSV
    function exportToCSV() {
        if (!releaseData || releaseData.length === 0) return;
        
        let csvRows = [['Date', 'Category', 'Update Content', 'Link']];
        
        releaseData.forEach(entry => {
            const filteredUpdates = entry.updates.filter(update => {
                const categoryMatch = currentFilter === 'all' || update.type.toLowerCase() === currentFilter.toLowerCase();
                const plainText = getPlainText(update.content).toLowerCase();
                const searchMatch = !searchQuery || 
                                    plainText.includes(searchQuery.toLowerCase()) || 
                                    update.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    entry.date.toLowerCase().includes(searchQuery.toLowerCase());
                return categoryMatch && searchMatch;
            });

            filteredUpdates.forEach(update => {
                const plainText = getPlainText(update.content).replace(/\s+/g, ' ').trim();
                const escapedText = plainText.replace(/"/g, '""');
                csvRows.push([
                    `"${entry.date}"`,
                    `"${update.type}"`,
                    `"${escapedText}"`,
                    `"${entry.link}"`
                ]);
            });
        });

        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        
        const timestamp = new Date().toISOString().slice(0, 10);
        link.setAttribute('download', `bigquery_releases_${currentFilter}_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Refresh, Retries, Close events
    refreshBtn.addEventListener('click', fetchReleases);
    retryBtn.addEventListener('click', fetchReleases);
    exportCsvBtn.addEventListener('click', exportToCSV);
    themeToggleBtn.addEventListener('click', toggleTheme);
    
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

    // Init page load: check cache first, then fetch background updates
    initTheme();
    loadCachedReleases();
    fetchReleases();
});
