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

(async () => {
    console.log("Testing SQLite connection on startup...");
  
    window.dbAPI.execute('add-book', "BOOKNAME");
    const books = await window.dbAPI.execute('get-all-books');
    console.log(books);
})();
