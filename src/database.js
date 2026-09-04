const Database = require('better-sqlite3');
const db = new Database('database/mimir.db');

const createDBQuery = `
    CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        author_name TEXT,
        author_surname TEXT,
        year_published INTEGER
    );

    CREATE TABLE IF NOT EXISTS note (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT,
        page_num INTEGER
    );

    CREATE TABLE IF NOT EXISTS wiki_entry (
        id INTEGER PRIMARY KEY,
        entry_type TEXT,
        title TEXT NOT NULL,
        body TEXT
    );

    CREATE TABLE IF NOT EXISTS book_note (
        book_id INTEGER NOT NULL,
        note_id INTEGER NOT NULL,

        PRIMARY KEY (book_id, note_id),

        FOREIGN KEY (book_id)
            REFERENCES book(id)
            ON DELETE CASCADE,

        FOREIGN KEY (note_id)
            REFERENCES note(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS book_wiki (
        book_id INTEGER NOT NULL,
        wiki_id INTEGER NOT NULL,

        PRIMARY KEY (book_id, wiki_id),

        FOREIGN KEY (book_id)
            REFERENCES book(id)
            ON DELETE CASCADE,

        FOREIGN KEY (wiki_id)
            REFERENCES wiki_entry(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS note_wiki (
        note_id INTEGER NOT NULL,
        wiki_id INTEGER NOT NULL,

        PRIMARY KEY (note_id, wiki_id),

        FOREIGN KEY (note_id)
            REFERENCES note(id)
            ON DELETE CASCADE,

        FOREIGN KEY (wiki_id)
            REFERENCES wiki_entry(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS note_reference (
        source_note_id INTEGER NOT NULL,
        target_note_id INTEGER NOT NULL,

        PRIMARY KEY (source_note_id, target_note_id),

        FOREIGN KEY (source_note_id)
            REFERENCES note(id)
            ON DELETE CASCADE,

        FOREIGN KEY (target_note_id)
            REFERENCES note(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wiki_reference (
        source_wiki_id INTEGER NOT NULL,
        target_wiki_id INTEGER NOT NULL,

        PRIMARY KEY (source_wiki_id, target_wiki_id),

        FOREIGN KEY (source_wiki_id)
            REFERENCES wiki_entry(id)
            ON DELETE CASCADE,

        FOREIGN KEY (target_wiki_id)
            REFERENCES wiki_entry(id)
            ON DELETE CASCADE
    );
`;


db.exec(createDBQuery);


const addNote = db.transaction((bookID, title, body, pageNum) => {
    const noteID = db.prepare(`
        INSERT INTO note (title, body, page_num)
        VALUES (?, ?, ?)
    `)
    .run(title, body, pageNum)
    .lastInsertRowid;

    db.prepare(`
        INSERT INTO book_note (book_id, note_id)
        VALUES (?, ?)
    `)
    .run(bookID, noteID);

    return noteID;
});

const addWikiEntry = db.transaction((bookID, entryType, title, body) => {
    const wikiEntryID = db.prepare(`
        INSERT INTO wiki_entry (entry_type, title, body)
        VALUES (?, ?, ?)
    `)
    .run(entryType, title, body)
    .lastInsertRowid;

    db.prepare(`
        INSERT INTO book_wiki (book_id, wiki_id)
        VALUES (?, ?)
    `)
    .run(bookID, wikiEntryID);

    return wikiEntryID;
});

const queries = {
    'get-all-books': () => db.prepare('SELECT * FROM book').all(),
    'get-book-by-id': (id) => db.prepare('SELECT * FROM book WHERE id = ?').get(id),
    'get-notes-by-book': (bookID) => db.prepare('SELECT note.* FROM note JOIN book_note ON note.id = book_note.note_id WHERE book_note.book_id = ?').all(bookID),

    'add-book': (title, authorName, authorSurname, yearPublished) => {
        return db.prepare('INSERT INTO book (title, author_name, author_surname, year_published) VALUES (?, ?, ?, ?)')
          .run(title, authorName, authorSurname, yearPublished)
          .lastInsertRowid;
    },
    'add-note': addNote,
    'add-wiki-entry': addWikiEntry,
};

function executeQuery(action, args = []) {
    if (!queries[action]) {
        throw new Error(`Unknown database action: ${action}`);
    }
    return queries[action](...args);
}

module.exports = { executeQuery };
