import * as Vec2D from "vector2d";

let index = 0;

export class Shape {
  constructor(id, x, y, coords, color, type, size) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.coords = coords;
    this.color = color;
    this.type = type;
    this.size = size;
    this.getCoord = c => {
      let index = this.coords.indexOf(c);
      return this.coords[index];
    };
    this.checkCollision = shape => {
      let collision = false;
      shape.coords.forEach(coordinate => {
        this.coords.forEach(coord => {
          if (coord._x === coordinate._x && coord._y === coordinate._y) {
            collision = true;
          }
        });
      });
      return collision;
    };

    this.isNull = () => {
      return this.coords.length === 0;
    };
    this.getCopy = () => {
      let coords = [];
      this.coords.forEach(coordinate => {
        coords.push(new Vec2D.Vector(coordinate._x, coordinate._y));
      });
      var x = this.x;
      var y = this.y;
      var color = this.color;
      return new Shape(this.id, x, y, coords, color, this.type, this.size);
    };

    this.addToCoords = (x, y) => {
      this.x += x;
      this.y += y;
      this.coords.forEach(coordinate => {
        coordinate.x += x;
        coordinate.y += y;
      });
    };
  }
}

export const generateRandomShape = () => {
  var type = Math.floor(Math.random() * 7);
  return createNewShape(type);
};

export const createNewShape = type => {
  var x = 0;
  var y = 0;
  var coords = [];
  var shape = null;

  switch (type) {
    case 0:
      x = 4;
      y = 0;
      coords.push(new Vec2D.Vector(x, y));
      coords.push(new Vec2D.Vector(x, y + 1));
      coords.push(new Vec2D.Vector(x + 1, y));
      coords.push(new Vec2D.Vector(x + 1, y + 1));
      shape = new Shape(index, x, y, coords, "yellow", type, 0);
      break;
    case 1:
      x = 4;
      y = 0;
      coords.push(new Vec2D.Vector(x - 1, y));
      coords.push(new Vec2D.Vector(x, y));
      coords.push(new Vec2D.Vector(x + 1, y));
      coords.push(new Vec2D.Vector(x + 2, y));
      shape = new Shape(index, x, y, coords, "cyan", type, 2);
      break;
    case 2:
      x = 4;
      y = 0;
      coords.push(new Vec2D.Vector(x, y));
      coords.push(new Vec2D.Vector(x, y + 1));
      coords.push(new Vec2D.Vector(x - 1, y + 1));
      coords.push(new Vec2D.Vector(x + 1, y));
      shape = new Shape(index, x, y, coords, "green", type, 1);
      break;
    case 3:
      x = 4;
      y = 0;
      coords.push(new Vec2D.Vector(x, y));
      coords.push(new Vec2D.Vector(x - 1, y));
      coords.push(new Vec2D.Vector(x, y + 1));
      coords.push(new Vec2D.Vector(x + 1, y + 1));
      shape = new Shape(index, x, y, coords, "red", type, 1);
      break;
    case 4:
      x = 4;
      y = 1;
      coords.push(new Vec2D.Vector(x, y));
      coords.push(new Vec2D.Vector(x - 1, y));
      coords.push(new Vec2D.Vector(x, y - 1));
      coords.push(new Vec2D.Vector(x + 1, y));
      shape = new Shape(index, x, y, coords, "purple", type, 1);
      break;
    case 5:
      x = 4;
      y = 1;
      coords.push(new Vec2D.Vector(x, y));
      coords.push(new Vec2D.Vector(x - 1, y));
      coords.push(new Vec2D.Vector(x - 1, y - 1));
      coords.push(new Vec2D.Vector(x + 1, y));
      shape = new Shape(index, x, y, coords, "blue", type, 2);
      break;
    case 6:
      x = 4;
      y = 1;
      coords.push(new Vec2D.Vector(x, y));
      coords.push(new Vec2D.Vector(x - 1, y));
      coords.push(new Vec2D.Vector(x + 1, y));
      coords.push(new Vec2D.Vector(x + 1, y - 1));
      shape = new Shape(index, x, y, coords, "orange", type, 2);
      break;

    default:
      break;
  }
  index++;
  return shape;
};

export const rotateVector = (cx, cy, angle, v2) => {
  angle = angle * (Math.PI / 180);
  let s = Math.sin(angle);
  let c = Math.cos(angle);
  // translate point back to origin:
  v2._x -= cx;
  v2._y -= cy;
  // rotate point
  let xnew = Math.round((10000 * (v2._x * c - v2._y * s)) / 10000);
  let ynew = Math.round((10000 * (v2._x * s + v2._y * c)) / 10000);
  // translate point back:
  v2._x = xnew + cx;
  v2._y = ynew + cy;
  return v2;
};
