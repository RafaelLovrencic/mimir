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
