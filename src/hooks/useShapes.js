import { useState, useCallback, useEffect } from "react";
import useCollision from "./useCollision";
import {
  createNewShape,
  generateRandomShape,
  rotateVector
} from "../util/ShapeUtil";
import * as Vec2D from "vector2d";

const useShapes = () => {
  const [shapes, setShapes] = useState([]);
  const [activeShape, setActiveShape] = useState();
  const { wouldCollide } = useCollision(shapes);
  const [savedShape, setSavedShape] = useState();
  const [canSaveShape, setCanSaveShape] = useState(true);
  const [queue, setQueue] = useState([]);

  const saveShape = () => {
    //saveShape();
    if (canSaveShape) {
      if (savedShape) {
        //exchange active for saved
        let activeCopy = createNewShape(activeShape.type);
        setActiveShape(savedShape);
        setSavedShape(activeCopy);
      } else {
        setSavedShape(createNewShape(activeShape.type));
        generateNewActiveShape();
      }
      setCanSaveShape(false);
    }
  };

  const generateNewActiveShape = useCallback(() => {
    setActiveShape(generateRandomShape());
  }, []);

  const forceActiveShapeDown = useCallback(() => {
    let activeShapeCopy = activeShape.getCopy();
    activeShapeCopy.addToCoords(0, 1);

    if (!wouldCollide(activeShapeCopy)) {
      setActiveShape(activeShapeCopy);
    } else {
      setShapes([...shapes, activeShape]);
      generateNewActiveShape();
    }
  }, [activeShape, shapes, wouldCollide, generateNewActiveShape]);

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
        generateNewActiveShape();
        setShapes([...shapes, newShape]);
        //clearLines();
        //canSave = true;
        break;
      }
    }
  }, [shapes, activeShape, wouldCollide, generateNewActiveShape]);

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

  //clears lines
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
            setShapes(shapes.filter(s => s.id !== shape.id));
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
    setCanSaveShape(true);
  }, [shapes, setShapes]);

  return {
    dropShape,
    rotateShape,
    moveShape,
    shapes,
    activeShape,
    forceActiveShapeDown,
    generateNewActiveShape,
    wouldCollide,
    saveShape,
    savedShape
  };
};

export default useShapes;
