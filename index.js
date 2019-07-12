import initGlobe from './lib/main';

document.addEventListener('DOMContentLoaded', () => {
    
    const loading = document.getElementById("loader");

    initGlobe(document.getElementById('globe-app'));
});