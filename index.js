import initGlobe from './lib/main';

document.getElementById("loader"),
document.addEventListener('DOMContentLoaded', () => {

    initGlobe(document.getElementById('globe-app'));
});