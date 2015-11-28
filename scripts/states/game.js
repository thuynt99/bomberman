function Game() {
  this.nextBomb = 0;
  this.bombRate = 500;
}

Game.prototype = {
  loadLevel: function(index) {
    var levels = this.game.cache.getJSON('levels'),
    levelsIndex = index - 1,
    level = levels[levelsIndex];

    this.map = this.add.tilemap('level_' + index);
    this.map.addTilesetImage(level.title, level.tileset);
    this.map.setCollision(level.rockId, true, 'Rocks');

    //Musica
    this.backgroundMusic = this.add.audio('level_' + index, 0.6, true);
    this.backgroundMusic.play();

    this.level = level;
  },
  create: function() {
    //Mundo
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.loadLevel(this.game.rnd.between(1, 3));

    this.ground = this.map.createLayer('Ground'),
    this.rocks = this.map.createLayer('Rocks');
    this.rocks.enableBody = true;
    this.game.physics.arcade.enable(this.rocks);
    this.rocks.enableBody = true;
    this.rocks.immovable = true;

    //Bombas
    this.bombsPool = this.add.group();
    this.bombsPool.enableBody = true;
    this.bombsPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.bombsPool.setAll('body.immovable', true);
    this.bombsPool.setAll('body.allowGravity', false);

    this.keyBomb = 'voltorb';
    this.frameBomb = 0;
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.setAll('body.immovable', true);
    this.explosionPool.setAll('body.allowGravity', true);
    this.explosionRange = 1;


    this.enemyPool = this.add.group();

    //this.game.time.events.loop(5000, this.addEnemy, this);
    this.cursors = game.input.keyboard.createCursorKeys();

    var availableSpaces = [];

    this.rocks.layer.data.forEach(function(row) {
      row.forEach(function(cell) {
        if (cell.index === -1) {
          availableSpaces.push({ x: cell.x, y: cell.y });
        }
      });
    });

    this.availableSpaces = availableSpaces;

    var font = {
      font: '15px "Pokemon Regular"',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    };

    //Player
    var pos = this.availableSpaces[this.availableSpaces.length - 1];
    this.player = new Player(this.game, 14, 0, 'red', 0);
    this.bombs = this.game.add.group();

    this.scoreText = this.add.text(this.game.world.width - 30, 10, this.player.score.toString(), font);

    //Ajustes
    this.ground.resizeWorld();
    this.rocks.resizeWorld();

    this.addEnemy(1);
    this.addEnemy(2);
    this.addEnemy(3);

  },
  update: function() {
    this.physics.arcade.collide(this.player, this.rocks);
    this.physics.arcade.collide(this.enemyPool, this.rocks);
    this.physics.arcade.collide(this.player, this.enemyPool);
    this.physics.arcade.collide(this.enemyPool, this.bombsPool);
    this.physics.arcade.collide(this.player, this.bombsPool);
    this.physics.arcade.overlap(this.player, this.explosionPool, this.destroyPlayer, null, this);
    this.physics.arcade.overlap(this.enemyPool, this.explosionPool, this.destroyEnemy, null, this);

    this.player.handleMotionInput(this.level);
    this.player.handleBombInput();

    if (this.player.bombButtonJustPressed && this.player.canDropBombs(this.bombsPool) && this.time.now > this.nextBomb) {
      this.createBomb(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, this.keyBomb, 0);
    }

    if (!this.player.alive) {
      this.state.start('GameOver');
    }

    if (this.player.isMoving) {
      this.enemyPool.callAll('easyStarMovement', null, this.player, this.level);
    }
    //this.enemyDropBomb();
  },
  enemyDropBomb: function(enemy) {
    //var enemyRandom = getRandomInt(0,this.enemyPool.children.length-1);
    //if (this.enemyPool.children[enemyRandom].canDropBombs(this.bombsPool)
    //&& this.time.now > this.nextBomb
    //&& this.enemyPool.children[enemyRandom].alive) {
    //  this.createBomb(this.enemyPool.children[enemyRandom].x + this.enemyPool.children[enemyRandom].width / 2, this.enemyPool.children[enemyRandom].y + this.enemyPool.children[enemyRandom].height / 2, this.keyBomb, 0);
    //}
    var range = 64;
    // console.log("EnemigoX: " +enemy.x);
    // console.log("EnemigoY: " +enemy.y);
    // console.log("PlayerX: " +this.player.x);
    // console.log("PlayerY: " +this.player.y);
    if (enemy.alive && enemy.canDropBombs(this.bombsPool) && this.time.now > this.nextBomb)
    {
      if((enemy.x<=this.player.x && enemy.x+range>=this.player.x )|| (enemy.x>=this.player.x && enemy.x-range<=this.player.x ))
      if((enemy.y<=this.player.y && enemy.y+range>=this.player.y )|| (enemy.y>=this.player.y && enemy.y-range<=this.player.y ))

      this.createBomb(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, this.keyBomb, 0);
    }
  },
  addEnemy: function(enemyID) {
    var currentEnemy = this.enemyPool.getFirstExists(false),
        positionIndex = this.game.rnd.between(0, this.availableSpaces.length - 1),
        position = this.availableSpaces[positionIndex],
        finalPos;

    switch (enemyID) {
      case 1:
        finalPos = this.availableSpaces[this.availableSpaces.length - 1];
        break;
      case 2:
        finalPos = this.availableSpaces[this.availableSpaces.length - 1];
        finalPos.x = 0;
        break;
      case 3:
        finalPos = this.availableSpaces[this.availableSpaces.length - 1];
        finalPos.y = 0;
        break;
    }

    currentEnemy = new Enemy(this.game, finalPos.x, finalPos.y);

    this.enemyPool.add(currentEnemy);

    currentEnemy.easyStarMovement(this.player, this.level);
  },
  createBomb: function(x, y, key, frame) {
    var rocksColliding = this.getRocksColliding(x, y),
        currentBomb = this.bombsPool.getFirstExists(false);

    this.nextBomb = this.time.now + this.bombRate;

    if(!currentBomb) {
      currentBomb = new Bomb(this.game, x, y, key, frame, this.explosionPool, this.explosionRange, rocksColliding);

      this.bombsPool.add(currentBomb);
    }
    else{
      currentBomb.resetBomb(x, y, rocksColliding);
    }
  },
  destroyPlayer: function(player, explosion) {
    setTimeout(function() {
      player.kill();
      this.backgroundMusic.stop();
    }.bind(this), 40);
  },
  destroyEnemy: function(enemy, explosion) {
    enemy.kill();
    enemy.alive = false;
    this.player.score += 1;

    this.scoreText.text = this.player.score.toString();
  },
  getRocksColliding: function(x, y) {
    var column = Math.floor(x / 32),
    row = Math.floor(y / 32),
    rocksColliding = {
      up: true,
      down: true,
      left: true,
      right: true
    };

    if(row - 1>=0 && column>=0){
      if (this.rocks.layer.data[row - 1] !== undefined && this.rocks.layer.data[row - 1]) {
        rocksColliding.up = (this.rocks.layer.data[row - 1][column].index === this.level.rockId);
      }
    }
    else
    {
      rocksColliding.up = true;
    }
    if(column>=0){
      if (this.rocks.layer.data[row + 1] !== undefined && this.rocks.layer.data[row + 1]) {
        rocksColliding.down = (this.rocks.layer.data[row + 1][column].index === this.level.rockId);
      }
    }
    else
    {
      rocksColliding.down = true;
    }
    if(column - 1>=0 && row>=0){
      if (this.rocks.layer.data[row][column - 1] !== undefined && this.rocks.layer.data[row][column - 1]) {
        rocksColliding.left = (this.rocks.layer.data[row][column - 1].index === this.level.rockId);
      }
    }
    else
    {
      rocksColliding.left = true;
    }
    if(row>=0){
      if (this.rocks.layer.data[row][column + 1] !== undefined  && this.rocks.layer.data[row][column + 1]) {
        rocksColliding.right = (this.rocks.layer.data[row][column + 1].index === this.level.rockId);
      }
    }
    else
    {
      rocksColliding.right = true;
    }

    return rocksColliding;
  },
  resetPlayer: function() {
    this.player.resetForNewRound();
  },
  clearBombs: function() {
    for(var bombId in this.bombsPool) {//TODO: add detonate timer ID
      //clearTimeout(this.bombsPool[bombId].detonateTimerID);
    }
    this.bombsPool = {};
  },
  resetForNewRound: function() {
    this.clearBombs();
    this.resetPlayer();
  },
  calculateRoundWinner: function() {
    if(this.player.alive)
    {
      if(this.enemyPool.count == 0)
      this.showGameStatusAndReset();
    }
  },
  showGameStatusAndReset: function() {
  },
  getRandomInt:function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};