import Phaser, { AUTO, Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './utils/constants';

import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { PartyCreationScene } from './scenes/PartyCreationScene';
import { StoreScene } from './scenes/StoreScene';
import { TravelScene } from './scenes/TravelScene';
import { HuntingScene } from './scenes/HuntingScene';
import { RiverCrossingScene } from './scenes/RiverCrossingScene';
import { EventScene } from './scenes/EventScene';
import { LandmarkScene } from './scenes/LandmarkScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: COLORS.BLACK,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
    },
    dom: {
        createContainer: true,
    },
    scene: [
        BootScene,
        TitleScene,
        PartyCreationScene,
        StoreScene,
        TravelScene,
        HuntingScene,
        RiverCrossingScene,
        EventScene,
        LandmarkScene,
        GameOverScene,
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    new Game(config);
});
