import Phaser from 'phaser';

let mirrorArray = [];

let laserGraphic;

const makeLaser = ( x1, y1, x2, y2 ) => { new Phaser.Geom.Line( x1, y1, x2, y2 ) }

const laserUp = (x, y) => {}

class MyGame extends Phaser.Scene
{
  constructor ()
  {
      super();
  }

  preload ()
  {
    this.load.image('tiles', 'src/assets/metal.png');
  }
    
  create ()
  {
    //main grid
    const board = [
      [6, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]

    // populate the tiles
    const map = this.make.tilemap({ data: board,  tileWidth: 60, tileHeight: 60 });
    const tileset = map.addTilesetImage('metal.png', 'tiles', 60, 60);
    const layer = map.createLayer( 0, tileset, 300, 0 );

    // prep the laser
    laserGraphic = this.add.graphics({ lineStyle: { width: 4, color: 0x00ff00, alpha: .7 } });

    // turn the mirrors
    const mirrorChange = (tileIndex, clickedX, clickedY) => layer.putTileAt(tileIndex, clickedX, clickedY);
    this.input.on('pointerdown', function (pointer) {
      laserGraphic.clear();
      if (game.input.mousePointer.x >= 300){
        let clickedTile = map.getTileAtWorldXY(pointer.worldX, pointer.worldY);
        let indexClicked = clickedTile.index;
        if (indexClicked < 4) {
          indexClicked++
        } else if (indexClicked == 4) {
          indexClicked = 0
        }
        mirrorChange(indexClicked, clickedTile.x, clickedTile.y);
      }
    });

    // PEW!
    const pewButton = this.add.text(75, 100, 'PEW!', { fill: '#0f0' }).setInteractive().on('pointerup', () => { shootLaser() });
    let laserDirection;
    let winConditionMet = 0;

    // moves focus to the next tile. tests direction value then adds or subtracts from point coord
    const findNextTile = function (direction, tile) {
      switch(direction) {
        case 1:                   //laser is pointing right
          tile[0] = tile[0] +1;   // x + 1
          break;
          
        case 3:                   //laser is pointing left
          tile[0] = tile[0] -1;   // x - 1
          break;
          
        case 4:                   //laser is pointing up
          tile[1] = tile[1] -1;   // y + 1
          break;
          
        case 2:                   //laser is pointing down
          tile[1] = tile[1] +1;   // y - 1
          break;
      }
    }

    // sets the direction based on mirror angle and laser direction
    const tileTest = (tileValue, tile) => {
      if (tileValue) {                  // tileValue 0 is an empty tile, returns false
        addToMirrorArray(tile)
        if (tileValue == 1) {           // tile values 1-4 indicate angle of mirror
          if (laserDirection == 1) {    // tests 2 different laser directions to see how it reflects
            laserDirection = 2;
          } else if (laserDirection == 4) {
            laserDirection = 3
          } else {                      // if laser comes from other 2 directions, hits back of mirror 
            laserDirection = null       // laser blocked, terminates all loops.
          }}

        else if (tileValue == 2) {
          if (laserDirection == 3) {
            laserDirection = 2
          } else if (laserDirection == 4) {
            laserDirection = 1
          } else {
            laserDirection = null
          }}
        
        else if (tileValue == 3) {
          if (laserDirection == 3) {
            laserDirection = 4
          } else if (laserDirection == 2) {
            laserDirection = 1
          } else {
            laserDirection = null
          }}
        
        else if (tileValue == 4) {
          if (laserDirection == 1) {
            laserDirection = 4
          } else if (laserDirection == 2) {
            laserDirection = 3
          } else {
            laserDirection = null
          }}

        else if (tileValue == 6) {
          laserDirection = null;
          winConditionMet = 1;
        }

        else {                            // also terminates if it hits blocker
            laserDirection = null;      
          }
        }
      }

    // finds the tile index from the main tile array based on canvas coordinates 
    const findTileIndex = (tile, lastTile) => {
      let thisTileX = 330 + tile[0] * 60;
      let thisTileY = 30 + tile[1] * 60;
      
      // tests if point is off the game board. If so, uses the last tile as a terminator
      if ( thisTileX > 900 || thisTileX < 300 || thisTileY > 600 || thisTileY < 0) {
        let thisNewX = 330 + lastTile[0] * 60;
        let thisNewY = 30 + lastTile[1] * 60;
        let newPoint = [thisNewX, thisNewY];
        mirrorArray.push(newPoint);
        return laserDirection = null; // this return breaks out of function, 
        //preventing return of "null" for tile index, and kills all loops by setting direction to "null"
      }

      return map.getTileAtWorldXY( thisTileX, thisTileY ).index;
    }

    const addToMirrorArray = (tile) => {
      let thisX = 330 + tile[0] * 60;
      let thisY = 30 + tile[1] * 60;
      let newPoint = [ (thisX), (thisY) ];
      mirrorArray.push(newPoint);
    }

    function shootLaser () {
      mirrorArray.length = 0;
      console.log(mirrorArray);
      mirrorArray.push([360, 30]);
      let thisTile = [0, 0];
      laserDirection = 1; //1 = right, 2 = down, 3 = left, 4 = up
      while (laserDirection) {
        let lastTile = Array.from(thisTile);
        findNextTile(laserDirection, thisTile);
        let thisIndex = findTileIndex(thisTile, lastTile);
        tileTest(thisIndex, thisTile, laserDirection);
      }
      console.log(mirrorArray);
      makeBeam(mirrorArray);
    }

    // TODO:   did I fix this? draws the beam. this seems to be working right. The beam isn't resetting correctly for some reason.
    const makeBeam = (pointArray) => {
      for ( let x = 0; x < pointArray.length - 1; x++ ) {
        console.log(x);
        let xStart = pointArray[x][0];
        let yStart = pointArray[x][1];
        let xEnd = pointArray[x + 1][0];
        let yEnd = pointArray[x + 1][1];

        let thisBeam = new Phaser.Geom.Line(xStart, yStart, xEnd, yEnd);
        laserGraphic.strokeLineShape(thisBeam);
      }
    }

    // const drawLaser = () => {
    //   let thisCount = setInterval( () => {
    //     laserGraphic.clear();
    //     let thisTile = map.getTileAtWorldXY(laserX, laserY).index;

    //     laserStart = new Phaser.Geom.Line(xStart, yStart, laserX, laserY);

    //     switch(true) {
    //       case ((thisTile == 1 && direction == 0) || (thisTile == 2 && direction == "left")):
    //         direction = "down";
    //         return laserY =5;
    //     }

    //     laserGraphic.strokeLineShape(laserStart);
    //     if ( !(((laserX + 30)%60)) && thisTile ) {
    //       clearInterval(thisCount);
    //       xStart = laserX;
    //       yStart = laserY;
    //       drawLaser();
    //     }
    //   }, 10);
    // }
    // let win = false;
    // let shootLaser = () => {  
    //     if ( laserX < 900 && laserX > 300 && laserY < 600 && laserY > 0) {
    //       let direction = 0;
    //       drawLaser();
    //   }
    // } 
  }

  update ()
  {
    // if (laserX < 900 && laserX > 300 && laserY < 600 && laserY > 0) {
    //   laserGraphic.clear();
    //   for (let i = 0; i <= 30; i++) {
    //     laserX++;
    //     laserStart = new Phaser.Geom.Line(360, 30, laserX, laserY);
    //     laserGraphic.strokeLineShape(laserStart);
    //   }
    //   console.log(overTile(laserX, laserY));
    // }
  }
}


const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    backgroundColor: 0xaaaaaa,
    width: 900,
    height: 600,
    scene: MyGame
};

const game = new Phaser.Game(config);
