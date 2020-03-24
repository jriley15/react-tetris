import React, { useRef, useState, useEffect } from "react";
import classes from "./Tetris.module.css";
import useShapes from "../hooks/useShapes";
import MiniGrid from "./MiniGrid";

export default function Tetris() {
  const [ticks, setTicks] = useState(0);
  const lastTick = useRef(0);
  const {
    shapes,
    activeShape,
    dropShape,
    moveShape,
    rotateShape,
    forceActiveShapeDown,
    generateNewActiveShape,
    wouldCollide,
    saveShape,
    savedShape
  } = useShapes();

  const [skipTick, setSkipTick] = useState(-1);

  //Starts game loop
  useEffect(() => {
    let gameLoopHandler = () => {
      //force the shape to drop 1 level
      setTicks(ticks => ++ticks);
    };

    setInterval(gameLoopHandler, 500);

    return () => {
      clearInterval(gameLoopHandler);
    };
  }, []);

  useEffect(() => {
    //generate initial shape to start the game
    generateNewActiveShape();
  }, [generateNewActiveShape]);

  //Forces shape down on every 500ms tick
  useEffect(() => {
    if (lastTick.current !== ticks) {
      if (skipTick <= 0) {
        forceActiveShapeDown();
      }
      if (skipTick > -1) setSkipTick(skipTick - 1);

      lastTick.current = ticks;
    }
  }, [ticks, forceActiveShapeDown, skipTick]);

  //Sets up key press handlers for moving/rotating/dropping shapes
  useEffect(() => {
    let keyDownEventHandler = e => {
      let controls = {};
      switch (e.keyCode) {
        case 65: // A
        case 37:
          controls.left = true;
          break;
        case 87: // W
        case 38:
          controls.up = true;
          break;
        case 68: // D
        case 39:
          controls.right = true;
          break;
        case 83: // S
        case 40:
          controls.down = true;
          break;
        case 32:
          controls.space = true;
          break;
        case 67:
          controls.c = true;
          break;
        default:
          break;
      }
      if (controls.left) {
        moveShape(-1, 0);
      }
      if (controls.right) {
        moveShape(1, 0);
      }
      if (controls.down) {
        moveShape(0, 1);
      }
      if (controls.space) {
        dropShape();
      }
      if (controls.up) {
        //reset interval
        if (skipTick < 0) setSkipTick(1);
        rotateShape();
      }
      if (controls.c) {
        saveShape();
      }
    };
    document.addEventListener("keydown", keyDownEventHandler, false);

    return () => {
      document.removeEventListener("keydown", keyDownEventHandler, false);
    };
  }, [moveShape, rotateShape, dropShape, skipTick]);

  //Create grid array to render shapes
  let grid = [];
  let gridMap = new Map();

  if (activeShape) {
    //draw shadow shape
    for (let y = 0; y < 20; y++) {
      let newShape = activeShape.getCopy();
      newShape.y += y;
      newShape.coords.forEach(coordinate => {
        coordinate._y += y;
      });

      let collision = wouldCollide(newShape);

      if (collision) {
        newShape._y--;
        newShape.coords.forEach(coordinate => {
          coordinate._y--;
          gridMap.set(coordinate._x + "," + coordinate._y, {
            x: coordinate._x,
            y: coordinate._y,
            color: "grey"
          });
        });
        break;
      }
    }

    //draw active shape
    for (let coord of activeShape.coords) {
      gridMap.set(coord._x + "," + coord._y, {
        x: coord._x,
        y: coord._y,
        color: activeShape.color
      });
    }
  }

  //draw placed shapes
  for (let shape of shapes) {
    for (let coord of shape.coords) {
      gridMap.set(coord._x + "," + coord._y, {
        x: coord._x,
        y: coord._y,
        color: shape.color
      });
    }
  }

  //populate rest of grid with black default cells
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) {
      let cell = gridMap.get(x + "," + y);
      if (cell) {
        grid.push(cell);
      } else {
        grid.push({
          x: x,
          y: y,
          color: "black"
        });
      }
    }
  }

  return (
    <div className={classes.flexContainer}>
      <div className={classes.shapeContainer}>
        <span>Hold:</span>
        <div className={classes.shapeBox}>
          {savedShape && <MiniGrid shape={savedShape} />}
        </div>
      </div>
      <div className={classes.grid}>
        {grid.map((cell, index) => (
          <div
            className={classes.cell}
            key={index}
            style={{ backgroundColor: cell.color }}
          ></div>
        ))}
      </div>
      <div className={classes.shapeContainer}>
        <span>Next:</span>
        <div className={classes.shapeBox}>Nig</div>
      </div>
    </div>
  );
}
