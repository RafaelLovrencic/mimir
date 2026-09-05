let activeBookID = null;
const activeBookDisplay = document.querySelector('#active-book');
const overlay = document.querySelector('#overlay');


function showOverlay(formType) {
    overlay.style.display = "block";
    
    switch (formType) {
        case "add-book":
            overlay.innerHTML = `
                <div>
                    <input type="text" id="title-input" placeholder="Book title">
                    <input type="text" id="auth-name-input" placeholder="Author's name">
                    <input type="text" id="auth-surname-input" placeholder="Author's surname">
                    <input type="text" id="year-input" placeholder="Edition publishing year">

                    <div class="form-elements-wrapper">
                        <button class="form-button" onclick="addBook();">SUBMIT</button>
                        <button class="form-button" onclick="hideOverlay();">CANCEL</button>
                    </div>
                </div>
            `;
            break;

        case "add-wiki-entry":
            overlay.innerHTML = `
                <div>
                    <div class="form-elements-wrapper">
                        <input type="text" id="title-input" placeholder="Enter title">
                        <label for="entry-type">Entry type: </label>
                        <select name="type" id="type">
                            <option value="character">Character</option>
                            <option value="place">Place</option>
                            <option value="event">Event</option>
                        </select>
                    </div>

                    <textarea rows="30" cols="60"></textarea>

                    <div class="form-elements-wrapper">
                        <button class="form-button" onclick="hideOverlay();">SUBMIT</button>
                        <button class="form-button" onclick="hideOverlay();">CANCEL</button>
                    </div>
                </div>`;
            break;

        case "add-note":
            overlay.innerHTML = `
                <div>
                    <div class="form-elements-wrapper">
                        <input type="text" id="title-input" placeholder="Enter title">
                        <p>Page number:</p>
                        <input type="text" id="page-num-input" style="max-width:80px;">
                    </div>

                    <textarea rows="30" cols="60"></textarea>

                    <div class="form-elements-wrapper">
                        <button class="form-button" onclick="addNote();">SUBMIT</button>
                        <button class="form-button" onclick="hideOverlay();">CANCEL</button>
                    </div>
                </div>`;
            break;

        default:
            break;
    }
}

function hideOverlay() {
    overlay.style.display = "none";
    overlay.innerHTML = "";
}


async function addBook() {
    const titleInput = overlay.querySelector('#title-input');
    const authNameInput = overlay.querySelector('#auth-name-input');
    const authSurnameInput = overlay.querySelector('#auth-surname-input');
    const yearInput = overlay.querySelector('#year-input');

    const title = titleInput.value.trim();
    const authorName = authNameInput.value.trim();
    const authorSurname = authSurnameInput.value.trim();
    const year = yearInput.value.trim();

    if (!title || !authorName || !authorSurname) {
        alert('Please fill out all required fields before submitting.');
        return; 
    }

    const newBookID = await window.dbAPI.execute('add-book', title, authorName, authorSurname, year);

    hideOverlay();
    const existingBooks = document.querySelector('#library').querySelectorAll('.book-entry');
    existingBooks.forEach(book => book.remove());
    displayBooks();
}

async function addNote() {
    const titleInput = overlay.querySelector('#title-input');
    const pageNumInput = overlay.querySelector('#page-num-input');
    const bodyInput = overlay.querySelector('textarea');

    const title = titleInput.value.trim();
    const pageNum = pageNumInput.value.trim();
    const body = bodyInput.value.trim();

    if (!activeBookID) {
        alert('Select a book to add a note.');
        return;
    }

    if (!title || !body) {
        alert('Please fill out all required fields before submitting.');
        return; 
    }

    const newNoteID = await window.dbAPI.execute('add-note', parseInt(activeBookID), title, body, parseInt(pageNum));

    hideOverlay();
    const existingNotes = document.querySelector('#notes').querySelectorAll('.note-entry');
    existingNotes.forEach(note => note.remove());
    displayNotes(activeBookID);
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

async function displayNotes(bookID) {
    const existingNotes = document.querySelector('#notes').querySelectorAll('.note-entry');
    existingNotes.forEach(note => note.remove());
    activeBookID = bookID;

    const noteArea = document.querySelector('#notes');
    const book = await window.dbAPI.execute('get-book-by-id', bookID);
    activeBookDisplay.textContent = `${book.author_name} ${book.author_surname}: ${book.title}, ${book.year_published}`;

    const notes = await window.dbAPI.execute('get-notes-by-book', parseInt(bookID));
    console.log(notes);
    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-entry';
        noteDiv.id = `${note.id}`;
        
        noteDiv.innerHTML = `
            <div class="entry-header">
                      <h4>${note.title}</h4>
                      <p class="page-num">p${note.page_num}</p>
            </div>
            <p class="note-content">${note.body}</p>
            <div class="note-buttons">
                <button class="action-button" style="display: inline-block;"></button>
                <button class="action-button" style="display: inline-block;" onclick="switchOverlay();"></button>
            </div>        
        `;
        
        noteArea.appendChild(noteDiv);
        
    });
}

displayBooks();
