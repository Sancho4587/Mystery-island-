
/*
 * MYSTERY ISLAND: THE LOST KEYS
 * Collision System v0.4
 *
 * Obstacles are separate from artwork.
 * Coordinates use the game's canvas space.
 */

export function createCollision(canvas) {
  const PLAYER_RADIUS = 13;

  // Temporary obstacles for testing.
  // Later these will come from each location's map.
  const obstacles = [
    {
      id: "house",
      type: "rectangle",
      x: 75,
      y: 110,
      width: 100,
      height: 85,
      label: "Дом"
    },
    {
      id: "tree",
      type: "circle",
      x: 320,
      y: 210,
      radius: 28,
      label: "Дерево"
    },
    {
      id: "rock",
      type: "circle",
      x: 130,
      y: 340,
      radius: 24,
      label: "Камень"
    }
  ];

  function isBlocked(x, y) {
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      return true;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Preserve the existing playable-area limits.
    if (
      x < PLAYER_RADIUS ||
      x > width - PLAYER_RADIUS ||
      y < 95 ||
      y > height - 100
    ) {
      return true;
    }

    for (const obstacle of obstacles) {
      if (obstacle.type === "circle") {
        const distance = Math.hypot(
          x - obstacle.x,
          y - obstacle.y
        );

        if (
          distance <
          obstacle.radius + PLAYER_RADIUS
        ) {
          return true;
        }
      }

      if (obstacle.type === "rectangle") {
        const closestX = Math.max(
          obstacle.x,
          Math.min(x, obstacle.x + obstacle.width)
        );

        const closestY = Math.max(
          obstacle.y,
          Math.min(y, obstacle.y + obstacle.height)
        );

        const distance = Math.hypot(
          x - closestX,
          y - closestY
        );

        if (distance < PLAYER_RADIUS) {
          return true;
        }
      }
    }

    return false;
  }

  // Check the entire segment, not only its endpoint.
  // This prevents walking through thin obstacles.
  function canMove(fromX, fromY, toX, toY) {
    const length = Math.hypot(
      toX - fromX,
      toY - fromY
    );

    const steps = Math.max(
      1,
      Math.ceil(length / 3)
    );

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;

      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;

      if (isBlocked(x, y)) {
        return false;
      }
    }

    return true;
  }

  function draw(context) {
    context.save();

    for (const obstacle of obstacles) {
      context.beginPath();

      if (obstacle.type === "circle") {
        context.arc(
          obstacle.x,
          obstacle.y,
          obstacle.radius,
          0,
          Math.PI * 2
        );
      } else {
        context.roundRect(
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height,
          12
        );
      }

      context.fillStyle = "rgba(55, 85, 55, 0.75)";
      context.fill();

      context.strokeStyle = "#e8f2d4";
      context.lineWidth = 2;
      context.stroke();

      context.fillStyle = "#ffffff";
      context.font = "13px sans-serif";
      context.textAlign = "center";

      const centerX =
        obstacle.type === "circle"
          ? obstacle.x
          : obstacle.x + obstacle.width / 2;

      const centerY =
        obstacle.type === "circle"
          ? obstacle.y
          : obstacle.y + obstacle.height / 2;

      context.fillText(
        obstacle.label,
        centerX,
        centerY + 4
      );
    }

    context.restore();
  }

  return {
    isBlocked,
    canMove,
    draw
  };
}

