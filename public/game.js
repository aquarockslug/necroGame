var game;

start = function() {
        var config = {
                type: Phaser.AUTO,
                width: 600,
                height: 600,
                backgroundColor: '#bd7028',
                scene: {
                        preload: preload,
                        create: create,
                        update: update,
                }
        };

        game = new Phaser.Game(config);

        function preload() {
                // Display loading progress
                var progressBar = this.add.graphics();
                var progressBox = this.add.graphics();
                progressBox.fillStyle(0x222222, 0.8);
                progressBox.fillRect(config.width / 4, config.height / 2, 320, 50);

                // Update loading progress
                this.load.on('progress', function(value) {
                        progressBar.clear();
                        progressBar.fillStyle(0xffffff, 1);
                        progressBar.fillRect(config.width / 4 + 10,
                                config.height / 2 + 10, 300 * value, 30);
                });

                // Remove loading progress when complete
                this.load.on('complete', function() {
                        progressBar.destroy();
                        progressBox.destroy();
                });

                this.load.image('red', 'red.png')
                this.load.image('yellow', 'yellow.png')
                this.load.image('blue', 'blue.png')
                this.load.image('green', 'green.png')
                this.load.image('orange', 'orange.png')
                this.load.image('purple', 'purple.png')
                this.load.image('rat', 'rat.png')
                this.load.image('syringe', 'machine.png')
                this.load.image('needle', 'needle.png')
                this.load.image('room', 'room.png')
                this.load.image('fluid', 'fluid.png')

                this.load.audio('fire', 'fire.mp3')
                this.load.audio('forage', 'plant.mp3')
                this.load.audio('music', 'harp.mp3')
        }

        function create() {
                this.music = this.sound.add('music', {
                        volume: 0.2,
                        loop: true
                })

                this.music.play()
                const plantTextures = [
                        'red', 'orange', 'blue',
                        'purple', 'yellow', 'green',
                ]
                this.syringe = new Syringe({
                        scene: this,
                        x: config.width - config.width / 4 + 35,
                        y: config.height / 2,
                        texture: 'syringe',
                        plantTextures: plantTextures
                }).setScale(2)
                this.garden = new Garden({
                        scene: this,
                        x: config.width / 3,
                        y: config.height / 4 + 15,
                        texture: 'room',
                        outputSyringe: this.syringe,
                        plantTextures: plantTextures
                }).setScale(0.8)

                this.add.existing(this.syringe)
                this.add.existing(this.garden)

                this.add.image(
                        config.width / 4 + 2,
                        config.height - config.height / 8,
                        'room'
                )

                this.cameras.main.postFX.addColorMatrix().brightness(0.9)

                this.endGame = () => {
                        this.add.text(
                                config.width / 4,
                                config.height / 2,
                                'Success!', {
                                        fontFamily: 'serif',
                                        fontSize: 64
                                }
                        )
                        this.scene.pause()
                }
        }

        function update() {
                if (this.syringe.hasHealthy()) this.endGame()
        }
};
