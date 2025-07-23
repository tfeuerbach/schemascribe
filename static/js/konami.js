document.addEventListener('DOMContentLoaded', () => {
    const pattern = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
    let current = 0;

    const keyHandler = (event) => {
        const key = event.key.toLowerCase();

        // If the pressed key is not the one we expect, reset the progress.
        // An exception is if the user starts typing the code again from the beginning.
        if (pattern[current] !== key) {
            current = (pattern[0] === key) ? 1 : 0;
            return;
        }

        // Update how much of the pattern is complete
        current++;

        // If complete, toggle the theme and reset
        if (pattern.length === current) {
            document.body.classList.toggle('theme-retro');
            current = 0;
        }
    };

    document.addEventListener('keydown', keyHandler, false);
}); 