import React, { useRef, useState, useCallback, useEffect } from "react";
import { createNewShape, Shape, rotateVector } from "./ShapeUtil";
import * as Vec2D from "vector2d";
import classes from "./Tetris.module.css";

export default function Tetris() {
  const [shapes, setShapes] = useState([]);
  const [activeShape, setActiveShape] = useState();
  const [ticks, setTicks] = useState(0);
  const lastTick = useRef(0);

  const wouldCollide = useCallback(
    newShape => {
      for (let shape of shapes) {
        if (newShape.checkCollision(shape)) {
          return true;
        }
      }
      for (let coordinate of newShape.coords) {
        if (coordinate._x < 0 || coordinate._x > 9 || coordinate._y > 19) {
          return true;
        }
      }
      return false;
    },
    [shapes]
  );

  useEffect(() => {
    if (lastTick.current !== ticks) {
      let activeShapeCopy = activeShape.getCopy();
      activeShapeCopy.addToCoords(0, 1);

      if (!wouldCollide(activeShapeCopy)) {
        setActiveShape(activeShapeCopy);
      } else {
        setShapes([...shapes, activeShape]);
        setActiveShape(createNewShape());
      }

      lastTick.current = ticks;
    }
  }, [ticks, activeShape, wouldCollide, shapes]);

  useEffect(() => {
    let shapesCopy = [...shapes];
    //initialize row array to 0 count
    var rows = {};
    for (let i = 0; i <= 20; i++) {
      rows[i] = 0;
    }

    //set all row counts
    shapesCopy.forEach(shape => {
      shape.coords.forEach(coord => {
        rows[coord._y]++;
      });
    });

    //loop through all rows, beginning at the top down
    for (let row = 0; row <= 20; row++) {
      //row is complete
      if (rows[row] > 9) {
        //removes cords from all shapes that are in this row
        for (let i = 0; i < shapesCopy.length; i++) {
          let toSplice = [];
          for (let j = 0; j < shapesCopy[i].coords.length; j++) {
            if (shapesCopy[i].coords[j]._y === row) {
              toSplice.push(j);
            }
          }
          let spliced = 0;
          toSplice.forEach(id => {
            shapesCopy[i].coords.splice(id - spliced, 1);
            spliced++;
          });
        }

        //remove all shapes from shapes[] array that have their coords completely removed
        shapesCopy.forEach(shape => {
          if (shape.isNull()) {
            //this.deleteShape(shape.id);
          }
        });

        //loop through every shape and move it's y coords down if it's above the currently being removed rows
        for (let i = 0; i < shapes.length; i++) {
          let above = false;
          for (let j = 0; j < shapesCopy[i].coords.length; j++) {
            if (shapesCopy[i].coords[j]._y <= row) {
              shapesCopy[i].coords[j]._y++;
              above = true;
            }
            if (above) {
              shapesCopy[i].y++;
            }
          }
        }
        setShapes(shapesCopy);
      }
    }
  }, [shapes]);

  const dropShape = useCallback(() => {
    //loop through shapes to find drop point
    //set current shape position to new coords
    //add current shape to shapes array
    //set current shape to null

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
        });
        setActiveShape(createNewShape());
        setShapes([...shapes, newShape]);
        //clearLines();
        //canSave = true;
        break;
      }
    }
  }, [shapes, activeShape, wouldCollide]);

  const moveShape = useCallback(
    (x, y) => {
      let coords = activeShape.coords;
      let newCoords = [];

      coords.forEach(coordinate => {
        newCoords.push(new Vec2D.Vector(coordinate._x + x, coordinate._y + y));
      });
      let newShape = activeShape.getCopy();
      newShape.addToCoords(x, y);
      let collision = wouldCollide(newShape);

      if (collision) {
        //new position would collide, do nothing
      } else {
        //move request granted
        setActiveShape(newShape);
      }
    },
    [activeShape, wouldCollide]
  );

  const rotateShape = useCallback(() => {
    //hotfix for yellow square
    if (activeShape.color === "yellow") {
      return;
    }

    let newShape = activeShape.getCopy();
    for (let i = 0; i < newShape.coords.length; i++) {
      let x = newShape.x;
      let y = newShape.y;
      newShape.coords[i] = rotateVector(x, y, 90, newShape.coords[i]);
    }

    let collision = wouldCollide(newShape);

    if (collision) {
      //algorithm to alter x left or right and find new valid rotation point

      //create new shape with coords to the right and rotated
      //check collision
      //if doesn't work, try further right and check again
      //if doesn't work, try left

      let solved = false;

      for (let x = 1; x <= activeShape.size; x++) {
        let newShape = activeShape.getCopy();
        newShape.x += x;
        newShape.coords.forEach(coordinate => {
          coordinate._x += x;
        });

        for (let i = 0; i < newShape.coords.length; i++) {
          let x = newShape.x;
          let y = newShape.y;
          newShape.coords[i] = rotateVector(x, y, 90, newShape.coords[i]);
        }

        let collision = wouldCollide(newShape);

        if (!collision) {
          setActiveShape(newShape);
          solved = true;
        }
      }
      if (!solved) {
        for (let x2 = 0; x2 >= -activeShape.size; x2--) {
          let newShape = activeShape.getCopy();
          newShape.x += x2;
          newShape.coords.forEach(coordinate => {
            coordinate._x += x2;
          });

          for (let i = 0; i < newShape.coords.length; i++) {
            let x = newShape.x;
            let y = newShape.y;
            newShape.coords[i] = rotateVector(x, y, 90, newShape.coords[i]);
          }

          let collision = wouldCollide(newShape);

          if (!collision) {
            setActiveShape(newShape);
          }
        }
      }
    } else {
      setActiveShape(newShape);
    }
  }, [wouldCollide, activeShape]);

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
        rotateShape();
      }
      if (controls.c) {
        //saveShape();
      }
    };
    document.addEventListener("keydown", keyDownEventHandler, false);

    return () => {
      document.removeEventListener("keydown", keyDownEventHandler, false);
    };
  }, [moveShape, rotateShape, dropShape]);

  useEffect(() => {
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {}
    }

    let gameLoopHandler = () => {
      //force the shape to drop 1 level
      setTicks(ticks => ++ticks);
    };

    setInterval(gameLoopHandler, 500);

    //start game
    setActiveShape(createNewShape());

    return () => {
      clearInterval(gameLoopHandler);
    };
  }, []);

  //Create grid to render shapes
  let grid = [];
  let gridMap = new Map();

  if (activeShape) {
    for (let coord of activeShape.coords) {
      gridMap.set(coord._x + "," + coord._y, {
        x: coord._x,
        y: coord._y,
        color: activeShape.color
      });
    }

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
  }

  for (let shape of shapes) {
    for (let coord of shape.coords) {
      gridMap.set(coord._x + "," + coord._y, {
        x: coord._x,
        y: coord._y,
        color: shape.color
      });
    }
  }

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
    <div className={classes.grid}>
      {grid.map((cell, index) => (
        <div
          className={classes.cell}
          key={index}
          style={{ backgroundColor: cell.color }}
        ></div>
      ))}
    </div>
  );
}
