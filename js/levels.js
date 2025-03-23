/**
 * Fichier principal qui regroupe tous les niveaux du jeu
 */

// Importe les définitions de niveaux individuels
const LEVEL1 = typeof module !== 'undefined' ? require('./level1.js') : LEVEL1;
const LEVEL2 = typeof module !== 'undefined' ? require('./level2.js') : LEVEL2;
const LEVEL3 = typeof module !== 'undefined' ? require('./level3.js') : LEVEL3;
const LEVEL4 = typeof module !== 'undefined' ? require('./level4.js') : LEVEL4;

// Regroupe tous les niveaux dans un tableau
const LEVELS = [LEVEL1, LEVEL2, LEVEL3, LEVEL4];

// Fonction pour vérifier si un niveau est terminé
function checkLevelCompletion(engine, levelIndex) {
    if (levelIndex === 3) {
        // Dernier niveau - condition de victoire spéciale
        return LEVELS[3].victory(engine);
    } else {
        // Autres niveaux - atteindre la fin du niveau (position X)
        const endX = LEVELS[levelIndex].width * engine.blockSize - 200;
        return engine.player && engine.player.x >= endX;
    }
}

// Ajoute la fonction de complétion à chaque niveau
for (let i = 0; i < LEVELS.length; i++) {
    if (!LEVELS[i].isComplete) {
        LEVELS[i].isComplete = function(engine) {
            return checkLevelCompletion(engine, i);
        };
    }
}

// Exporte les niveaux
if (typeof module !== 'undefined') {
    module.exports = LEVELS;
}