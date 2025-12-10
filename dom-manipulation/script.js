// ===================================
// 1. DATA SETUP & SERVER SIMULATION
// ===================================
const SERVER_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

// Global variable for generating unique client-side IDs
let nextQuoteId = 1000;
function generateUniqueId() {
    return nextQuoteId++;
}

// Initial default quotes array
let quotes = [
    { id: generateUniqueId(), text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { id: generateUniqueId(), text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { id: generateUniqueId(), text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
];

const SYNC_INTERVAL_MS = 60000; // Check every 60 seconds (adjust for testing)

// ===================================
// 2. CORE STORAGE FUNCTIONS (Local Storage)
// ===================================

/** Saves the current quotes array to Local Storage. */
function saveQuotes() {
    localStorage.setItem('localQuotes', JSON.stringify(quotes));
}

/** Loads quotes from Local Storage on application initialization. */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('localQuotes');

    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
        // Ensure nextQuoteId is higher than any existing ID
        const maxId = quotes.reduce((max, quote) => Math.max(max, quote.id || 0), nextQuoteId);
        nextQuoteId = maxId + 1;
    }
}

// ===================================
// 3. SERVER SYNC & CONFLICT RESOLUTION
// ===================================

/** Helper function to display temporary UI notifications. */
function displayNotification(message, isError = false) {
    let notificationArea = document.getElementById('notificationArea');
    if (!notificationArea) {
        notificationArea = document.createElement('div');
        notificationArea.id = 'notificationArea';
        notificationArea.style.cssText = 'padding:10px; margin-top:15px; border-radius:4px; transition:all 0.5s;';
        document.body.insertBefore(notificationArea, document.body.firstChild.nextSibling); // Insert near the top
    }

    notificationArea.textContent = message;
    notificationArea.style.backgroundColor = isError ? '#fdd' : '#dfd';
    notificationArea.style.border = `1px solid ${isError ? '#c33' : '#3c3'}`;

    setTimeout(() => {
        notificationArea.textContent = '';
        notificationArea.style.backgroundColor = 'transparent';
        notificationArea.style.border = 'none';
    }, 5000);
}

/** Fetches quotes from the mock server endpoint. */
async function fetchServerQuotes() {
    try {
        const response = await fetch(`${SERVER_ENDPOINT}?_limit=5`); // Simulate fetching 5 server items
        if (!response.ok) throw new Error('Server response was not OK');
        const serverPosts = await response.json();

        // Map mock server posts to our quote structure
        const serverQuotes = serverPosts.map(post => ({
            id: post.id,
            text: post.title,
            category: 'Server Default'
        }));

        return serverQuotes;
    } catch (error) {
        console.error("Error fetching server data:", error);
        return [];
    }
}

/** Simulates posting a new quote to the server. */
async function syncLocalQuoteToServer(quote) {
    const serverData = { title: quote.text, body: `Category: ${quote.category}`, userId: 1 };

    try {
        const response = await fetch(SERVER_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(serverData),
            headers: { 'Content-type': 'application/json; charset=UTF-8' },
        });

        if (response.ok) {
            displayNotification(`Quote synchronized successfully!`);
        } else {
            throw new Error('Server rejected the new quote.');
        }
    } catch (error) {
        console.error("Error syncing local quote:", error);
        displayNotification(`Failed to sync quote: (Check console)`, true);
    }
}

/** Merges server data with local data, prioritizing server updates (Server Precedence). */
async function resolveConflictsAndSync() {
    const serverQuotes = await fetchServerQuotes();
    let conflictsResolved = 0;

    // 1. Create a map of existing local quotes
    const localQuotesMap = new Map();
    quotes.forEach(quote => localQuotesMap.set(quote.id, quote));

    // 2. Iterate through server quotes and apply precedence
    serverQuotes.forEach(serverQuote => {
        const localQuote = localQuotesMap.get(serverQuote.id);

        if (localQuote) {
            // CONFLICT RESOLUTION: Server Precedence (Server overwrites local)
            if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
                localQuotesMap.set(serverQuote.id, serverQuote);
                conflictsResolved++;
            }
        } else {
            // NEW DATA: Add server quote
            localQuotesMap.set(serverQuote.id, serverQuote);
        }
    });

    // 3. Update global quotes, Local Storage, and UI
    quotes = Array.from(localQuotesMap.values());
    saveQuotes();

    // Refresh UI
    populateCategories();
    filterQuotes();

    if (conflictsResolved > 0) {
        displayNotification(`Sync complete. ${conflictsResolved} server conflicts resolved.`);
    } else if (serverQuotes.length > 0) {
        displayNotification("Sync complete. Server checked/merged.");
    } else {
        displayNotification("Sync complete. No new server data found.");
    }
}

/** Sets up the button for manual sync and the periodic automatic check. */
function setupPeriodicSync() {
    // Add Manual Sync Button (UI Element)
    const syncButton = document.createElement('button');
    syncButton.textContent = "Sync Now (Manual)";
    syncButton.onclick = resolveConflictsAndSync;
    syncButton.style.margin = '10px 0';

    // Find where to insert the button (e.g., near the JSON controls)
    const jsonSection = document.querySelector('h2');
    if (jsonSection) {
        jsonSection.parentNode.insertBefore(syncButton, jsonSection.nextSibling);
    } else {
        document.body.insertBefore(syncButton, document.getElementById('quoteDisplay'));
    }

    // Run the sync function immediately on load
    resolveConflictsAndSync();

    // Then set up the interval for automatic sync
    setInterval(resolveConflictsAndSync, SYNC_INTERVAL_MS);
}


// ===================================
// 4. FILTERING & CATEGORY LOGIC
// ===================================

/** Restores the last selected filter from Local Storage and applies it. */
function restoreLastFilter() {
    const lastCategory = localStorage.getItem('lastSelectedCategory');
    const filterSelect = document.getElementById('categoryFilter');

    if (lastCategory && filterSelect.querySelector(`option[value="${lastCategory}"]`)) {
        filterSelect.value = lastCategory;
    }

    filterQuotes();
}

/** Extracts unique categories and populates the dropdown menu. (MANDATORY function) */
function populateCategories() {
    const filterSelect = document.getElementById('categoryFilter');

    filterSelect.innerHTML = '<option value="all">All Categories</option>';

    const uniqueCategories = new Set(quotes.map(quote => quote.category).filter(c => c)); // Filter out null/empty categories

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterSelect.appendChild(option);
    });

    restoreLastFilter();
}

/** Filters quotes based on the selected category and updates the display. */
function filterQuotes() {
    const filterSelect = document.getElementById('categoryFilter');
    const selectedCategory = filterSelect.value;

    // Save the selected category to Local Storage for persistence
    localStorage.setItem('lastSelectedCategory', selectedCategory);

    let filteredList;
    if (selectedCategory === 'all') {
        filteredList = quotes;
    } else {
        filteredList = quotes.filter(quote => quote.category === selectedCategory);
    }

    displayFilteredQuotes(filteredList);
}


// ===================================
// 5. DISPLAY FUNCTIONS
// ===================================

/** Displays a list of quotes based on the filter result. */
function displayFilteredQuotes(filteredList) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';

    if (filteredList.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes match the selected category.</p>';
        return;
    }

    // Set the last viewed quote in Session Storage
    if (filteredList.length > 0) {
        sessionStorage.setItem('lastViewedQuote', JSON.stringify(filteredList[0]));
    }

    filteredList.forEach(quote => {
        const quoteDiv = document.createElement('div');
        quoteDiv.innerHTML = `
            <p style="font-size: 1.1em; font-style: italic; margin-bottom: 0;">"${quote.text}"</p>
            <em style="color: #888; display: block; margin-bottom: 10px;">— Category: ${quote.category}</em>
            <hr style="border-top: 1px dashed #eee;">
        `;
        quoteDisplay.appendChild(quoteDiv);
    });
}

/** Used to quickly pick a single random quote (mostly for the 'Show New Quote' button). */
function showRandomQuote() {
    localStorage.setItem('lastSelectedCategory', 'all');
    populateCategories();

    if (quotes.length === 0) return;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    document.getElementById('quoteDisplay').innerHTML = `
        <p style="font-size: 1.2em; font-style: italic;">"${randomQuote.text}"</p>
        <em style="color: #555;">— Category: ${randomQuote.category}</em>
    `;
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// ===================================
// 6. ADD QUOTE LOGIC
// ===================================
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');

    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (text === "" || category === "") {
        alert("Please enter both a quote and a category.");
        return;
    }

    // New quote receives a unique client-side ID
    const newQuote = {
        id: generateUniqueId(),
        text: text,
        category: category
    };
    quotes.push(newQuote);

    saveQuotes();
    syncLocalQuoteToServer(newQuote); // Sync the new quote immediately

    newQuoteText.value = "";
    newQuoteCategory.value = "";

    populateCategories();
    filterQuotes();

    alert("Quote added successfully!");
}

// ===================================
// 7. JSON IMPORT/EXPORT FUNCTIONS
// ===================================

/** Exports the current quotes array as a downloadable JSON file. */
function exportToJsonFile() {
    if (quotes.length === 0) {
        alert("No quotes to export!");
        return;
    }
    const jsonString = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/** Imports quotes from a selected JSON file, updates the array, and saves to storage. */
function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function (event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes)) {
                alert('Import failed: Expected an array of quotes.');
                return;
            }
            quotes.push(...importedQuotes);
            saveQuotes();

            // Update UI elements
            populateCategories();
            filterQuotes();

            alert(`Quotes imported successfully! Total quotes: ${quotes.length}`);

        } catch (error) {
            alert('Import failed: Could not read or parse the JSON file.');
            console.error(error);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ===================================
// 8. INITIALIZATION
// ===================================

// --- Load Data ---
loadQuotes();

// --- Setup Server Sync ---
setupPeriodicSync(); // Initializes periodic checks and manual sync button

// --- Set Event Listeners ---
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);

// --- Initial Display ---
populateCategories();

// Check for last viewed quote in Session Storage
const lastQuoteString = sessionStorage.getItem('lastViewedQuote');
if (lastQuoteString) {
    const lastQuote = JSON.parse(lastQuoteString);
    // Display the session-stored quote upon load
    document.getElementById('quoteDisplay').innerHTML = `
        <p style="font-size: 1.2em; font-style: italic; color: blue;">(Restored from Session Storage) "${lastQuote.text}"</p>
        <em style="color: #555;">— Category: ${lastQuote.category}</em>
    `;
}