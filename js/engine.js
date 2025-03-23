/**
 * Game Engine
 * Gère le cœur du jeu: affichage, physique, collisions, contrôles
 */
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / 60; // 60 FPS
        
        this.entities = [];
        this.player = null;
        this.camera = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        
        this.keys = {};
        this.touchControls = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            shoot: false
        };
        
        this.gravity = 0.5;
        this.currentLevel = null;
        this.gameState = 'menu'; // menu, playing, gameOver, victory
        
        this.assets = {
            images: {},
            sounds: {},
            levels: []
        };
        
        this.blockSize = 32; // Taille d'un bloc (style Minecraft)
        
        this.setupEventListeners();
        this.resizeCanvas();
    }
    
    // Initialise les événements (clavier, tactile, redimensionnement)
    setupEventListeners() {
        // Redimensionne le canvas quand la fenêtre change de taille
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Événements clavier
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Contrôles tactiles pour mobile
        const mobileButtons = {
            'btn-left': 'left',
            'btn-right': 'right',
            'btn-up': 'up',
            'btn-down': 'down',
            'btn-jump': 'jump',
            'btn-shoot': 'shoot'
        };
        
        Object.keys(mobileButtons).forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                ['touchstart', 'mousedown'].forEach(eventType => {
                    button.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        this.touchControls[mobileButtons[id]] = true;
                    });
                });
                
                ['touchend', 'mouseup', 'touchcancel', 'mouseleave'].forEach(eventType => {
                    button.addEventListener(eventType, (e) => {
                        e.preventDefault();
                        this.touchControls[mobileButtons[id]] = false;
                    });
                });
            }
        });
    }
    
    // Redimensionne le canvas pour qu'il remplisse la fenêtre
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
    }
    
    // Charge une image
    loadImage(key, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.images[key] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }
    
    // Charge un son
    loadSound(key, src) {
        return new Promise((resolve, reject) => {
            const sound = new Audio();
            sound.oncanplaythrough = () => {
                this.assets.sounds[key] = sound;
                resolve(sound);
            };
            sound.onerror = () => reject(new Error(`Failed to load sound: ${src}`));
            sound.src = src;
        });
    }
    
    // Joue un son
    playSound(key, volume = 1.0, loop = false) {
        const sound = this.assets.sounds[key];
        if (sound) {
            sound.currentTime = 0;
            sound.volume = volume;
            sound.loop = loop;
            sound.play().catch(e => console.log("Audio play error:", e));
        }
    }
    
    // Arrête un son
    stopSound(key) {
        const sound = this.assets.sounds[key];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }
    
    // Charge un niveau
    loadLevel(levelData) {
        this.currentLevel = levelData;
        this.entities = [];
        
        // Crée les entités du niveau
        if (levelData.entities) {
            levelData.entities.forEach(entityData => {
                let entity;
                
                switch (entityData.type) {
                    case 'player':
                        entity = new Player(this, entityData.x, entityData.y, entityData.color || 'magenta');
                        this.player = entity;
                        break;
                    case 'enemy':
                        entity = new Enemy(this, entityData.x, entityData.y, entityData.enemyType || 'sbeer');
                        break;
                    case 'boss':
                        entity = new Boss(this, entityData.x, entityData.y);
                        break;
                    case 'turret':
                        entity = new Turret(this, entityData.x, entityData.y);
                        break;
                    case 'collectible':
                        entity = new Collectible(this, entityData.x, entityData.y, entityData.collectibleType || 'coin');
                        break;
                }
                
                if (entity) {
                    this.entities.push(entity);
                }
            });
        }
        
        // Positionne la caméra sur le joueur
        if (this.player) {
            this.updateCamera();
        }
    }
    
    // Vérifie si une touche est pressée
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    // Vérifie les contrôles du joueur (clavier ou tactile)
    getPlayerControls() {
        return {
            left: this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.touchControls.left,
            right: this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.touchControls.right,
            up: this.isKeyPressed('ArrowUp') || this.isKeyPressed('w') || this.touchControls.up,
            down: this.isKeyPressed('ArrowDown') || this.isKeyPressed('s') || this.touchControls.down,
            jump: this.isKeyPressed(' ') || this.touchControls.jump,
            shoot: this.isKeyPressed('z') || this.touchControls.shoot
        };
    }
    
    // Met à jour la position de la caméra pour suivre le joueur
    updateCamera() {
        if (!this.player) return;
        
        // Centre la caméra sur le joueur
        const targetX = this.player.x - this.camera.width / 2 + this.player.width / 2;
        const targetY = this.player.y - this.camera.height / 2 + this.player.height / 2;
        
        // Limites de la caméra (pour ne pas sortir du niveau)
        const levelWidth = this.currentLevel ? this.currentLevel.width * this.blockSize : 0;
        const levelHeight = this.currentLevel ? this.currentLevel.height * this.blockSize : 0;
        
        this.camera.x = Math.max(0, Math.min(targetX, levelWidth - this.camera.width));
        this.camera.y = Math.max(0, Math.min(targetY, levelHeight - this.camera.height));
    }
    
    // Vérifie les collisions d'une entité avec les blocs du niveau
    checkCollisions(entity) {
        if (!this.currentLevel || !this.currentLevel.blocks) return null;
        
        const collisions = { top: false, right: false, bottom: false, left: false };
        
        // Obtient les indices des blocs autour de l'entité
        const gridX1 = Math.floor(entity.x / this.blockSize);
        const gridY1 = Math.floor(entity.y / this.blockSize);
        const gridX2 = Math.floor((entity.x + entity.width) / this.blockSize);
        const gridY2 = Math.floor((entity.y + entity.height) / this.blockSize);
        
        // Vérifie chaque bloc potentiel
        for (let gridY = gridY1; gridY <= gridY2; gridY++) {
            for (let gridX = gridX1; gridX <= gridX2; gridX++) {
                if (
                    gridY >= 0 && 
                    gridY < this.currentLevel.height && 
                    gridX >= 0 && 
                    gridX < this.currentLevel.width
                ) {
                    const blockType = this.currentLevel.blocks[gridY][gridX];
                    if (blockType && blockType !== 0) { // Si ce n'est pas un bloc vide
                        const blockX = gridX * this.blockSize;
                        const blockY = gridY * this.blockSize;
                        
                        // Vérifie les collisions
                        if (
                            entity.x + entity.width > blockX &&
                            entity.x < blockX + this.blockSize &&
                            entity.y + entity.height > blockY &&
                            entity.y < blockY + this.blockSize
                        ) {
                            // Détermine de quel côté la collision se produit
                            const overlapRight = entity.x + entity.width - blockX;
                            const overlapLeft = blockX + this.blockSize - entity.x;
                            const overlapBottom = entity.y + entity.height - blockY;
                            const overlapTop = blockY + this.blockSize - entity.y;
                            
                            // Trouve la plus petite distance de chevauchement
                            const minOverlap = Math.min(overlapRight, overlapLeft, overlapBottom, overlapTop);
                            
                            if (minOverlap === overlapTop) {
                                collisions.bottom = { blockType, blockX, blockY };
                                entity.y = blockY + this.blockSize;
                                entity.velocity.y = 0;
                            } else if (minOverlap === overlapBottom) {
                                collisions.top = { blockType, blockX, blockY };
                                entity.y = blockY - entity.height;
                                entity.velocity.y = 0;
                                entity.onGround = true;
                            } else if (minOverlap === overlapLeft) {
                                collisions.right = { blockType, blockX, blockY };
                                entity.x = blockX - entity.width;
                                entity.velocity.x = 0;
                            } else if (minOverlap === overlapRight) {
                                collisions.left = { blockType, blockX, blockY };
                                entity.x = blockX + this.blockSize;
                                entity.velocity.x = 0;
                            }
                        }
                    }
                }
            }
        }
        
        return collisions;
    }
    
    // Vérifie les collisions entre deux entités
    entitiesCollide(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
    
    // Démarre la boucle de jeu
    start() {
        this.gameState = 'playing';
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
    
    // La boucle de jeu principale
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Accumule le temps pour la mise à jour physique
        this.accumulator += deltaTime;
        
        // Mises à jour physiques à un taux fixe
        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep);
            this.accumulator -= this.timeStep;
        }
        
        // Rendu
        this.render();
        
        // Prochaine frame
        if (this.gameState !== 'menu') {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    // Met à jour l'état du jeu
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Met à jour toutes les entités
        this.entities.forEach(entity => {
            entity.update(deltaTime);
        });
        
        // Supprime les entités marquées pour la suppression
        this.entities = this.entities.filter(entity => !entity.markedForDeletion);
        
        // Met à jour la position de la caméra
        this.updateCamera();
        
        // Vérifie si le niveau est terminé
        if (this.currentLevel && this.currentLevel.isComplete && this.currentLevel.isComplete(this)) {
            if (this.currentLevel === LEVELS[LEVELS.length - 1]) {
                // C'est le dernier niveau, victoire totale
                this.gameState = 'victory';
            } else {
                // Niveau terminé, passe au suivant
                this.gameState = 'levelComplete';
            }
        }
    }
    
    // Dessine le jeu à l'écran
    render() {
        // Efface le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' && this.currentLevel) {
            // Dessine l'arrière-plan
            this.renderBackground();
            
            // Dessine les blocs du niveau
            this.renderLevel();
            
            // Dessine toutes les entités
            this.entities.sort((a, b) => a.zIndex - b.zIndex).forEach(entity => {
                entity.render(this.ctx);
            });
            
            // Dessine l'interface utilisateur
            this.renderUI();
        }
    }
    
    // Dessine l'arrière-plan du niveau
    renderBackground() {
        if (this.currentLevel && this.currentLevel.background) {
            const bgImage = this.assets.images[this.currentLevel.background];
            if (bgImage) {
                // Dessine l'image d'arrière-plan en parallaxe
                const parallaxFactor = 0.5;
                const offsetX = this.camera.x * parallaxFactor;
                
                this.ctx.drawImage(
                    bgImage, 
                    offsetX, 0, 
                    this.canvas.width, this.canvas.height
                );
            } else {
                // Couleur d'arrière-plan par défaut
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
    
    // Dessine les blocs du niveau
    renderLevel() {
        if (!this.currentLevel || !this.currentLevel.blocks) return;
        
        // Calcule les blocs visibles dans la caméra
        const startX = Math.floor(this.camera.x / this.blockSize);
        const startY = Math.floor(this.camera.y / this.blockSize);
        const endX = Math.ceil((this.camera.x + this.camera.width) / this.blockSize);
        const endY = Math.ceil((this.camera.y + this.camera.height) / this.blockSize);
        
        // Dessine chaque bloc visible
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (
                    y >= 0 && 
                    y < this.currentLevel.height && 
                    x >= 0 && 
                    x < this.currentLevel.width
                ) {
                    const blockType = this.currentLevel.blocks[y][x];
                    if (blockType && blockType !== 0) {
                        const blockX = x * this.blockSize - this.camera.x;
                        const blockY = y * this.blockSize - this.camera.y;
                        
                        // Obtient la texture du bloc
                        const blockTexture = this.getBlockTexture(blockType);
                        
                        // Dessine le bloc
                        if (blockTexture && this.assets.images[blockTexture]) {
                            this.ctx.drawImage(
                                this.assets.images[blockTexture],
                                blockX, blockY,
                                this.blockSize, this.blockSize
                            );
                        } else {
                            // Couleur de bloc par défaut
                            this.ctx.fillStyle = this.getBlockColor(blockType);
                            this.ctx.fillRect(
                                blockX, blockY,
                                this.blockSize, this.blockSize
                            );
                            
                            // Bord de bloc style Minecraft
                            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                            this.ctx.lineWidth = 1;
                            this.ctx.strokeRect(
                                blockX, blockY,
                                this.blockSize, this.blockSize
                            );
                        }
                    }
                }
            }
        }
    }
    
    // Obtient la texture d'un bloc
    getBlockTexture(blockType) {
        const blockTextures = {
            1: 'dirt',
            2: 'grass',
            3: 'stone',
            4: 'brick',
            5: 'wood',
            6: 'gold',
            7: 'lava',
            8: 'water',
            9: 'ice'
        };
        
        return blockTextures[blockType] || null;
    }
    
    // Obtient la couleur d'un bloc
    getBlockColor(blockType) {
        const blockColors = {
            1: '#8B4513', // dirt
            2: '#7CFC00', // grass
            3: '#808080', // stone
            4: '#B22222', // brick
            5: '#8B4513', // wood
            6: '#FFD700', // gold
            7: '#FF4500', // lava
            8: '#1E90FF', // water
            9: '#ADD8E6'  // ice
        };
        
        return blockColors[blockType] || '#000000';
    }
    
    // Dessine l'interface utilisateur
    renderUI() {
        if (this.player) {
            // Dessine la barre de vie
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, 10, 204, 24);
            
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(12, 12, (this.player.health / this.player.maxHealth) * 200, 20);
            
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(10, 10, 204, 24);
            
            // Dessine le texte "SANTÉ"
            this.ctx.font = '14px Arial';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SANTÉ', 110, 27);
            
            // Affiche le nombre de pièces collectées
            this.ctx.font = '18px Arial';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Pièces: ${this.player.coins}`, 10, 60);
        }
    }
}