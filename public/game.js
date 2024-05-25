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
                this.load.image('rat', 'rat.png')
                this.load.image('syringe', 'machine.png')
                this.load.image('needle', 'needle.png')
                this.load.image('room', 'room.png')
                this.load.image('fluid', 'fluid.png')
        }

        function create() {
                const plantTextures = [
                        'red', 'yellow', 'blue',
                        'red', 'yellow', 'blue',
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
        }

        function update() {
                this.syringe.update()
        }
};
window.onload = start()
