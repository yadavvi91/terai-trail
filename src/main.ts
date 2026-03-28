import Phaser, { AUTO, Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './utils/constants';

import { BootScene } from './scenes/BootScene';
import { TeraiTitleScene } from './scenes/TeraiTitleScene';
import { PartyCreationScene } from './scenes/PartyCreationScene';
import { SupplyDepotScene } from './scenes/SupplyDepotScene';
import { SettlementScene } from './scenes/SettlementScene';
import { ForagingScene } from './scenes/ForagingScene';
import { MonsoonScene } from './scenes/MonsoonScene';
import { EventScene } from './scenes/EventScene';
import { MilestoneScene } from './scenes/MilestoneScene';
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
    render: {
        preserveDrawingBuffer: true,
    },
    scene: [
        BootScene,
        TeraiTitleScene,
        PartyCreationScene,
        SupplyDepotScene,
        SettlementScene,
        ForagingScene,
        MonsoonScene,
        EventScene,
        MilestoneScene,
        GameOverScene,
    ],
};

document.addEventListener('DOMContentLoaded', () => {
    new Game(config);
});
