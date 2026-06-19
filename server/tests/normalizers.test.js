const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizePlayer } = require("../providers/sportmonks/normalizers");

test("normalizePlayer reads nested Sportmonks team player payloads", () => {
  const player = normalizePlayer(
    {
      player_id: 55,
      position: { name: "Midfielder" },
      player: {
        id: 55,
        display_name: "Example Player",
        image_path: "https://cdn.example/player.png",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    },
    "team-273",
  );

  assert.equal(player.id, "player-55");
  assert.equal(player.providerId, 55);
  assert.equal(player.teamId, "team-273");
  assert.equal(player.name, "Example Player");
  assert.equal(player.position, "Midfielder");
  assert.equal(player.imageUrl, "https://cdn.example/player.png");
});

test("normalizePlayer falls back to wrapper fields when the profile include is incomplete", () => {
  const player = normalizePlayer(
    {
      id: 88,
      display_name: "Wrapper Player",
      position: { name: "Forward" },
      player: {
        id: 88,
      },
    },
    "team-273",
  );

  assert.equal(player.id, "player-88");
  assert.equal(player.teamId, "team-273");
  assert.equal(player.name, "Wrapper Player");
  assert.equal(player.position, "Forward");
});

test("normalizePlayer still supports flat player payloads", () => {
  const player = normalizePlayer(
    {
      id: 77,
      name: "Flat Player",
      position_name: "Goalkeeper",
      team_id: 273,
    },
  );

  assert.equal(player.id, "player-77");
  assert.equal(player.teamId, "team-273");
  assert.equal(player.name, "Flat Player");
  assert.equal(player.position, "Goalkeeper");
});
