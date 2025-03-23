/**
 * Fichier principal du jeu
 * Gère l'initialisation et les états du jeu
 */
document.addEventListener('DOMContentLoaded', () => {
  // Crée le moteur de jeu
  const engine = new GameEngine('game-canvas');
  
  // Référence aux éléments du DOM
  const menu = document.getElementById('menu');
  const mainMenu = document.getElementById('main-menu');
  const btnPlay = document.getElementById('btn-play');
  const btnInstructions = document.getElementById('btn-instructions');
  const instructions = document.getElementById('instructions');
  const btnBack = document.getElementById('btn-back');
  const characterSelect = document.getElementById('character-select');
  const characterOptions = document.querySelectorAll('.character-option');
  
  // Couleur de personnage par défaut
  let selectedCharacterColor = 'magenta';
  
  // État du jeu
  let currentLevel = 0;
  
  // Liste des assets à charger
  const assetsToLoad = {
      images: {
          // Arrière-plans
          'bg_village': 'assets/images/backgrounds/bg_village.png',
          'bg_forest': 'assets/images/backgrounds/bg_forest.png',
          'bg_cave': 'assets/images/backgrounds/bg_cave.png',
          'bg_lair': 'assets/images/backgrounds/bg_lair.png',
          
          // Textures de blocs
          'dirt': 'assets/images/blocks/dirt.png',
          'grass': 'assets/images/blocks/grass.png',
          'stone': 'assets/images/blocks/stone.png',
          'brick': 'assets/images/blocks/brick.png',
          'wood': 'assets/images/blocks/wood.png',
          'gold': 'assets/images/blocks/gold.png',
          'lava': 'assets/images/blocks/lava.png',
          'water': 'assets/images/blocks/water.png',
          'ice': 'assets/images/blocks/ice.png',
          
          // Sprites de personnage (magenta)
          'player_magenta_idle_1': 'assets/images/player/magenta_idle_1.png',
          'player_magenta_idle_2': 'assets/images/player/magenta_idle_2.png',
          'player_magenta_walk_1': 'assets/images/player/magenta_walk_1.png',
          'player_magenta_walk_2': 'assets/images/player/magenta_walk_2.png',
          'player_magenta_walk_3': 'assets/images/player/magenta_walk_3.png',
          'player_magenta_jump': 'assets/images/player/magenta_jump.png',
          'player_magenta_shoot_1': 'assets/images/player/magenta_shoot_1.png',
          'player_magenta_shoot_2': 'assets/images/player/magenta_shoot_2.png',
          
          // Sprites de personnage (cyan)
          'player_cyan_idle_1': 'assets/images/player/cyan_idle_1.png',
          'player_cyan_idle_2': 'assets/images/player/cyan_idle_2.png',
          'player_cyan_walk_1': 'assets/images/player/cyan_walk_1.png',
          'player_cyan_walk_2': 'assets/images/player/cyan_walk_2.png',
          'player_cyan_walk_3': 'assets/images/player/cyan_walk_3.png',
          'player_cyan_jump': 'assets/images/player/cyan_jump.png',
          'player_cyan_shoot_1': 'assets/images/player/cyan_shoot_1.png',
          'player_cyan_shoot_2': 'assets/images/player/cyan_shoot_2.png',
          
          // Sprites de personnage (yellow)
          'player_yellow_idle_1': 'assets/images/player/yellow_idle_1.png',
          'player_yellow_idle_2': 'assets/images/player/yellow_idle_2.png',
          'player_yellow_walk_1': 'assets/images/player/yellow_walk_1.png',
          'player_yellow_walk_2': 'assets/images/player/yellow_walk_2.png',
          'player_yellow_walk_3': 'assets/images/player/yellow_walk_3.png',
          'player_yellow_jump': 'assets/images/player/yellow_jump.png',
          'player_yellow_shoot_1': 'assets/images/player/yellow_shoot_1.png',
          'player_yellow_shoot_2': 'assets/images/player/yellow_shoot_2.png',
          
          // Sprites de personnage (red)
          'player_red_idle_1': 'assets/images/player/red_idle_1.png',
          'player_red_idle_2': 'assets/images/player/red_idle_2.png',
          'player_red_walk_1': 'assets/images/player/red_walk_1.png',
          'player_red_walk_2': 'assets/images/player/red_walk_2.png',
          'player_red_walk_3': 'assets/images/player/red_walk_3.png',
          'player_red_jump': 'assets/images/player/red_jump.png',
          'player_red_shoot_1': 'assets/images/player/red_shoot_1.png',
          'player_red_shoot_2': 'assets/images/player/red_shoot_2.png',
          
          // Sprites d'ennemis
          'sbeer_idle_1': 'assets/images/enemies/sbeer_idle_1.png',
          'sbeer_idle_2': 'assets/images/enemies/sbeer_idle_2.png',
          'sbeer_walk_1': 'assets/images/enemies/sbeer_walk_1.png',
          'sbeer_walk_2': 'assets/images/enemies/sbeer_walk_2.png',
          'sbeer_walk_3': 'assets/images/enemies/sbeer_walk_3.png',
          'sbeer_attack_1': 'assets/images/enemies/sbeer_attack_1.png',
          'sbeer_attack_2': 'assets/images/enemies/sbeer_attack_2.png',
          
          // Sprites du boss
          'boss_idle_1': 'assets/images/boss/boss_idle_1.png',
          'boss_idle_2': 'assets/images/boss/boss_idle_2.png',
          'boss_walk_1': 'assets/images/boss/boss_walk_1.png',
          'boss_walk_2': 'assets/images/boss/boss_walk_2.png',
          'boss_walk_3': 'assets/images/boss/boss_walk_3.png',
          'boss_attack1_1': 'assets/images/boss/boss_attack1_1.png',
          'boss_attack1_2': 'assets/images/boss/boss_attack1_2.png',
          'boss_attack2_1': 'assets/images/boss/boss_attack2_1.png',
          'boss_attack2_2': 'assets/images/boss/boss_attack2_2.png',
          'boss_attack3_1': 'assets/images/boss/boss_attack3_1.png',
          'boss_attack3_2': 'assets/images/boss/boss_attack3_2.png',
          'boss_hurt': 'assets/images/boss/boss_hurt.png',
          'boss_death_1': 'assets/images/boss/boss_death_1.png',
          'boss_death_2': 'assets/images/boss/boss_death_2.png',
          'boss_death_3': 'assets/images/boss/boss_death_3.png',
          'boss_death_4': 'assets/images/boss/boss_death_4.png',
          
          // Sprites de tourelle
          'turret_idle_1': 'assets/images/turret/turret_idle_1.png',
          'turret_idle_2': 'assets/images/turret/turret_idle_2.png',
          'turret_shoot_1': 'assets/images/turret/turret_shoot_1.png',
          'turret_shoot_2': 'assets/images/turret/turret_shoot_2.png',
          
          // Sprites de collectibles
          'coin_1': 'assets/images/collectibles/coin_1.png',
          'coin_2': 'assets/images/collectibles/coin_2.png',
          'coin_3': 'assets/images/collectibles/coin_3.png',
          'coin_4': 'assets/images/collectibles/coin_4.png',
          'health_1': 'assets/images/collectibles/health_1.png',
          'health_2': 'assets/images/collectibles/health_2.png',
          'health_3': 'assets/images/collectibles/health_3.png',
          'health_4': 'assets/images/collectibles/health_4.png',
          'confetti_1': 'assets/images/collectibles/confetti_1.png',
          'confetti_2': 'assets/images/collectibles/confetti_2.png',
          'confetti_3': 'assets/images/collectibles/confetti_3.png',
          'confetti_4': 'assets/images/collectibles/confetti_4.png',
          
          // Sprites d'effets
          'explosion_1': 'assets/images/effects/explosion_1.png',
          'explosion_2': 'assets/images/effects/explosion_2.png',
          'explosion_3': 'assets/images/effects/explosion_3.png',
          'explosion_4': 'assets/images/effects/explosion_4.png',
          'explosion_5': 'assets/images/effects/explosion_5.png',
          'impact_1': 'assets/images/effects/impact_1.png',
          'impact_2': 'assets/images/effects/impact_2.png',
          'impact_3': 'assets/images/effects/impact_3.png',
          'collect_1': 'assets/images/effects/collect_1.png',
          'collect_2': 'assets/images/effects/collect_2.png',
          'collect_3': 'assets/images/effects/collect_3.png',
          'collect_4': 'assets/images/effects/collect_4.png',
          'collect_5': 'assets/images/effects/collect_5.png',
          'death_1': 'assets/images/effects/death_1.png',
          'death_2': 'assets/images/effects/death_2.png',
          'death_3': 'assets/images/effects/death_3.png',
          'death_4': 'assets/images/effects/death_4.png',
          'death_5': 'assets/images/effects/death_5.png',
          'spawn_1': 'assets/images/effects/spawn_1.png',
          'spawn_2': 'assets/images/effects/spawn_2.png',
          'spawn_3': 'assets/images/effects/spawn_3.png',
          'spawn_4': 'assets/images/effects/spawn_4.png',
          'hit_1': 'assets/images/effects/hit_1.png',
          'hit_2': 'assets/images/effects/hit_2.png',
          'hit_3': 'assets/images/effects/hit_3.png',
          'sparkle_1': 'assets/images/effects/sparkle_1.png',
          'sparkle_2': 'assets/images/effects/sparkle_2.png',
          'sparkle_3': 'assets/images/effects/sparkle_3.png',
          'charge_1': 'assets/images/effects/charge_1.png',
          'charge_2': 'assets/images/effects/charge_2.png',
          'charge_3': 'assets/images/effects/charge_3.png',
          'charge_4': 'assets/images/effects/charge_4.png'
      },
      sounds: {
          // Effets sonores
          'jump': 'assets/sounds/jump.mp3',
          'shoot': 'assets/sounds/shoot.mp3',
          'coin': 'assets/sounds/coin.mp3',
          'hurt': 'assets/sounds/hurt.mp3',
          'death': 'assets/sounds/death.mp3',
          'enemyDeath': 'assets/sounds/enemy_death.mp3',
          'bossDeath': 'assets/sounds/boss_death.mp3',
          'bossHurt': 'assets/sounds/boss_hurt.mp3',
          'bossShoot': 'assets/sounds/boss_shoot.mp3',
          'bossSummon': 'assets/sounds/boss_summon.mp3',
          'bossCharge': 'assets/sounds/boss_charge.mp3',
          'bossJump': 'assets/sounds/boss_jump.mp3',
          'bossPhase': 'assets/sounds/boss_phase.mp3',
          'turretShoot': 'assets/sounds/turret_shoot.mp3',
          'turretDestroy': 'assets/sounds/turret_destroy.mp3',
          'powerup': 'assets/sounds/powerup.mp3',
          'bulletImpact': 'assets/sounds/bullet_impact.mp3',
          'bulletHit': 'assets/sounds/bullet_hit.mp3',
          'stomp': 'assets/sounds/stomp.mp3',
          'explosion': 'assets/sounds/explosion.mp3',
          'confettiAppear': 'assets/sounds/confetti_appear.mp3',
          'victory': 'assets/sounds/victory.mp3',
          'gameOver': 'assets/sounds/game_over.mp3',
          'music_menu': 'assets/sounds/music_menu.mp3',
          'music_level1': 'assets/sounds/music_level1.mp3',
          'music_level2': 'assets/sounds/music_level2.mp3',
          'music_level3': 'assets/sounds/music_level3.mp3',
          'music_boss': 'assets/sounds/music_boss.mp3'
      }
  };
  
  // Fonction pour charger tous les assets
  async function loadAssets() {
      // Crée un placeholder pour les assets manquants
      const placeholderCanvas = document.createElement('canvas');
      placeholderCanvas.width = 32;
      placeholderCanvas.height = 32;
      const ctx = placeholderCanvas.getContext('2d');
      
      // Dessine un motif à damier pour le placeholder
      ctx.fillStyle = '#FF00FF';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillRect(16, 16, 16, 16);
      
      const placeholderDataURL = placeholderCanvas.toDataURL();
      
      // Crée les dossiers d'assets s'ils n'existent pas
      await createAssetFolders();
      
      // Charge les images
      const imagePromises = Object.entries(assetsToLoad.images).map(([key, src]) => {
          return engine.loadImage(key, src).catch(err => {
              console.warn(`Failed to load image: ${src}. Using placeholder.`, err);
              const img = new Image();
              img.src = placeholderDataURL;
              engine.assets.images[key] = img;
          });
      });
      
      // Charge les sons
      const soundPromises = Object.entries(assetsToLoad.sounds).map(([key, src]) => {
          return engine.loadSound(key, src).catch(err => {
              console.warn(`Failed to load sound: ${src}`, err);
              // Crée un son silencieux comme placeholder
              const audio = new Audio();
              engine.assets.sounds[key] = audio;
          });
      });
      
      // Attend que tous les assets soient chargés
      await Promise.all([...imagePromises, ...soundPromises]);
      console.log('All assets loaded!');
  }
  
  // Crée les dossiers d'assets nécessaires
  async function createAssetFolders() {
      const folders = [
          'assets',
          'assets/images',
          'assets/images/backgrounds',
          'assets/images/blocks',
          'assets/images/player',
          'assets/images/enemies',
          'assets/images/boss',
          'assets/images/turret',
          'assets/images/collectibles',
          'assets/images/effects',
          'assets/sounds'
      ];
      
      // Fonction qui créerait les dossiers dans un environnement Node.js
      // Pour le web, on peut juste simuler cette étape
      console.log('Asset folders structure ready');
  }
  
  // Fonction pour démarrer un niveau
  function startLevel(levelIndex) {
      if (levelIndex >= LEVELS.length) {
          levelIndex = 0; // Retour au premier niveau si on a fini
      }
      
      currentLevel = levelIndex;
      const levelData = LEVELS[levelIndex];
      
      // Remplace la couleur du joueur dans le niveau
      if (levelData.entities) {
          levelData.entities.forEach(entity => {
              if (entity.type === 'player') {
                  entity.color = selectedCharacterColor;
              }
          });
      }
      
      // Charge le niveau
      engine.loadLevel(levelData);
      
      // Cache le menu
      menu.classList.add('hidden');
      
      // Démarre le jeu
      engine.gameState = 'playing';
      engine.start();
      
      // Joue la musique du niveau
      stopAllMusic();
      const musicKey = levelIndex === 3 ? 'music_boss' : `music_level${levelIndex + 1}`;
      engine.playSound(musicKey, 0.5, true);
      
      // Met en place le gestionnaire d'état du jeu
      setupGameStateListener();
  }
  
  // Arrête toutes les musiques
  function stopAllMusic() {
      const musicKeys = ['music_menu', 'music_level1', 'music_level2', 'music_level3', 'music_boss'];
      musicKeys.forEach(key => {
          if (engine.assets.sounds[key]) {
              engine.stopSound(key);
          }
      });
  }
  
  // Fonction pour revenir au menu principal
  function returnToMenu() {
      // Arrête le jeu
      engine.gameState = 'menu';
      
      // Affiche le menu
      menu.classList.remove('hidden');
      mainMenu.classList.remove('hidden');
      characterSelect.classList.add('hidden');
      instructions.classList.add('hidden');
      
      // Arrête la musique du niveau et joue la musique du menu
      stopAllMusic();
      engine.playSound('music_menu', 0.5, true);
  }
  
  // Écoute les changements d'état du jeu
  function setupGameStateListener() {
      // Vérifie périodiquement l'état du jeu
      const gameStateInterval = setInterval(() => {
          if (engine.gameState === 'gameOver') {
              clearInterval(gameStateInterval);
              handleGameOver();
          } else if (engine.gameState === 'victory') {
              clearInterval(gameStateInterval);
              handleVictory();
          } else if (engine.gameState === 'levelComplete') {
              clearInterval(gameStateInterval);
              handleLevelComplete();
          }
      }, 100);
  }
  
  // Gère la fin de partie (Game Over)
  function handleGameOver() {
      stopAllMusic();
      engine.playSound('gameOver', 1.0);
      
      setTimeout(() => {
          // Affiche l'écran de Game Over
          menu.classList.remove('hidden');
          mainMenu.classList.remove('hidden');
          characterSelect.classList.add('hidden');
          instructions.classList.add('hidden');
          
          // Ajoute un message de Game Over
          const gameOverMsg = document.createElement('h2');
          gameOverMsg.textContent = 'GAME OVER';
          gameOverMsg.style.color = '#FF0000';
          gameOverMsg.style.marginBottom = '20px';
          
          // Insère le message avant les boutons
          mainMenu.insertBefore(gameOverMsg, mainMenu.firstChild);
          
          // Joue la musique du menu
          engine.playSound('music_menu', 0.5, true);
      }, 2000);
  }
  
  // Gère la victoire
  function handleVictory() {
      stopAllMusic();
      engine.playSound('victory', 1.0);
      
      setTimeout(() => {
          // Affiche l'écran de victoire
          menu.classList.remove('hidden');
          mainMenu.classList.remove('hidden');
          characterSelect.classList.add('hidden');
          instructions.classList.add('hidden');
          
          // Ajoute un message de victoire
          const victoryMsg = document.createElement('h2');
          victoryMsg.textContent = 'VICTOIRE!';
          victoryMsg.style.color = '#FFD700';
          victoryMsg.style.marginBottom = '20px';
          
          const victoryDesc = document.createElement('p');
          victoryDesc.textContent = 'Vous avez récupéré le confetti d\'or et sauvé le carnaval de Stavelot!';
          victoryDesc.style.marginBottom = '30px';
          
          // Insère les messages avant les boutons
          mainMenu.insertBefore(victoryDesc, mainMenu.firstChild);
          mainMenu.insertBefore(victoryMsg, mainMenu.firstChild);
          
          // Joue la musique du menu
          engine.playSound('music_menu', 0.5, true);
      }, 2000);
  }
  
  // Gère la fin d'un niveau
  function handleLevelComplete() {
      stopAllMusic();
      engine.playSound('powerup', 1.0);
      
      // Passe au niveau suivant
      setTimeout(() => {
          startLevel(currentLevel + 1);
      }, 1000);
  }
  
  // Initialise le jeu
  async function initGame() {
      // Charge les assets
      await loadAssets();
      
      // Attache les événements des boutons
      btnPlay.addEventListener('click', () => {
          mainMenu.classList.add('hidden');
          characterSelect.classList.remove('hidden');
      });
      
      btnInstructions.addEventListener('click', () => {
          mainMenu.classList.add('hidden');
          instructions.classList.remove('hidden');
      });
      
      btnBack.addEventListener('click', () => {
          instructions.classList.add('hidden');
          mainMenu.classList.remove('hidden');
      });
      
      // Attache les événements de sélection de personnage
      characterOptions.forEach(option => {
          option.addEventListener('click', () => {
              selectedCharacterColor = option.dataset.color;
              startLevel(0); // Commence au premier niveau
          });
      });
      
      // Ajout d'un événement pour revenir au menu depuis le jeu (via échap)
      window.addEventListener('keydown', e => {
          if (e.key === 'Escape' && engine.gameState === 'playing') {
              returnToMenu();
          }
      });
      
      // Joue la musique du menu
      engine.playSound('music_menu', 0.5, true);
  }
  
  // Démarrer le jeu
  initGame();
});