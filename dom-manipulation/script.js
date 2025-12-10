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
    localStorage.setItem('localQuotes', JSON.stringify(quotes));
}

/** Loads quotes from Local Storage on application initialization. */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('localQuotes');

    if (storedQuotes) {
        // Overwrite the default array with stored data
        quotes = JSON.parse(storedQuotes);
    }
}

// ===================================
// 3. DISPLAY FUNCTION (with Session Storage)
// ===================================
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');

    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available. Please add one!</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    quoteDisplay.innerHTML = `
        <p style="font-size: 1.2em; font-style: italic;">"${randomQuote.text}"</p>
        <em style="color: #555;">— Category: ${randomQuote.category}</em>
    `;

    // *** SESSION STORAGE: Store the last viewed quote ***
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// ===================================
// 4. ADD QUOTE LOGIC (with Local Storage Integration)
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

    // *** LOCAL STORAGE: Save the updated array ***
    saveQuotes();

    newQuoteText.value = "";
    newQuoteCategory.value = "";

    alert("Quote added successfully!");
    showRandomQuote();
}

// ===================================
// 5. ADVANCED DOM: FORM CREATION
// ===================================
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.innerHTML = '<h2>Add New Quote</h2>';

    const inputQuote = document.createElement('input');
    inputQuote.id = 'newQuoteText';
    inputQuote.type = 'text';
    inputQuote.placeholder = 'Enter a new quote';

    const inputCategory = document.createElement('input');
    inputCategory.id = 'newQuoteCategory';
    inputCategory.type = 'text';
    inputCategory.placeholder = 'Enter quote category';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;

    formContainer.appendChild(document.createElement('hr'));
    formContainer.appendChild(inputQuote);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addButton);

    document.body.appendChild(formContainer);
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

            // Merge the imported quotes with the existing array
            quotes.push(...importedQuotes);

            // Save the combined array to local storage
            saveQuotes();

            alert(`Quotes imported successfully! Total quotes: ${quotes.length}`);
            showRandomQuote();

        } catch (error) {
            alert('Import failed: Could not read or parse the JSON file.');
            console.error(error);
        }
    };

    // Start reading the file
    fileReader.readAsText(event.target.files[0]);
}

// ===================================
// 7. INITIALIZATION & EVENT BINDING
// ===================================

// --- Load Data First ---
loadQuotes(); // Load any previously saved quotes from Local Storage

// --- Create UI Elements ---
createAddQuoteForm(); // Generate the dynamic input form

// --- Set Event Listeners ---
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Bind the export function to the button
// NOTE: This assumes you added an element with ID 'exportQuotes' to index.html
const exportButton = document.getElementById('exportQuotes');
if (exportButton) {
    exportButton.addEventListener('click', exportToJsonFile);
}


// --- Initial Display ---
// Check if a last viewed quote exists in Session Storage
const lastQuoteString = sessionStorage.getItem('lastViewedQuote');
if (lastQuoteString) {
    const lastQuote = JSON.parse(lastQuoteString);
    document.getElementById('quoteDisplay').innerHTML = `
        <p style="font-size: 1.2em; font-style: italic; color: blue;">(Last Session View) "${lastQuote.text}"</p>
        <em style="color: #555;">— Category: ${lastQuote.category}</em>
    `;
} else {
    // If nothing in session storage, display a random quote from the loaded array
    showRandomQuote();
}