(async () => {
    console.log("Testing SQLite connection on startup...");
  
    window.dbAPI.execute('add-book', "BOOKNAME");
    const books = await window.dbAPI.execute('get-all-books');
    console.log(books);
})();
