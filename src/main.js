let activeBookID = null;
let editing = false;

const activeBookDisplay = document.querySelector('#active-book');
const overlay = document.querySelector('#overlay');


function showOverlay(formType, data = null) {
    overlay.style.display = "block";

    editingData = data;
    editing = data !== null;

    
    switch (formType) {
        case "book":
            overlay.innerHTML = `
                <div>
                    <input type="text" id="title-input" placeholder="Book title">
                    <input type="text" id="auth-name-input" placeholder="Author's name">
                    <input type="text" id="auth-surname-input" placeholder="Author's surname">
                    <input type="text" id="year-input" placeholder="Edition publishing year">

                    <div class="form-elements-wrapper">
                        <button class="form-button" id="submit" onclick="submitBook();">SUBMIT</button>
                        ${data !== null
                            ? `<button class="form-button" onclick="deleteItem('book', ${data['id']})" id="delete">DELETE</button>`
                            : ''
                        }
                    <button class="form-button" onclick="hideOverlay();">CANCEL</button>
                    </div>
                </div>
            `;

            if (data !== null) {
                editing = true;
                overlay.querySelector('#title-input').value = data['title'];
                overlay.querySelector('#auth-name-input').value = data['authName'];
                overlay.querySelector('#auth-surname-input').value = data['authSurname'];
                overlay.querySelector('#year-input').value = data['year'];
                overlay.querySelector('#submit').onclick = () => submitBook(data['id']);
            }

            break;

        case "wikiEntry":
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
                        <button class="form-button" id="submit" onclick="submitWikiEntry();">SUBMIT</button>
                        ${data !== null
                            ? `<button class="form-button" onclick="deleteItem('wikiEntry', ${data['id']})" id="delete">DELETE</button>`
                            : ''
                        }
                        <button class="form-button" onclick="hideOverlay();">CANCEL</button>
                    </div>
                </div>`;

            if (data !== null) {
                editing = true;
                overlay.querySelector('#title-input').value = data['title'];
                overlay.querySelector('#type').value = data['type'];
                overlay.querySelector('textarea').value = data['body'];
                overlay.querySelector('#submit').onclick = () => submitWikiEntry(data['id']);
            }

            break;

        case "note":
            overlay.innerHTML = `
                <div>
                    <div class="form-elements-wrapper">
                        <input type="text" id="title-input" placeholder="Enter title">
                        <p>Page number:</p>
                        <input type="text" id="page-num-input" style="max-width:80px;">
                    </div>

                    <textarea rows="30" cols="60"></textarea>

                    <div class="form-elements-wrapper">
                        <button class="form-button" id="submit" onclick="submitNote();">SUBMIT</button>
                        ${data !== null
                            ? `<button class="form-button" onclick="deleteItem('note', ${data['id']})" id="delete">DELETE</button>`
                            : ''
                        }
                        <button class="form-button" onclick="hideOverlay();">CANCEL</button>
                    </div>
                </div>`;

            if (data !== null) {
                editing = true;
                overlay.querySelector('#title-input').value = data['title'];
                overlay.querySelector('#page-num-input').value = data['pageNum'];
                overlay.querySelector('textarea').value = data['body'];
                overlay.querySelector('#submit').onclick = () => submitNote(data['id']);
            }

            break;

        default:
            break;
    }
}

function hideOverlay() {
    overlay.style.display = "none";
    overlay.innerHTML = "";
}


async function submitWikiEntry(id = null) {
    const titleInput = overlay.querySelector('#title-input');
    const typeInput = overlay.querySelector('#type');
    const bodyInput = overlay.querySelector('textarea');

    const title = titleInput.value.trim();
    const type = typeInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        alert('Please enter a title.');
        return; 
    }

    if (editing) {
        await window.dbAPI.execute('update-wiki-entry',
            parseInt(id),
            type,
            title,
            body,
            [] //book IDs
        );

        displayWikiEntry(id);
    } else {
        const newWikiEntryID = await window.dbAPI.execute('add-wiki-entry', activeBookID, type, title, body);
        displayWikiEntry(newWikiEntryID);
    }

    hideOverlay();
}

async function submitNote(id = null) {
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

    if (editing) {
        await window.dbAPI.execute('update-note',
            id,
            title,
            body,
            pageNum,
        );

        hideOverlay();
        var noteDiv = document.querySelector('#notes').querySelector(`[id="${id}"]`);
        noteDiv.innerHTML = `
            <div class="entry-header">
                      <h4>${title}</h4>
                      <p class="page-num">p${pageNum}</p>
            </div>
            <p class="note-content">${body}</p>
            <div class="note-buttons">
                <button class="action-button" style="display: inline-block;"></button>
                <button class="action-button" style="display: inline-block;"
                    onclick="
                        event.stopPropagation();
                        showOverlay('note',
                            {'id': ${id},
                             'title': '${title}',
                             'pageNum': '${pageNum}',
                             'body': '${body}'}
                        );
                    "></button>
            </div>        
        `;
        
        return;
    }

    const newNoteID = await window.dbAPI.execute('add-note', parseInt(activeBookID), title, body, parseInt(pageNum));

    hideOverlay();
    getAllNotes(activeBookID);
}

async function submitBook(id = null) {
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

    if (editing) {
        await window.dbAPI.execute('update-book',
            id,
            title,
            authorName,
            authorSurname,
            year
        );

        hideOverlay();

        var bookDiv = document.querySelector('#library').querySelector(`[id="${id}"]`);
        activeBookDisplay.textContent = `${authorName} ${authorSurname}: ${title}, ${year}`;
        bookDiv.innerHTML = `
            <h4>${title}</h4>
            <button class="action-button"
                onclick="
                    event.stopPropagation();
                    showOverlay('book',
                        {'id': ${id},
                         'title': '${title}',
                         'authName': '${authorName}',
                         'authSurname': '${authorSurname}',
                         'year': parseInt(${year})}
                    );
                "></button>
        `;

        return;
    }

    const newBookID = await window.dbAPI.execute('add-book', title, authorName, authorSurname, year);

    hideOverlay();
    displayBooks();
}

async function getAllBooks() {
    const library = document.querySelector('#library');
    const books = await window.dbAPI.execute('get-all-books');
    
    displayBooks(books);
}

function displayBooks(books) {
    const existingBooks = document.querySelector('#library').querySelectorAll('.book-entry');
    existingBooks.forEach(book => book.remove());

    books.forEach(book => {
        const bookDiv = document.createElement('div');
        bookDiv.className = 'book-entry';
        bookDiv.id = `${book.id}`;
        bookDiv.onclick = () => getAllNotes(bookDiv.id);
        
        bookDiv.innerHTML = `
            <h4>${book.title}</h4>
            <button class="action-button"
                onclick="
                    event.stopPropagation();
                    showOverlay('book',
                        {'id': ${book.id},
                         'title': '${book.title}',
                         'authName': '${book.author_name}',
                         'authSurname': '${book.author_surname}',
                         'year': '${book.year_published}'}
                    );
                "></button>
        `;
        
        library.appendChild(bookDiv);
    });
}

async function getAllNotes(bookID) {
    const notes = await window.dbAPI.execute('get-notes-by-book', parseInt(bookID));
    displayNotes(bookID, notes);
}

async function displayNotes(bookID, notes) {
    const existingNotes = document.querySelector('#notes').querySelectorAll('.note-entry');
    existingNotes.forEach(note => note.remove());
    activeBookID = bookID;

    const noteArea = document.querySelector('#notes');
    const book = await window.dbAPI.execute('get-book-by-id', bookID);
    activeBookDisplay.textContent = `${book.author_name} ${book.author_surname}: ${book.title}, ${book.year_published}`;

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
                <button class="action-button" style="display: inline-block;"
                    onclick="
                        event.stopPropagation();
                        showOverlay('note',
                            {'id': ${note.id},
                             'title': '${note.title}',
                             'pageNum': '${note.page_num}',
                             'body': '${note.body}'}
                        );
                    "></button>
            </div>        
        `;
        
        noteArea.appendChild(noteDiv);
        
    });
}

function clearWiki() {
    const currentWikiEntry = document.querySelector('#wiki').querySelector('.wiki-entry');

    if (currentWikiEntry !== null)
        currentWikiEntry.remove();

    const wikiSearchResults = document.querySelector('#wiki').querySelectorAll('.wiki-search-result');
    wikiSearchResults.forEach((searchResult) => searchResult.remove());
}

async function displayWikiEntry(wikiEntryID) {
    clearWiki();

    const wikiArea = document.querySelector('#wiki');
    const wikiEntry = await window.dbAPI.execute('get-wiki-entry-by-id', parseInt(wikiEntryID));

    const wikiDiv = document.createElement('div');
    wikiDiv.className = 'wiki-entry';
    wikiDiv.id = `${wikiEntry.id}`;
    
    wikiDiv.innerHTML = `
        <div class="entry-header">
            <h3>${wikiEntry.title}</h3>
            <button class="action-button"
                onclick="
                    event.stopPropagation();
                    showOverlay('wikiEntry',
                        {'id': ${wikiEntry.id},
                         'title': '${wikiEntry.title}',
                         'type': '${wikiEntry.entry_type}',
                         'body': '${wikiEntry.body}'}
                    );
                "></button>
        </div>
        <p>${wikiEntry.body}</p>
    `;
    
    wikiArea.appendChild(wikiDiv);

}

function displayWikiSearchResults(wikiEntries) {
    clearWiki();

    const wikiArea = document.querySelector('#wiki');

    wikiEntries.forEach((wikiEntry) => {
        var wikiDiv = document.createElement('div');
        wikiDiv.className = 'wiki-search-result';
        wikiDiv.id = `${wikiEntry.id}`;
        wikiDiv.onclick = () => displayWikiEntry(wikiEntry.id);
        
        wikiDiv.innerHTML = `
            <div class="entry-header">
                <h3>${wikiEntry.title}</h3>
            </div>
            <p>${wikiEntry.body}</p>
        `;
        
        wikiArea.appendChild(wikiDiv);
    });
    
}

function deleteItem(itemType, id) {
    switch (itemType) {
        case 'book':
            window.dbAPI.execute('delete-book', id);
            document.querySelector('#library').querySelector(`[id="${id}"]`).remove();
            document.querySelector('#notes')
                .querySelectorAll('.note-entry')
                .forEach(note => note.remove());

            activeBookDisplay.textContent = ``;
            activeBookID = null;
            
            break;

        case 'wikiEntry':
            window.dbAPI.execute('delete-wiki-entry', id);
            document.querySelector('#wiki').querySelector(`[id="${id}"]`).remove();

            break;

        case 'note':
            window.dbAPI.execute('delete-note', id);
            document.querySelector('#notes').querySelector(`[id="${id}"]`).remove();

            break;

        default:
            break;
    }

    hideOverlay();
}


function clearSearch(searchArea) {
    document.querySelector(`#${searchArea}`).querySelector(".search-input").value = '';

    switch (searchArea) {
        case 'library':
            getAllBooks();
            
            break;

        case 'notes':
            getAllNotes(activeBookID);
            
            break;

        case 'wiki':
            clearWiki();
            
            break;


        default:
            break;
    }
}

async function search(searchArea) {

    var searchTerm = document.querySelector(`#${searchArea}`).querySelector(".search-input").value;

    switch (searchArea) {
        case 'library':
            var books = await window.dbAPI.execute('search-books', searchTerm);
            displayBooks(books);
            
            break;

        case 'notes':
            var notes = await window.dbAPI.execute('search-notes', searchTerm, activeBookID);
            displayNotes(activeBookID, notes);
            
            break;

        case 'wiki':
            var wikiEntries = await window.dbAPI.execute('search-wiki-entries', searchTerm);
            displayWikiSearchResults(wikiEntries);
            
            break;


        default:
            break;
    }
}

getAllBooks();

document.querySelectorAll('.search-input').forEach(input => {
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            const searchArea = input.closest('section').id;
            search(searchArea);
        }
    });
});
