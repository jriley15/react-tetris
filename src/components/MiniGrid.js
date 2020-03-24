import React from "react";
import classes from "./MiniGrid.module.css";

export default function MiniGrid({ shape }) {
  //Create grid array to render shapes
  let grid = [];
  let gridMap = new Map();

  //draw placed shapes
  for (let coord of shape.coords) {
    gridMap.set(coord._x + "," + coord._y, {
      x: coord._x,
      y: coord._y,
      color: shape.color
    });
  }

  //populate rest of grid with black default cells
  for (let y = 0; y < 2; y++) {
    for (let x = 3; x < 7; x++) {
      let cell = gridMap.get(x + "," + y);
      if (cell) {
        grid.push(cell);
      } else {
        grid.push({
          x: x,
          y: y,
          color: "transparent"
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
