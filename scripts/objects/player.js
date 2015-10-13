<<<<<<< HEAD
=======
var Bomb;
var TextureUtil = new TextureUtil();

>>>>>>> origin/master
var DEFAULT_PLAYER_SPEED = 160;


function Player(game, x, y, key, frame) {
  this.firstFrame = this.getFrame(frame, "00");
  Phaser.Sprite.call(this, game, x, y, TEXTURES, this.firstFrame);

  this.game = game;
  // this.animations.add('up', [15, 12, 13, 14], 8, true);
  // this.animations.add('left', [5, 6, 7, 4], 8, true);
  // this.animations.add('right', [9, 10, 11, 8], 8, true);
  // this.animations.add('down', [1, 2, 3, 0], 8, true);
 
  this.animations.add("up", TextureUtil.getFrames(this.getFrame, "Back", ["00", "01", "02", "03", "05", "06", "07"]), 10, true);
  this.animations.add("left", TextureUtil.getFrames(this.getFrame, "Side", ["00", "01", "02", "03", "05", "06", "07"]), 10, true);
  this.animations.add("right", TextureUtil.getFrames(this.getFrame, "Side", ["00", "01", "02", "03", "05", "06", "07"]), 10, true);
  this.animations.add("down", TextureUtil.getFrames(this.getFrame, "Front", ["00", "01", "02", "03", "05", "06", "07"]), 10, true);
  


  this.game.physics.enable(this);

<<<<<<< HEAD
  this.body.setSize(24, 24, 4, 24);
  this.anchor.setTo(0, 0);
=======
  this.body.setSize(24, 24,4,24);
  this.anchor.set(0, 0);
>>>>>>> origin/master
  this.body.collideWorldBounds = true;

  this.facing = "down";
  this.bombButtonJustPressed = false;
  this.speed = DEFAULT_PLAYER_SPEED;

  this.game.add.existing(this);
}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

// Player.prototype.create = function() {};
// Player.prototype.update = function() {};
Player.prototype.handleInput = function(rocks) {
  this.handleMotionInput(rocks);
  this.handleBombInput();
};

Player.prototype.handleMotionInput = function(rocks) {
    var moving = true;
    this.game.physics.arcade.collide(this, this.rocks);

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      this.body.velocity.y = 0;
      this.body.velocity.x = -this.speed;
      this.facing = "left";
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      this.body.velocity.y = 0;
      this.body.velocity.x = this.speed;
      this.facing = "right";
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      this.body.velocity.x = 0;
      this.body.velocity.y = -this.speed;
      this.facing = "up";
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      this.body.velocity.x = 0;
      this.body.velocity.y = this.speed;
      this.facing = "down";
    } else {
      moving = false;
      this.freeze();
    }

    if(moving)  {
      this.animations.play(this.facing);
    }
  };

  Player.prototype.handleBombInput = function() {
    if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !this.bombButtonJustPressed) {
      this.bombButtonJustPressed = true;

    } else if(!game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.bombButtonJustPressed) {
      this.bombButtonJustPressed = false;
    }
  };

  Player.prototype.getFrame = function (prefix, number) {
    var shortPrefix;
    if(prefix == "Back")
      shortPrefix = "B";
    else
      shortPrefix = "F"
      return "Bomberman/" + prefix + "/Bman_" + shortPrefix +"_f" + number + ".png";
  };

   Player.prototype.freeze = function() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.animations.stop();
  };

