/**
 * Classe de base pour toutes les entités du jeu
 */
class Entity {
    constructor(engine, x, y) {
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.friction = 0.8;
        this.gravity = 0.5;
        this.onGround = false;
        this.markedForDeletion = false;
        this.zIndex = 1;
        this.facing = 'right'; // direction vers laquelle l'entité est tournée
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.1; // vitesse d'animation (en secondes)
        this.animations = {}; // contient les différentes animations
        this.currentAnimation = 'idle'; // animation par défaut
    }
    
    // Met à jour la position et l'état de l'entité
    update(deltaTime) {
        // Met à jour l'animation
        this.updateAnimation(deltaTime);
        
        // Applique la gravité
        if (!this.onGround) {
            this.velocity.y += this.gravity;
        }
        
        // Applique le frottement horizontal
        this.velocity.x *= this.friction;
        
        // Applique l'accélération
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        
        // Met à jour la position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Réinitialise l'état au sol
        this.onGround = false;
        
        // Vérifie les collisions avec le niveau
        this.engine.checkCollisions(this);
        
        // Limites de l'écran
        this.checkBoundaries();
    }
    
    // Met à jour l'animation
    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime / 1000; // Convertit en secondes
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationTimer = 0;
            this.animationFrame++;
            
            // Boucle d'animation
            const anim = this.animations[this.currentAnimation];
            if (anim && this.animationFrame >= anim.length) {
                this.animationFrame = 0;
            }
        }
    }
    
    // Vérifie que l'entité reste dans les limites du niveau
    checkBoundaries() {
        if (this.engine.currentLevel) {
            const levelWidth = this.engine.currentLevel.width * this.engine.blockSize;
            const levelHeight = this.engine.currentLevel.height * this.engine.blockSize;
            
            // Limites horizontales
            if (this.x < 0) {
                this.x = 0;
                this.velocity.x = 0;
            } else if (this.x + this.width > levelWidth) {
                this.x = levelWidth - this.width;
                this.velocity.x = 0;
            }
            
            // Limite inférieure (tombe dans un trou)
            if (this.y > levelHeight) {
                this.takeDamage(this instanceof Player ? 999 : 1); // Mort instantanée
            }
        }
    }
    
    // Dessine l'entité
    render(ctx) {
        const screenX = this.x - this.engine.camera.x;
        const screenY = this.y - this.engine.camera.y;
        
        // Vérifie si l'entité est visible à l'écran
        if (
            screenX + this.width < 0 ||
            screenY + this.height < 0 ||
            screenX > this.engine.canvas.width ||
            screenY > this.engine.canvas.height
        ) {
            return; // Ne dessine pas si hors écran
        }
        
        // Dessine l'animation courante si disponible
        const anim = this.animations[this.currentAnimation];
        if (anim && anim[this.animationFrame]) {
            const sprite = this.engine.assets.images[anim[this.animationFrame]];
            if (sprite) {
                // Retourne l'image si face à gauche
                if (this.facing === 'left') {
                    ctx.save();
                    ctx.translate(screenX + this.width, screenY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(sprite, 0, 0, this.width, this.height);
                    ctx.restore();
                } else {
                    ctx.drawImage(sprite, screenX, screenY, this.width, this.height);
                }
                return;
            }
        }
        
        // Dessine un rectangle par défaut (si pas de sprite)
        ctx.fillStyle = this.color || '#FF0000';
        ctx.fillRect(screenX, screenY, this.width, this.height);
    }
    
    // Inflige des dégâts à l'entité
    takeDamage(amount) {
        if (this.health !== undefined) {
            this.health -= amount;
            if (this.health <= 0) {
                this.die();
            }
        }
    }
    
    // Gère la mort de l'entité
    die() {
        this.markedForDeletion = true;
    }
}

/**
 * Classe pour le joueur
 */
class Player extends Entity {
    constructor(engine, x, y, color = 'magenta') {
        super(engine, x, y);
        this.width = 32;
        this.height = 48;
        this.color = color;
        this.speed = 5;
        this.jumpForce = 12;
        this.health = 100;
        this.maxHealth = 100;
        this.coins = 0;
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootDelay = 300; // 300ms entre chaque tir
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.invulnerabilityDuration = 1000; // 1 seconde d'invulnérabilité après dégâts
        this.zIndex = 10; // Le joueur est dessiné au-dessus de la plupart des entités
        
        // Couleurs pour chaque type de joueur
        this.colors = {
            magenta: '#FF00FF',
            cyan: '#00FFFF',
            yellow: '#FFFF00',
            red: '#FF0000'
        };
        
        // Définit les animations
        this.animations = {
            idle: ['player_' + color + '_idle_1', 'player_' + color + '_idle_2'],
            walk: ['player_' + color + '_walk_1', 'player_' + color + '_walk_2', 'player_' + color + '_walk_3'],
            jump: ['player_' + color + '_jump'],
            shoot: ['player_' + color + '_shoot_1', 'player_' + color + '_shoot_2']
        };
        
        this.currentAnimation = 'idle';
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Gestion des commandes du joueur
        const controls = this.engine.getPlayerControls();
        
        // Déplacement horizontal
        this.acceleration.x = 0;
        if (controls.left) {
            this.acceleration.x = -this.speed * 0.1;
            this.facing = 'left';
        }
        if (controls.right) {
            this.acceleration.x = this.speed * 0.1;
            this.facing = 'right';
        }
        
        // Saut
        if (controls.jump && this.onGround) {
            this.velocity.y = -this.jumpForce;
            this.engine.playSound('jump', 0.5);
        }
        
        // Tir
        if (controls.shoot) {
            this.shoot();
        }
        
        // Mise à jour du tir
        if (!this.canShoot) {
            this.shootCooldown += deltaTime;
            if (this.shootCooldown >= this.shootDelay) {
                this.canShoot = true;
                this.shootCooldown = 0;
            }
        }
        
        // Mise à jour de l'invulnérabilité
        if (this.invulnerable) {
            this.invulnerabilityTimer += deltaTime;
            if (this.invulnerabilityTimer >= this.invulnerabilityDuration) {
                this.invulnerable = false;
                this.invulnerabilityTimer = 0;
            }
        }
        
        // Mise à jour de l'animation
        this.updatePlayerAnimation();
        
        // Collisions avec les autres entités
        this.checkEntityCollisions();
    }
    
    // Met à jour l'animation du joueur en fonction de son état
    updatePlayerAnimation() {
        const absVelX = Math.abs(this.velocity.x);
        
        if (!this.onGround) {
            this.currentAnimation = 'jump';
        } else if (absVelX > 0.5) {
            this.currentAnimation = 'walk';
        } else {
            this.currentAnimation = 'idle';
        }
    }
    
    // Vérifie les collisions avec les autres entités
    checkEntityCollisions() {
        this.engine.entities.forEach(entity => {
            if (entity !== this && this.engine.entitiesCollide(this, entity)) {
                if (entity instanceof Enemy || entity instanceof Boss) {
                    this.collideWithEnemy(entity);
                } else if (entity instanceof Collectible) {
                    this.collectItem(entity);
                }
            }
        });
    }
    
    // Gère la collision avec un ennemi
    collideWithEnemy(enemy) {
        if (!this.invulnerable) {
            // Si on atterrit sur l'ennemi, on le tue
            if (this.velocity.y > 0 && this.y + this.height < enemy.y + enemy.height / 2) {
                enemy.takeDamage(1);
                this.velocity.y = -this.jumpForce / 1.5; // Petit rebond
                this.engine.playSound('stomp', 0.7);
            } else {
                // Sinon, on prend des dégâts
                this.takeDamage(enemy instanceof Boss ? 20 : 10);
            }
        }
    }
    
    // Collecte un objet
    collectItem(item) {
        if (item.collectibleType === 'coin') {
            this.coins++;
            this.engine.playSound('coin', 0.5);
        } else if (item.collectibleType === 'health') {
            this.health = Math.min(this.health + 20, this.maxHealth);
            this.engine.playSound('powerup', 0.5);
        } else if (item.collectibleType === 'confetti') {
            // Objet principal: le confetti d'or
            this.engine.gameState = 'victory';
            this.engine.playSound('victory', 1.0);
        }
        
        item.collect();
    }
    
    // Tire une boule de couleur
    shoot() {
        if (this.canShoot) {
            const bulletX = this.facing === 'right' ? this.x + this.width : this.x;
            const bulletY = this.y + this.height / 4; // Position au niveau du canon
            
            const bullet = new Projectile(
                this.engine,
                bulletX,
                bulletY,
                this.facing === 'right' ? 10 : -10,
                0,
                this.color,
                'player'
            );
            
            this.engine.entities.push(bullet);
            this.engine.playSound('shoot', 0.3);
            
            this.canShoot = false;
            this.shootCooldown = 0;
        }
    }
    
    // Infliger des dégâts au joueur avec invulnérabilité temporaire
    takeDamage(amount) {
        if (!this.invulnerable) {
            super.takeDamage(amount);
            this.invulnerable = true;
            this.invulnerabilityTimer = 0;
            this.engine.playSound('hurt', 0.5);
        }
    }
    
    // Rendre le joueur (avec clignotement si invulnérable)
    render(ctx) {
        if (this.invulnerable) {
            // Fait clignoter le joueur pendant l'invulnérabilité
            if (Math.floor(this.invulnerabilityTimer / 100) % 2 === 0) {
                super.render(ctx);
            }
        } else {
            super.render(ctx);
        }
    }
    
    // Gérer la mort du joueur
    die() {
        this.engine.gameState = 'gameOver';
        this.engine.playSound('death', 1.0);
    }
}

/**
 * Classe pour les ennemis
 */
class Enemy extends Entity {
    constructor(engine, x, y, enemyType = 'sbeer') {
        super(engine, x, y);
        this.enemyType = enemyType;
        this.width = 32;
        this.height = 32;
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 10;
        this.speed = 1.5;
        this.direction = 1; // 1 = droite, -1 = gauche
        this.changeDirectionTimer = 0;
        this.changeDirectionInterval = 3000; // Change de direction toutes les 3 secondes
        this.detectionRange = 200; // Distance de détection du joueur
        
        // Couleurs pour les différents types d'ennemis
        this.colors = {
            sbeer: '#8A2BE2', // Violet
            ghoul: '#006400', // Vert foncé
            spider: '#800000'  // Brun-rouge
        };
        
        this.color = this.colors[enemyType] || this.colors.sbeer;
        
        // Définit les animations
        this.animations = {
            idle: [enemyType + '_idle_1', enemyType + '_idle_2'],
            walk: [enemyType + '_walk_1', enemyType + '_walk_2', enemyType + '_walk_3'],
            attack: [enemyType + '_attack_1', enemyType + '_attack_2']
        };
        
        this.currentAnimation = 'idle';
    }
    
    update(deltaTime) {
        // Intelligence artificielle de base
        this.updateAI(deltaTime);
        
        // Met à jour l'animation
        if (Math.abs(this.velocity.x) > 0.1) {
            this.currentAnimation = 'walk';
        } else {
            this.currentAnimation = 'idle';
        }
        
        // Mise à jour standard
        super.update(deltaTime);
    }
    
    // IA de l'ennemi
    updateAI(deltaTime) {
        const player = this.engine.player;
        
        if (player) {
            // Calcule la distance avec le joueur
            const distX = player.x - this.x;
            const distY = player.y - this.y;
            const dist = Math.sqrt(distX * distX + distY * distY);
            
            // Si le joueur est à portée de détection, poursuit le joueur
            if (dist < this.detectionRange) {
                this.direction = distX > 0 ? 1 : -1;
                this.facing = this.direction > 0 ? 'right' : 'left';
                this.velocity.x = this.direction * this.speed;
                
                // Si proche du joueur, attaque
                if (dist < 50) {
                    this.currentAnimation = 'attack';
                }
            } else {
                // Patrouille normale
                this.changeDirectionTimer += deltaTime;
                
                if (this.changeDirectionTimer >= this.changeDirectionInterval) {
                    this.changeDirectionTimer = 0;
                    this.direction *= -1; // Inverse la direction
                    this.facing = this.direction > 0 ? 'right' : 'left';
                }
                
                this.velocity.x = this.direction * this.speed;
            }
        }
    }
    
    // Gestion des collisions avec les murs
    checkCollisions() {
        const collisions = this.engine.checkCollisions(this);
        
        if (collisions.left || collisions.right) {
            this.direction *= -1; // Inverse la direction si collision avec un mur
            this.facing = this.direction > 0 ? 'right' : 'left';
        }
    }
    
    // Mort de l'ennemi avec animation
    die() {
        // Crée une animation de mort
        const deathAnimation = new Effect(
            this.engine,
            this.x,
            this.y,
            'death',
            5
        );
        
        this.engine.entities.push(deathAnimation);
        this.engine.playSound('enemyDeath', 0.5);
        
        // Peut laisser tomber une pièce (30% de chance)
        if (Math.random() < 0.3) {
            const coin = new Collectible(
                this.engine,
                this.x + this.width / 4,
                this.y,
                'coin'
            );
            
            this.engine.entities.push(coin);
        }
        
        super.die();
    }
}

/**
 * Classe pour le boss final
 */
class Boss extends Entity {
    constructor(engine, x, y) {
        super(engine, x, y);
        this.width = 64;
        this.height = 96;
        this.color = '#800080'; // Mauve
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 20;
        this.speed = 2;
        this.phase = 1; // Le boss a plusieurs phases
        this.attackCooldown = 0;
        this.attackDelay = 2000; // 2 secondes entre les attaques
        this.jumpCooldown = 0;
        this.jumpDelay = 4000; // 4 secondes entre les sauts
        this.zIndex = 5; // Dessiné derrière le joueur mais devant les autres ennemis
        
        // Types d'attaques
        this.attackTypes = ['shoot', 'summon', 'charge'];
        
        // Définit les animations
        this.animations = {
            idle: ['boss_idle_1', 'boss_idle_2'],
            walk: ['boss_walk_1', 'boss_walk_2', 'boss_walk_3'],
            attack1: ['boss_attack1_1', 'boss_attack1_2'],
            attack2: ['boss_attack2_1', 'boss_attack2_2'],
            attack3: ['boss_attack3_1', 'boss_attack3_2'],
            hurt: ['boss_hurt'],
            death: ['boss_death_1', 'boss_death_2', 'boss_death_3', 'boss_death_4']
        };
        
        this.currentAnimation = 'idle';
    }
    
    update(deltaTime) {
        // IA du boss en fonction de sa phase
        this.updateBossAI(deltaTime);
        
        // Mise à jour standard
        super.update(deltaTime);
        
        // Vérifie si on doit changer de phase
        this.checkPhaseTransition();
    }
    
    // IA du boss
    updateBossAI(deltaTime) {
        const player = this.engine.player;
        
        if (!player) return;
        
        // Calcule la distance avec le joueur
        const distX = player.x - this.x;
        const distY = player.y - this.y;
        const dist = Math.sqrt(distX * distX + distY * distY);
        
        // Détermine la direction vers le joueur
        this.facing = distX > 0 ? 'right' : 'left';
        
        // Comportement selon la phase
        switch (this.phase) {
            case 1: // Phase 1: attaques de base
                this.attackCooldown += deltaTime;
                
                // Se déplace vers le joueur
                if (dist > 100) {
                    this.velocity.x = (distX > 0 ? 1 : -1) * this.speed;
                    this.currentAnimation = 'walk';
                } else {
                    this.velocity.x *= 0.9; // Ralentit
                    this.currentAnimation = 'idle';
                }
                
                // Attaque si le cooldown est terminé
                if (this.attackCooldown >= this.attackDelay) {
                    this.attackCooldown = 0;
                    this.attack();
                }
                break;
                
            case 2: // Phase 2: plus agressif, sauts
                this.attackCooldown += deltaTime;
                this.jumpCooldown += deltaTime;
                
                // Se déplace plus rapidement
                if (dist > 80) {
                    this.velocity.x = (distX > 0 ? 1 : -1) * (this.speed * 1.5);
                    this.currentAnimation = 'walk';
                } else {
                    this.velocity.x *= 0.9;
                    this.currentAnimation = 'idle';
                }
                
                // Saute vers le joueur
                if (this.jumpCooldown >= this.jumpDelay && this.onGround) {
                    this.jumpCooldown = 0;
                    this.velocity.y = -12;
                    this.velocity.x = (distX > 0 ? 1 : -1) * (this.speed * 3);
                    this.engine.playSound('bossJump', 0.7);
                }
                
                // Attaque plus fréquemment
                if (this.attackCooldown >= this.attackDelay * 0.7) {
                    this.attackCooldown = 0;
                    this.attack();
                }
                break;
                
            case 3: // Phase 3: enragé, attaques multiples
                this.attackCooldown += deltaTime;
                this.jumpCooldown += deltaTime;
                
                // Mouvements erratiques
                if (this.attackCooldown % 500 < 250) {
                    this.velocity.x = (distX > 0 ? 1 : -1) * (this.speed * 2);
                } else {
                    this.velocity.x = (distX > 0 ? -1 : 1) * (this.speed * 2);
                }
                
                this.currentAnimation = 'walk';
                
                // Sauts fréquents
                if (this.jumpCooldown >= this.jumpDelay * 0.5 && this.onGround) {
                    this.jumpCooldown = 0;
                    this.velocity.y = -14;
                    this.engine.playSound('bossJump', 0.7);
                }
                
                // Attaques très fréquentes
                if (this.attackCooldown >= this.attackDelay * 0.4) {
                    this.attackCooldown = 0;
                    // Chance d'attaque double
                    this.attack();
                    
                    if (Math.random() < 0.3) {
                        setTimeout(() => this.attack(), 500);
                    }
                }
                break;
        }
    }
    
    // Vérifie si on doit passer à la phase suivante
    checkPhaseTransition() {
        const healthPercent = this.health / this.maxHealth * 100;
        
        if (this.phase === 1 && healthPercent <= 66) {
            this.phase = 2;
            this.engine.playSound('bossPhase', 1.0);
        } else if (this.phase === 2 && healthPercent <= 33) {
            this.phase = 3;
            this.engine.playSound('bossPhase', 1.0);
        }
    }
    
    // Attaque du boss
    attack() {
        // Choix aléatoire d'attaque
        const attackType = this.attackTypes[Math.floor(Math.random() * this.attackTypes.length)];
        
        switch (attackType) {
            case 'shoot':
                this.currentAnimation = 'attack1';
                
                // Tire plusieurs projectiles
                const shootCount = this.phase; // 1, 2 ou 3 selon la phase
                
                for (let i = 0; i < shootCount; i++) {
                    setTimeout(() => {
                        if (this.markedForDeletion) return; // Si le boss est mort entre temps
                        
                        const bulletX = this.facing === 'right' ? this.x + this.width : this.x;
                        const bulletY = this.y + this.height / 3;
                        
                        // Tire dans la direction du joueur avec une légère dispersion
                        const angle = -10 + i * 20;
                        const rad = angle * Math.PI / 180;
                        const speed = 8;
                        const velX = (this.facing === 'right' ? 1 : -1) * Math.cos(rad) * speed;
                        const velY = Math.sin(rad) * speed;
                        
                        const bullet = new Projectile(
                            this.engine,
                            bulletX,
                            bulletY,
                            velX,
                            velY,
                            'boss',
                            'enemy'
                        );
                        
                        this.engine.entities.push(bullet);
                        this.engine.playSound('bossShoot', 0.5);
                    }, i * 200);
                }
                break;
                
            case 'summon':
                this.currentAnimation = 'attack2';
                this.engine.playSound('bossSummon', 0.7);
                
                // Invoque des sbires
                const spawnCount = Math.min(this.phase, 2); // Max 2 sbires à la fois
                
                for (let i = 0; i < spawnCount; i++) {
                    setTimeout(() => {
                        if (this.markedForDeletion) return;
                        
                        const spawnX = this.x + (i % 2 === 0 ? -50 : this.width + 50);
                        const spawnY = this.y;
                        
                        const enemy = new Enemy(
                            this.engine,
                            spawnX,
                            spawnY,
                            'sbeer'
                        );
                        
                        this.engine.entities.push(enemy);
                        
                        // Effet de spawn
                        const spawnEffect = new Effect(
                            this.engine,
                            spawnX,
                            spawnY,
                            'spawn',
                            5
                        );
                        
                        this.engine.entities.push(spawnEffect);
                    }, 500 + i * 300);
                }
                break;
                
            case 'charge':
                this.currentAnimation = 'attack3';
                this.engine.playSound('bossCharge', 0.7);
                
                // Charge dans la direction du joueur
                const chargeSpeed = 10 + this.phase * 2;
                this.velocity.x = (this.facing === 'right' ? 1 : -1) * chargeSpeed;
                
                // Effet de charge
                const chargeEffect = new Effect(
                    this.engine,
                    this.x,
                    this.y,
                    'charge',
                    10
                );
                
                this.engine.entities.push(chargeEffect);
                break;
        }
    }
    
    // Prend des dégâts avec animation
    takeDamage(amount) {
        super.takeDamage(amount);
        
        this.currentAnimation = 'hurt';
        setTimeout(() => {
            if (!this.markedForDeletion) {
                this.currentAnimation = 'idle';
            }
        }, 200);
        
        // Effet de dégâts
        const hitEffect = new Effect(
            this.engine,
            this.x + this.width / 2,
            this.y + this.height / 2,
            'hit',
            5
        );
        
        this.engine.entities.push(hitEffect);
        this.engine.playSound('bossHurt', 0.5);
    }
    
    // Mort du boss avec séquence d'animation
    die() {
        this.engine.playSound('bossDeath', 1.0);
        this.currentAnimation = 'death';
        
        // Animation de mort progressive
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // Séquence d'explosions
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const explosionX = this.x + Math.random() * this.width;
                const explosionY = this.y + Math.random() * this.height;
                
                const explosion = new Effect(
                    this.engine,
                    explosionX,
                    explosionY,
                    'explosion',
                    8
                );
                
                this.engine.entities.push(explosion);
                this.engine.playSound('explosion', 0.3);
            }, i * 200);
        }
        
        // Crée le confetti d'or à récupérer
        setTimeout(() => {
            const confetti = new Collectible(
                this.engine,
                this.x + this.width / 2,
                this.y + this.height / 2,
                'confetti'
            );
            
            this.engine.entities.push(confetti);
            this.engine.playSound('confettiAppear', 1.0);
            
            super.die();
        }, 2000);
    }
    
    // Affiche la barre de vie du boss
    render(ctx) {
        super.render(ctx);
        
        // Affiche la barre de vie du boss
        if (this.health <= this.maxHealth) {
            const screenX = this.x - this.engine.camera.x;
            const screenY = this.y - this.engine.camera.y - 20;
            
            // Fond de la barre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(screenX, screenY, this.width, 10);
            
            // Barre de vie
            ctx.fillStyle = this.phase === 1 ? '#FF0000' : this.phase === 2 ? '#FF6600' : '#FF00FF';
            ctx.fillRect(screenX, screenY, (this.health / this.maxHealth) * this.width, 10);
            
            // Contour
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, this.width, 10);
        }
    }
}

/**
 * Classe pour les projectiles (tirs)
 */
class Projectile extends Entity {
    constructor(engine, x, y, velocityX, velocityY, color, type) {
        super(engine, x, y);
        this.width = 16;
        this.height = 16;
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
        this.color = color;
        this.type = type; // 'player' ou 'enemy'
        this.damage = type === 'player' ? 5 : 10;
        this.lifespan = 2000; // Durée de vie en ms
        this.zIndex = 3;
        
        // Définit les couleurs
        this.colors = {
            magenta: '#FF00FF',
            cyan: '#00FFFF',
            yellow: '#FFFF00',
            red: '#FF0000',
            boss: '#8A2BE2'
        };
        
        // Effet de traînée
        this.trail = [];
        this.maxTrailLength = 5;
    }
    
    update(deltaTime) {
        // Met à jour la position sans collision avec le sol
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Stocke la position pour la traînée
        this.trail.unshift({x: this.x, y: this.y});
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        // Réduit la durée de vie
        this.lifespan -= deltaTime;
        if (this.lifespan <= 0) {
            this.markedForDeletion = true;
        }
        
        // Vérifie les collisions avec les blocs
        const collisions = this.engine.checkCollisions(this);
        if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
            // Crée un effet d'impact
            const impact = new Effect(
                this.engine,
                this.x,
                this.y,
                'impact',
                3
            );
            
            this.engine.entities.push(impact);
            this.engine.playSound('bulletImpact', 0.2);
            this.markedForDeletion = true;
        }
        
        // Vérifie les collisions avec les entités
        this.checkEntityCollisions();
    }
    
    // Vérifie les collisions avec les autres entités
    checkEntityCollisions() {
        this.engine.entities.forEach(entity => {
            if (entity !== this && this.engine.entitiesCollide(this, entity)) {
                if (this.type === 'player' && (entity instanceof Enemy || entity instanceof Boss)) {
                    entity.takeDamage(this.damage);
                    this.markedForDeletion = true;
                    
                    // Effet d'impact
                    const impact = new Effect(
                        this.engine,
                        this.x,
                        this.y,
                        'impact',
                        3
                    );
                    
                    this.engine.entities.push(impact);
                    this.engine.playSound('bulletHit', 0.3);
                } else if (this.type === 'enemy' && entity instanceof Player) {
                    entity.takeDamage(this.damage);
                    this.markedForDeletion = true;
                }
            }
        });
    }
    
    render(ctx) {
        const screenX = this.x - this.engine.camera.x;
        const screenY = this.y - this.engine.camera.y;
        
        // Dessine la traînée
        for (let i = this.trail.length - 1; i >= 0; i--) {
            const trailX = this.trail[i].x - this.engine.camera.x;
            const trailY = this.trail[i].y - this.engine.camera.y;
            const alpha = 0.2 + (i / this.trail.length) * 0.5;
            const size = (this.width / 2) * (i / this.trail.length);
            
            ctx.fillStyle = `${this.colors[this.color] || this.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(trailX + this.width / 2, trailY + this.height / 2, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Dessine le projectile
        ctx.fillStyle = this.colors[this.color] || this.color;
        ctx.beginPath();
        ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Ajoute un effet de brillance
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(screenX + this.width / 2 - 2, screenY + this.height / 2 - 2, this.width / 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Classe pour les tourelles (aides au joueur)
 */
class Turret extends Entity {
    constructor(engine, x, y) {
        super(engine, x, y);
        this.width = 32;
        this.height = 48;
        this.color = '#00BFFF'; // Bleu clair
        this.shootCooldown = 0;
        this.shootDelay = 1500; // 1.5s entre chaque tir
        this.shootRange = 300; // Portée de détection
        this.health = 30;
        this.maxHealth = 30;
        this.zIndex = 2;
        
        // Définit les animations
        this.animations = {
            idle: ['turret_idle_1', 'turret_idle_2'],
            shoot: ['turret_shoot_1', 'turret_shoot_2']
        };
        
        this.currentAnimation = 'idle';
    }
    
    update(deltaTime) {
        // Les tourelles ne se déplacent pas
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // Vérifie si des ennemis sont à portée
        this.shootCooldown += deltaTime;
        
        if (this.shootCooldown >= this.shootDelay) {
            const targetEnemy = this.findNearestEnemy();
            
            if (targetEnemy) {
                this.shoot(targetEnemy);
                this.shootCooldown = 0;
                
                // Animation de tir
                this.currentAnimation = 'shoot';
                setTimeout(() => {
                    if (!this.markedForDeletion) {
                        this.currentAnimation = 'idle';
                    }
                }, 300);
            }
        }
        
        this.updateAnimation(deltaTime);
    }
    
    // Trouve l'ennemi le plus proche
    findNearestEnemy() {
        let nearestEnemy = null;
        let shortestDistance = this.shootRange;
        
        this.engine.entities.forEach(entity => {
            if (entity instanceof Enemy || entity instanceof Boss) {
                const distX = entity.x - this.x;
                const distY = entity.y - this.y;
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                if (dist < shortestDistance) {
                    shortestDistance = dist;
                    nearestEnemy = entity;
                }
            }
        });
        
        return nearestEnemy;
    }
    
    // Tire sur l'ennemi
    shoot(enemy) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 4;
        
        // Calcule la direction vers l'ennemi
        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;
        
        const dirX = enemyCenterX - centerX;
        const dirY = enemyCenterY - centerY;
        const length = Math.sqrt(dirX * dirX + dirY * dirY);
        
        const normalizedDirX = dirX / length;
        const normalizedDirY = dirY / length;
        
        const bulletSpeed = 8;
        const velocityX = normalizedDirX * bulletSpeed;
        const velocityY = normalizedDirY * bulletSpeed;
        
        // Détermine la direction
        this.facing = dirX > 0 ? 'right' : 'left';
        
        // Crée un projectile plus gros
        const bullet = new Projectile(
            this.engine,
            centerX,
            centerY,
            velocityX,
            velocityY,
            'cyan', // Les tourelles tirent toujours en cyan
            'player'
        );
        
        bullet.width = 24;
        bullet.height = 24;
        bullet.damage = 10;
        
        this.engine.entities.push(bullet);
        this.engine.playSound('turretShoot', 0.4);
    }
    
    // Mort de la tourelle
    die() {
        // Effet d'explosion
        const explosion = new Effect(
            this.engine,
            this.x,
            this.y,
            'explosion',
            5
        );
        
        this.engine.entities.push(explosion);
        this.engine.playSound('turretDestroy', 0.6);
        
        super.die();
    }
}

/**
 * Classe pour les objets à collecter
 */
class Collectible extends Entity {
    constructor(engine, x, y, collectibleType = 'coin') {
        super(engine, x, y);
        this.collectibleType = collectibleType;
        this.width = collectibleType === 'confetti' ? 32 : 16;
        this.height = collectibleType === 'confetti' ? 32 : 16;
        this.bobAmplitude = 5; // Amplitude du mouvement vertical
        this.bobFrequency = 0.002; // Fréquence du mouvement
        this.startY = y;
        this.rotation = 0;
        this.rotationSpeed = collectibleType === 'confetti' ? 0.1 : 0.05;
        this.zIndex = 3;
        this.gravity = 0; // Les collectibles flottent
        
        // Couleurs pour les différents types
        this.colors = {
            coin: '#FFD700', // Or
            health: '#FF6347', // Rouge-orange (tomate)
            confetti: '#FFD700'  // Or pour le confetti d'or
        };
        
        this.color = this.colors[collectibleType] || this.colors.coin;
        
        // Définit les animations
        this.animations = {
            idle: [collectibleType + '_1', collectibleType + '_2', collectibleType + '_3', collectibleType + '_4']
        };
        
        this.currentAnimation = 'idle';
        this.animationSpeed = 0.15; // Plus lent pour les pièces
    }
    
    update(deltaTime) {
        // Mouvement de flottement
        this.y = this.startY + Math.sin(performance.now() * this.bobFrequency) * this.bobAmplitude;
        
        // Rotation
        this.rotation += this.rotationSpeed;
        
        // Animation
        this.updateAnimation(deltaTime);
        
        // Le confetti d'or brille plus fort
        if (this.collectibleType === 'confetti') {
            // Crée des particules scintillantes
            if (Math.random() < 0.1) {
                const particleX = this.x + Math.random() * this.width;
                const particleY = this.y + Math.random() * this.height;
                
                const sparkle = new Effect(
                    this.engine,
                    particleX,
                    particleY,
                    'sparkle',
                    3
                );
                
                this.engine.entities.push(sparkle);
            }
        }
    }
    
    render(ctx) {
        const screenX = this.x - this.engine.camera.x;
        const screenY = this.y - this.engine.camera.y;
        
        ctx.save();
        
        // Translation au centre de l'objet pour la rotation
        ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Dessine l'animation si disponible
        const anim = this.animations[this.currentAnimation];
        if (anim && anim[this.animationFrame]) {
            const sprite = this.engine.assets.images[anim[this.animationFrame]];
            if (sprite) {
                ctx.drawImage(
                    sprite,
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height
                );
            } else {
                // Dessine un cercle par défaut
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Reflet
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(-this.width / 6, -this.height / 6, this.width / 6, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Dessine un cercle par défaut
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Reflet
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(-this.width / 6, -this.height / 6, this.width / 6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Objet collecté
    collect() {
        // Effet de collection
        const collectEffect = new Effect(
            this.engine,
            this.x,
            this.y,
            'collect',
            5
        );
        
        this.engine.entities.push(collectEffect);
        this.markedForDeletion = true;
    }
}

/**
 * Classe pour les effets visuels temporaires
 */
class Effect extends Entity {
    constructor(engine, x, y, effectType, duration) {
        super(engine, x, y);
        this.effectType = effectType;
        this.duration = duration; // Durée en frames
        this.frame = 0;
        this.frameDelay = 100; // ms entre chaque frame
        this.frameTimer = 0;
        this.zIndex = 15; // Dessiner au-dessus de la plupart des entités
        
        // Définir la taille en fonction du type d'effet
        switch (effectType) {
            case 'explosion':
                this.width = 64;
                this.height = 64;
                break;
            case 'impact':
                this.width = 32;
                this.height = 32;
                break;
            case 'collect':
                this.width = 32;
                this.height = 32;
                break;
            case 'death':
                this.width = 48;
                this.height = 48;
                break;
            case 'sparkle':
                this.width = 16;
                this.height = 16;
                break;
            default:
                this.width = 32;
                this.height = 32;
        }
        
        // Définit les animations
        this.animations = {
            explosion: ['explosion_1', 'explosion_2', 'explosion_3', 'explosion_4', 'explosion_5'],
            impact: ['impact_1', 'impact_2', 'impact_3'],
            collect: ['collect_1', 'collect_2', 'collect_3', 'collect_4', 'collect_5'],
            death: ['death_1', 'death_2', 'death_3', 'death_4', 'death_5'],
            spawn: ['spawn_1', 'spawn_2', 'spawn_3', 'spawn_4'],
            charge: ['charge_1', 'charge_2', 'charge_3', 'charge_4'],
            hit: ['hit_1', 'hit_2', 'hit_3'],
            sparkle: ['sparkle_1', 'sparkle_2', 'sparkle_3']
        };
        
        this.currentAnimation = effectType;
    }
    
    update(deltaTime) {
        // Mise à jour de l'animation
        this.frameTimer += deltaTime;
        
        if (this.frameTimer >= this.frameDelay) {
            this.frameTimer = 0;
            this.frame++;
            
            if (this.frame >= this.duration) {
                this.markedForDeletion = true;
            }
        }
        
        // Met à jour les propriétés spécifiques en fonction du type d'effet
        switch (this.effectType) {
            case 'sparkle':
                // Les étincelles montent lentement
                this.y -= 0.5;
                break;
            case 'collect':
                // L'effet de collection monte
                this.y -= 1;
                break;
        }
    }
    
    render(ctx) {
        const screenX = this.x - this.engine.camera.x;
        const screenY = this.y - this.engine.camera.y;
        
        // Dessine l'animation si disponible
        const anim = this.animations[this.effectType];
        if (anim) {
            const frameIdx = Math.min(this.frame, anim.length - 1);
            const sprite = this.engine.assets.images[anim[frameIdx]];
            
            if (sprite) {
                ctx.drawImage(
                    sprite,
                    screenX - this.width / 2,
                    screenY - this.height / 2,
                    this.width,
                    this.height
                );
                return;
            }
        }
        
        // Dessine un effet par défaut si pas de sprite
        ctx.globalAlpha = 1 - (this.frame / this.duration);
        
        switch (this.effectType) {
            case 'explosion':
                ctx.fillStyle = '#FF6600';
                ctx.beginPath();
                ctx.arc(screenX, screenY, this.width / 2 * (this.frame / this.duration + 0.5), 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'impact':
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(screenX, screenY, this.width / 3 * (1 - this.frame / this.duration), 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'collect':
                ctx.fillStyle = '#FFD700';
                ctx.font = `${20 - this.frame * 2}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText('+1', screenX, screenY);
                break;
                
            case 'sparkle':
                ctx.fillStyle = '#FFFF99';
                ctx.beginPath();
                ctx.arc(screenX, screenY, this.width / 4 * (1 - this.frame / this.duration), 0, Math.PI * 2);
                ctx.fill();
                break;
                
            default:
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(screenX, screenY, this.width / 3, 0, Math.PI * 2);
                ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
}