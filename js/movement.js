import { movementLoad } from "./weight.js?v=20261010-weight";
import { createCollision } from "./collision.js?v=20261009";
/*
 * MYSTERY ISLAND
 * Finger-drawn movement system
 * Version 0.3
 */

export function createMovement(canvas, context, game) { 
const collision = createCollision(canvas, game);
  const state = {
    drawing: false,
    moving: false,
    route: [],
    routeIndex: 0,
    endpoint: null,
    distance: 0,
    pointerId: null
  };

  const SPEED = 95;           // pixels per second
  const MAX_ROUTE = 550;      // maximum route length
  const MIN_POINT_DISTANCE = 5;
  const PLAYER_RADIUS = 13;
  let lastTime = null;

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: Math.max(
        PLAYER_RADIUS,
        Math.min(rect.width - PLAYER_RADIUS,
          event.clientX - rect.left)
      ),
      y: Math.max(
        PLAYER_RADIUS,
        Math.min(rect.height - PLAYER_RADIUS,
          event.clientY - rect.top)
      )
    };
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

    function insidePlayableArea(point) {
    return !collision.isBlocked(point.x, point.y);
  }

  function beginDrawing(event) {
    if (!game.running || state.drawing) return;
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();

    state.moving = false;
    state.drawing = true;
    state.pointerId = event.pointerId;
    state.distance = 0;
    state.routeIndex = 1;

    state.route = [{
      x: game.player.x,
      y: game.player.y
    }];

    state.endpoint = null;

    canvas.setPointerCapture(event.pointerId);
  }

  function continueDrawing(event) {
    if (!state.drawing || event.pointerId !== state.pointerId) {
      return;
    }

    event.preventDefault();

    const point = pointFromEvent(event);

    if (!insidePlayableArea(point)) return;

    const previous = state.route[state.route.length - 1];
    const segmentLength = distance(previous, point);

    if (segmentLength < MIN_POINT_DISTANCE) return;

    // Never draw a path across a fountain, wall or another obstacle.
    // Clamp before checking so long finger gestures obey the same rule.
    const remaining = MAX_ROUTE - state.distance;
    if (remaining <= 0) return;
    const fraction = Math.min(1, remaining / segmentLength);
    const nextPoint = {
      x: previous.x + (point.x - previous.x) * fraction,
      y: previous.y + (point.y - previous.y) * fraction
    };

    if (!collision.canMove(previous.x, previous.y, nextPoint.x, nextPoint.y)) {
      return;
    }

    state.route.push(nextPoint);
    state.distance += segmentLength * fraction;
  }

  function finishDrawing(event) {
    if (!state.drawing || event.pointerId !== state.pointerId) {
      return;
    }

    event.preventDefault();

    state.drawing = false;
    state.pointerId = null;

    if (state.route.length < 2) {
      state.route = [];
      state.endpoint = null;
      return;
    }

    state.endpoint = {
      ...state.route[state.route.length - 1]
    };

    state.routeIndex = 1;
    state.moving = true;
    lastTime = null;
  }

  function cancelDrawing() {
    state.drawing = false;
    state.moving = false;
    state.route = [];
    state.endpoint = null;
    state.pointerId = null;
    lastTime = null;
  }

  function update(timestamp) {
    if (lastTime === null) {
      lastTime = timestamp;
      return;
    }

    const delta = Math.max(0, Math.min((timestamp - lastTime) / 1000, 0.05));
    lastTime = timestamp;

    if (!game.running) return;
    if (!state.moving) {
      game.player.stamina = Math.min(game.player.maxStamina, game.player.stamina + 6 * delta);
      return;
    }
    const load = movementLoad(game);
    const speed = SPEED * load.speedFactor;
    let travelled = 0;
    let remainingMovement = speed * delta;

    while (remainingMovement > 0 && state.moving) {
      const target = state.route[state.routeIndex];

      if (!target) {
        state.moving = false;
        state.route = [];
        break;
      }

      const player = game.player;
      const gap = distance(player, target);

      
      if (gap <= remainingMovement) {
        if (!collision.canMove(
          player.x, player.y,
          target.x, target.y
        )) {
          state.moving = false;
          state.route = [];
          break;
        }

        player.x = target.x;
        player.y = target.y;

        travelled += gap;
        remainingMovement -= gap;
        state.routeIndex++;

        if (state.routeIndex >= state.route.length) {
          state.moving = false;
          state.route = [];
          break;
        }
      } else {
        const nextX = player.x +
          (target.x - player.x) / gap * remainingMovement;
        const nextY = player.y +
          (target.y - player.y) / gap * remainingMovement;

        if (!collision.canMove(
          player.x, player.y,
          nextX, nextY
        )) {
          state.moving = false;
          state.route = [];
          break;
        }

        player.x = nextX;
        player.y = nextY;
        travelled += remainingMovement;
        remainingMovement = 0;
      }

    }
    game.player.stamina = Math.max(0, game.player.stamina - (travelled / speed) * load.drainPerSecond);
  }

  function draw(timestamp) {

  if (!state.drawing && !state.moving && !state.endpoint) {
    return;
  }

    const points = state.moving
      ? [
          { x: game.player.x, y: game.player.y },
          ...state.route.slice(state.routeIndex)
        ]
      : state.route;

    if (points.length > 1) {
      context.save();

      context.beginPath();
      context.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
      }

      context.strokeStyle = "#ffffff";
      context.lineWidth = 6;
      context.setLineDash([8, 9]);
      context.lineCap = "round";
      context.stroke();

      context.strokeStyle = "#167be0";
      context.lineWidth = 4;
      context.stroke();

      context.restore();
    }

    const endpoint = state.drawing
      ? state.route[state.route.length - 1]
      : state.endpoint;

    if (!endpoint) return;

    const pulse = (Math.sin(timestamp / 240) + 1) / 2;

    context.save();

    context.beginPath();
    context.arc(
      endpoint.x,
      endpoint.y,
      13 + pulse * 10,
      0,
      Math.PI * 2
    );

    context.strokeStyle = `rgba(22,123,224,${0.7 - pulse * 0.45})`;
    context.lineWidth = 3;
    context.stroke();

    context.beginPath();
    context.arc(endpoint.x, endpoint.y, 7, 0, Math.PI * 2);
    context.fillStyle = "#167be0";
    context.fill();

    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.stroke();

    context.restore();

    if (!state.drawing && !state.moving) {
      // Endpoint remains briefly visible.
      // It will be replaced when the next route begins.
    }
  }

  canvas.addEventListener("pointerdown", beginDrawing);
  canvas.addEventListener("pointermove", continueDrawing);
  canvas.addEventListener("pointerup", finishDrawing);
  canvas.addEventListener("pointercancel", cancelDrawing);

  return {
    update,
    draw,
    cancel: cancelDrawing
  };
}

