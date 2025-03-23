/**
 * Fichier d'importation des dépendances
 * 
 * Ce fichier permet de gérer les importations dans un environnement navigateur
 * où les imports ES6 traditionnels ne sont pas toujours disponibles.
 */

// Fonction pour charger un script
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = (error) => {
        console.error(`Erreur lors du chargement du script ${src}:`, error);
    };
    document.head.appendChild(script);
}

// Charge les fichiers dans l'ordre
document.addEventListener('DOMContentLoaded', function() {
    // Ordre de chargement
    const scripts = [
        'js/engine.js',
        'js/level1.js',
        'js/level2.js',
        'js/level3.js',
        'js/level4.js',
        'js/levels.js',
        'js/entities.js',
        'js/game.js'
    ];
    
    // Fonction récursive pour charger les scripts dans l'ordre
    function loadNextScript(index) {
        if (index >= scripts.length) {
            console.log('Tous les scripts ont été chargés');
            return;
        }
        
        loadScript(scripts[index], () => {
            loadNextScript(index + 1);
        });
    }
    
    // Commence le chargement
    loadNextScript(0);
});