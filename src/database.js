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

const queries = {
    'get-all-books': () => db.prepare('SELECT * FROM book').all(),
    'get-book-by-id': (id) => db.prepare('SELECT * FROM book WHERE id = ?').get(id),
    'add-book': (name) => db.prepare('INSERT INTO book (title) VALUES (?)').run(name).lastInsertRowid,
};

function executeQuery(action, args = []) {
    if (!queries[action]) {
        throw new Error(`Unknown database action: ${action}`);
    }
    return queries[action](...args);
}

module.exports = { executeQuery };
