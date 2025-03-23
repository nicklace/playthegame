/**
 * Utilitaires pour la gestion des niveaux
 */

// Objet contenant les fonctions utilitaires pour les niveaux
const LevelUtils = {
    // Génère un bloc aléatoire (peut être utile pour des niveaux procéduraux)
    generateRandomBlock: function(probability) {
        if (Math.random() < probability) {
            return Math.floor(Math.random() * 9) + 1; // Blocs de 1 à 9
        }
        return 0; // Vide
    },
    
    // Génère un niveau procédural simple
    generateLevel: function(width, height, name, blockDensity) {
        const blocks = [];
        
        // Crée une grille vide
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                // Toujours des blocs en bas et sur les côtés
                if (y >= height - 3 || x === 0 || x === width - 1) {
                    row.push(1); // Bloc de terre
                } else if (y === height - 4) {
                    row.push(2); // Bloc d'herbe sur le dessus
                } else {
                    // Blocs aléatoires ailleurs
                    row.push(this.generateRandomBlock(blockDensity));
                }
            }
            blocks.push(row);
        }
        
        return {
            name: name || "Niveau Généré",
            background: "bg_forest",
            width: width,
            height: height,
            startX: 2,
            startY: height - 5,
            blocks: blocks,
            entities: [
                // Joueur de base
                { type: 'player', x: 100, y: (height - 5) * 32, color: 'magenta' },
                
                // Quelques pièces aléatoires
                { type: 'collectible', x: width * 16, y: height * 10, collectibleType: 'coin' },
                { type: 'collectible', x: width * 24, y: height * 10, collectibleType: 'coin' },
                
                // Un ennemi
                { type: 'enemy', x: width * 20, y: (height - 5) * 32, enemyType: 'sbeer' }
            ]
        };
    },
    
    // Fonction pour sauvegarder un niveau au format JSON (si localStorage est disponible)
    saveLevel: function(level, id) {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('level_' + id, JSON.stringify(level));
                return true;
            } catch (e) {
                console.error("Erreur lors de la sauvegarde du niveau:", e);
                return false;
            }
        }
        return false;
    },
    
    // Fonction pour charger un niveau depuis le localStorage
    loadLevel: function(id) {
        if (typeof localStorage !== 'undefined') {
            try {
                const levelData = localStorage.getItem('level_' + id);
                if (levelData) {
                    return JSON.parse(levelData);
                }
            } catch (e) {
                console.error("Erreur lors du chargement du niveau:", e);
            }
        }
        return null;
    }
};

// Exporte l'utilitaire
if (typeof module !== 'undefined') {
    module.exports = LevelUtils;
}