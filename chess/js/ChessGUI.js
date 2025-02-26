class ChessGUI {
    constructor(app) {
        this.app = app;
        this.gui = new dat.GUI();
        this.setupGUI();
    }

    setupGUI() {
        // Materials folder
        const materialsFolder = this.gui.addFolder('Materials');
        const materialTypes = {
            'Wood': 'wood',
            'Metal': 'metal',
            'Plastic': 'plastic'
        };
        materialsFolder.add({ Material: 'wood' }, 'Material', materialTypes)
            .onChange(value => {
                this.app.materials.setMaterialType(
                    [...this.app.chessBoard.squares, ...this.app.chessBoard.pieces],
                    value
                );
            });

        // Camera folder
        const cameraFolder = this.gui.addFolder('Camera');
        const cameraViews = {
            'Referee View': 'referee',
            'White Player': 'white',
            'Black Player': 'black',
            'Free Camera': 'free'
        };
        cameraFolder.add({ View: 'referee' }, 'View', cameraViews)
            .onChange(value => {
                switch(value) {
                    case 'referee':
                        this.app.cameraManager.setRefereeView();
                        break;
                    case 'white':
                    case 'black':
                        this.app.cameraManager.setPlayerView(value);
                        break;
                    case 'free':
                        this.app.cameraManager.setFreeView();
                        break;
                }
            });

        // Lighting folder
        const lightingFolder = this.gui.addFolder('Lighting');
        const lightSettings = {
            'Ambient Light': 0.2,
            'Board Light': 1.0
        };
        lightingFolder.add(lightSettings, 'Ambient Light', 0, 1)
            .onChange(value => this.app.lighting.setAmbientIntensity(value));
        lightingFolder.add(lightSettings, 'Board Light', 0, 2)
            .onChange(value => this.app.lighting.setBoardLightIntensity(value));
    }
}
