// ===================================
// 1. DATA ARRAY & INITIAL SETUP
// ===================================
// Define a default array of quotes
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
];

// ===================================
// 2. CORE STORAGE FUNCTIONS
// ===================================

/** Saves the current quotes array to Local Storage. */
function saveQuotes() {
    // Convert the JavaScript object (array) into a JSON string before storing
    localStorage.setItem('localQuotes', JSON.stringify(quotes));
}

/** Loads quotes from Local Storage on application initialization. */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('localQuotes');

    if (storedQuotes) {
        // Convert the JSON string back into a JavaScript array/object
        quotes = JSON.parse(storedQuotes);
    }
}

// ===================================
// 3. FILTERING & CATEGORY LOGIC
// ===================================

/** Restores the last selected filter from Local Storage and applies it. */
function restoreLastFilter() {
    const lastCategory = localStorage.getItem('lastSelectedCategory');
    const filterSelect = document.getElementById('categoryFilter');

    if (lastCategory && filterSelect.querySelector(`option[value="${lastCategory}"]`)) {
        // Set the dropdown value to the stored category
        filterSelect.value = lastCategory;
    }

    // Apply the filter on load
    filterQuotes();
}

/** Extracts unique categories and populates the dropdown menu. (MANDATORY function) */
function populateCategories() {
    const filterSelect = document.getElementById('categoryFilter');

    // Start by clearing any existing options except "All Categories"
    filterSelect.innerHTML = '<option value="all">All Categories</option>';

    // Get unique categories using a Set
    const uniqueCategories = new Set(quotes.map(quote => quote.category));

    // Add each unique category as an option
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterSelect.appendChild(option);
    });

    // Attempt to restore the last filter state
    restoreLastFilter();
}

/** Filters quotes based on the selected category and updates the display. */
function filterQuotes() {
    const filterSelect = document.getElementById('categoryFilter');
    const selectedCategory = filterSelect.value;

    // 1. Save the selected category to Local Storage for persistence
    localStorage.setItem('lastSelectedCategory', selectedCategory);

    // 2. Filter the quotes array
    let filteredList;
    if (selectedCategory === 'all') {
        filteredList = quotes;
    } else {
        filteredList = quotes.filter(quote => quote.category === selectedCategory);
    }

    // 3. Display the results
    displayFilteredQuotes(filteredList);
}


// ===================================
// 4. DISPLAY FUNCTIONS
// ===================================

/** Displays a list of quotes based on the filter result. */
function displayFilteredQuotes(filteredList) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = ''; // Clear previous content

    if (filteredList.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes match the selected category.</p>';
        return;
    }

    // Set the last viewed quote in Session Storage to the first item of the list
    if (filteredList.length > 0) {
        sessionStorage.setItem('lastViewedQuote', JSON.stringify(filteredList[0]));
    }

    // Create a list of displayed quotes (instead of just a single random one)
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

/** Used only for the 'Show New Quote' button to quickly pick a single random quote. */
function showRandomQuote() {
    // This function will now reset the filter to 'all' and pick a random quote
    localStorage.setItem('lastSelectedCategory', 'all');

    // Re-populate categories to reset the dropdown display
    populateCategories();

    // Directly pick one random quote to display in the quoteDisplay area
    if (quotes.length === 0) return;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    document.getElementById('quoteDisplay').innerHTML = `
        <p style="font-size: 1.2em; font-style: italic;">"${randomQuote.text}"</p>
        <em style="color: #555;">— Category: ${randomQuote.category}</em>
    `;
    // Update session storage for this single quote
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// ===================================
// 5. ADD QUOTE LOGIC
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

    const newQuote = { text: text, category: category };
    quotes.push(newQuote);

    // Save the updated array to Local Storage
    saveQuotes();

    newQuoteText.value = "";
    newQuoteCategory.value = "";

    // Update categories dropdown if a new category was added
    populateCategories();
    // Re-filter the list with the current selection
    filterQuotes();

    alert("Quote added successfully!");
}

// ===================================
// 6. JSON IMPORT/EXPORT FUNCTIONS
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
                alert('Import failed: The file format is invalid. Expected an array of quotes.');
                return;
            }
            quotes.push(...importedQuotes);
            saveQuotes();

            // Update UI elements
            populateCategories(); // Update the filter dropdown with any new categories
            filterQuotes(); // Refresh the displayed list

            alert(`Quotes imported successfully! Total quotes: ${quotes.length}`);

        } catch (error) {
            alert('Import failed: Could not read or parse the JSON file.');
            console.error(error);
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// ===================================
// 7. INITIALIZATION & EVENT BINDING
// ===================================

// --- Load Data First ---
loadQuotes(); // Load quotes from Local Storage

// --- Set Event Listeners ---
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);

// --- Initial Display ---
populateCategories(); // Populates dropdown and calls restoreLastFilter(), which calls filterQuotes()

// Check for last viewed quote in Session Storage to show a welcome message/state
const lastQuoteString = sessionStorage.getItem('lastViewedQuote');
if (lastQuoteString) {
    const lastQuote = JSON.parse(lastQuoteString);
    // Overwrite the initial filter display with the session quote temporarily
    document.getElementById('quoteDisplay').innerHTML = `
        <p style="font-size: 1.2em; font-style: italic; color: blue;">(Restored from Session Storage) "${lastQuote.text}"</p>
        <em style="color: #555;">— Category: ${lastQuote.category}</em>
    `;
}