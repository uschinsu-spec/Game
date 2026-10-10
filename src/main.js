import {Game} from './game.js';
const game=new Game();
if(document.documentElement.hasAttribute('data-test'))window.__GAME_DEBUG__=game;
game.start();
