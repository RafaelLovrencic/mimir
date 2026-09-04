let overlayShowing = false;
let activeBook = null;
const activeBookDisplay = document.querySelector('#active-book');

function switchOverlay() {
    var overlay = document.querySelector("#overlay");

    if (!overlayShowing) {
        overlay.style.display = "block";
        overlayShowing = true;
    } else {
        overlay.style.display = "none";
        overlayShowing = false;
    }
}

async function displayBooks() {
    const library = document.querySelector('#library');
    const books = await window.dbAPI.execute('get-all-books');

    books.forEach(book => {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-entry';
        bookDiv.id = `${book.id}`;
        bookDiv.onclick = () => displayNotes(bookDiv.id);
        
        bookDiv.innerHTML = `
            <h4>${book.title}</h4>
            <button class="action-button" onclick="switchOverlay();"></button>
        `;
        
        library.appendChild(bookDiv);
    });
}

async function addBook() {
    window.dbAPI.execute('add-book', "NEWBOOK", "NAME", "SURNAME", 1989);
}

async function displayNotes(bookID) {
    activeBook = bookID;
    const book = await window.dbAPI.execute('get-book-by-id', bookID);
    activeBookDisplay.textContent = `${book.author_name} ${book.author_surname}: ${book.title}, ${book.year_published}`;
    console.log(bookID);
}

displayBooks();
