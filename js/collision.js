
/*
 * MYSTERY ISLAND: THE LOST KEYS
 * Collision System v0.4
 *
 * Obstacles are separate from artwork.
 * Coordinates use the game's canvas space.
 */

export function createCollision(canvas, game) {
  const PLAYER_RADIUS = 13;

  // Temporary obstacles for testing.
  // Later these will come from each location's map.
  
  function getObstacles() {
    
const w = canvas.clientWidth;
const h = canvas.clientHeight;

    if (game.location === "homeInterior") {
      return [
        {
          id: "home-bed",
          type: "rectangle",
          x: w * 0.16,
          y: h * 0.55,
          width: w * 0.23,
          height: h * 0.14,
          label: "Кровать"
        },
        {
          id: "home-table",
          type: "rectangle",
          x: w * 0.37,
          y: h * 0.60,
          width: w * 0.24,
          height: h * 0.12,
          label: "Стол"
        },
        {
          id: "home-bookshelf",
          type: "rectangle",
          x: w * 0.75,
          y: h * 0.41,
          width: w * 0.16,
          height: h * 0.16,
          label: "Книжный шкаф"
        },
        {
          id: "home-chest",
          type: "rectangle",
          x: w * 0.685,
          y: h * 0.71,
          width: w * 0.15,
          height: h * 0.08,
          label: "Сундук"
        }
      ];
    }

    
    return [
      {
        id: "home",
        type: "rectangle",
        x: w * 0.20 - 44,
        y: h * 0.34 - 31,
        width: 88,
        height: 61,
        label: "Дом"
      },
      {
        id: "shop",
        type: "rectangle",
        x: w * 0.64 - 39,
        y: h * 0.28 - 27,
        width: 78,
        height: 54,
        label: "Лавка"
      },
      {
        id: "stable",
        type: "rectangle",
        x: w * 0.77 - 44,
        y: h * 0.56 - 23,
        width: 88,
        height: 46,
        label: "Конюшня"
      },
      {
        id: "tree-center",
        type: "circle",
        x: w * 0.52,
        y: h * 0.45 + 30,
        radius: 15,
        label: "Дерево"
      },
      {
        id: "tree-right",
        type: "circle",
        x: w * 0.83,
        y: h * 0.36 + 25,
        radius: 12,
        label: "Дерево"
      },
      {
        id: "tree-left",
        type: "circle",
        x: w * 0.10,
        y: h * 0.48 + 22,
        radius: 12,
        label: "Дерево"
      },
      {
        id: "pine-right",
        type: "circle",
        x: w * 0.90,
        y: h * 0.48 + 22,
        radius: 11,
        label: "Ель"
      },
      {
        id: "pine-left",
        type: "circle",
        x: w * 0.07,
        y: h * 0.62 + 20,
        radius: 10,
        label: "Ель"
      },
      {
        id: "fountain",
        type: "ellipse",
        x: w * 0.41,
        y: h * 0.75,
        radiusX: 30,
        radiusY: 16,
        label: "Фонтан"
      },
      {
        id: "bench-left",
        type: "rectangle",
        x: w * 0.28 - 17,
        y: h * 0.77 - 10,
        width: 34,
        height: 20,
        label: "Скамейка"
      },
      {
        id: "bench-right",
        type: "rectangle",
        x: w * 0.52 - 17,
        y: h * 0.79 - 10,
        width: 34,
        height: 20,
        label: "Скамейка"
      },
      {
        id: "lamp-left",
        type: "circle",
        x: w * 0.46,
        y: h * 0.54,
        radius: 5,
        label: "Фонарь"
      },
      {
        id: "lamp-right",
        type: "circle",
        x: w * 0.59,
        y: h * 0.61,
        radius: 5,
        label: "Фонарь"
      },
      {
        id: "rock-left",
        type: "circle",
        x: w * 0.19,
        y: h * 0.63,
        radius: 23,
        label: "Камень"
      },
      {
        id: "rock-right",
        type: "circle",
        x: w * 0.71,
        y: h * 0.47,
        radius: 13,
        label: "Камень"
      }

    ];
  }


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
      y > height - (game.location === "homeInterior" ? PLAYER_RADIUS : 100)
    ) {
      return true;
    }

    for (const obstacle of getObstacles()) {
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

      if (obstacle.type === "ellipse") {
        const dx = (x - obstacle.x) / (obstacle.radiusX + PLAYER_RADIUS);
        const dy = (y - obstacle.y) / (obstacle.radiusY + PLAYER_RADIUS);
        if (dx * dx + dy * dy < 1) return true;
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

    for (const obstacle of getObstacles()) {
      context.beginPath();

      if (obstacle.type === "circle") {
        context.arc(
          obstacle.x,
          obstacle.y,
          obstacle.radius,
          0,
          Math.PI * 2
        );
      } else if (obstacle.type === "ellipse") {
        context.ellipse(obstacle.x, obstacle.y, obstacle.radiusX, obstacle.radiusY, 0, 0, Math.PI * 2);
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
        obstacle.type !== "rectangle"
          ? obstacle.x
          : obstacle.x + obstacle.width / 2;

      const centerY =
        obstacle.type !== "rectangle"
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

