let overlayShowing = false;

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
        
        bookDiv.innerHTML = `
            <h4>${book.title}</h4>
            <button class="action-button" onclick="switchOverlay();"></button>
        `;
        
        library.appendChild(bookDiv);
    });
}

displayBooks();
