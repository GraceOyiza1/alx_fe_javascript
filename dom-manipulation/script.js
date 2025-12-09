// 1. The Array of Quote Objects
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
];

// 2. Display a Random Quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    quoteDisplay.innerHTML = `<p>"${randomQuote.text}"</p><em>Category: ${randomQuote.category}</em>`;
}

// 3. Create the Add Quote Form (REQUIRED function)
function createAddQuoteForm() {
    // Create container for the form
    const formContainer = document.createElement('div');

    // Create input for quote text
    const inputQuote = document.createElement('input');
    inputQuote.id = 'newQuoteText';
    inputQuote.type = 'text';
    inputQuote.placeholder = 'Enter a new quote';

    // Create input for category
    const inputCategory = document.createElement('input');
    inputCategory.id = 'newQuoteCategory';
    inputCategory.type = 'text';
    inputCategory.placeholder = 'Enter quote category';

    // Create add button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote; // Bind the addQuote function to the button

    // Append elements to container
    formContainer.appendChild(inputQuote);
    formContainer.appendChild(inputCategory);
    formContainer.appendChild(addButton);

    // Append container to body
    document.body.appendChild(formContainer);
}

// 4. Add a New Quote (REQUIRED function)
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');

    if (newQuoteText.value && newQuoteCategory.value) {
        // Add to array
        quotes.push({
            text: newQuoteText.value,
            category: newQuoteCategory.value
        });

        // Update DOM (display the new quote immediately or clear inputs)
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        alert('Quote added successfully!');
    } else {
        alert('Please fill in both fields');
    }
}

// 5. Event Listeners (REQUIRED)
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initialize the app
createAddQuoteForm(); // This creates the form when the page loads
showRandomQuote();    // Show an initial quote