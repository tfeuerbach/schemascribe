document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('easter-egg-trigger');
    const audio = document.getElementById('easter-egg-audio');

    if (trigger && audio) {
        fetch('static/audio/blops.txt')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.text();
            })
            .then(base64Audio => {
                audio.src = 'data:audio/mpeg;base64,' + base64Audio.trim();
            })
            .catch(error => {
                console.error('Failed to fetch or load audio file:', error);
                trigger.style.display = 'none';
            });

        trigger.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().catch(e => console.error("Audio playback failed.", e));
            } else {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
}); 