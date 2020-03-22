import { useCallback } from "react";

const useCollision = shapes => {
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

  return { wouldCollide };
};

export default useCollision;
