// 1. The Array of Quote Objects
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do not let what you cannot do interfere with what you can do.", category: "Inspiration" }
];

// 2. The Function to Display a Random Quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');

    // Calculate a random index based on the length of the array
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    // Clear the current content (optional, but good practice)
    quoteDisplay.innerHTML = '';

    // Create elements for the quote text and category
    // This uses "Advanced DOM Manipulation" by creating elements rather than just editing strings
    const quoteText = document.createElement('p');
    quoteText.textContent = `"${randomQuote.text}"`;

    const quoteCategory = document.createElement('em');
    quoteCategory.textContent = `— Category: ${randomQuote.category}`;

    // Append the new elements to the display div
    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(quoteCategory);
}

// 3. Event Listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initial call to display a quote when the page loads
showRandomQuote();
// 4. Function to Add a New Quote
function addQuote() {
    // Select the input fields
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');

    // Get the values
    const text = newQuoteText.value;
    const category = newQuoteCategory.value;

    // Simple validation: Ensure both fields have text
    if (text === "" || category === "") {
        alert("Please enter both a quote and a category.");
        return; // Stop the function here
    }

    // Create a new quote object
    const newQuote = {
        text: text,
        category: category
    };

    // Add to the array
    quotes.push(newQuote);

    // Update the DOM - Optional: immediately show the new quote
    // or just let the user click "Show New Quote" to see it eventually.
    // Let's clear the inputs so they can add another one.
    newQuoteText.value = "";
    newQuoteCategory.value = "";

    alert("Quote added successfully!");
}