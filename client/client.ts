import { messages } from "./messages";

const messageChance = 0.5;

let dying = false;
let scaleform = 0;

const resources = globalThis.exports;

AddEventHandler("onClientMapStart", () => {
  resources.spawnmanager.spawnPlayer();
});

AddEventHandler("baseevents:onPlayerDied", (_killerType: number, deathCoords: Position) => {
  dead("died", deathCoords);
});
AddEventHandler("baseevents:onPlayerKilled", (_killerID: number, { deathCoords }: DeathData) => {
  dead("killed", deathCoords);
});
AddEventHandler("baseevents:onPlayerWasted", (deathCoords: Position) => {
  dead("wasted", deathCoords);
});

RegisterCommand("kys", () => SetEntityHealth(PlayerPedId(), 0), false);
RegisterCommand("respawn", () => resources.spawnmanager.spawnPlayer(), false);

setTick(() => {
  if (dying) HideHudAndRadarThisFrame();

  if (scaleform) DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0);
});

async function dead(type: string, pos: Position) {
  dying = true;
  /// Sound start
  SetAudioFlag("LoadMPData", true);
  RequestScriptAudioBank("OFFMISSION_WASTED", false);

  StartAudioScene("DEATH_SCENE");

  PlaySoundFrontend(-1, "Bed", "WastedSounds", true);

  SetCamEffect(1);
  SetTransitionTimecycleModifier("dying", 2);

  await sleep(2000);

  /// Wasted screen
  scaleform = RequestScaleformMovie("MP_BIG_MESSAGE_FREEMODE");
  while (!HasScaleformMovieLoaded(scaleform)) {
    await sleep(0);
  }

  BeginScaleformMovieMethod(scaleform, "SHOW_SHARD_WASTED_MP_MESSAGE");

  ScaleformMovieMethodAddParamPlayerNameString("~r~" + type);
  const msgs = messages[type];
  const subtext = msgs && Math.random() <= messageChance ? msgs[Math.floor(Math.random() * msgs.length)] : undefined;
  ScaleformMovieMethodAddParamPlayerNameString(subtext);

  EndScaleformMovieMethod();
  PlaySoundFrontend(-1, "TextHit", "WastedSounds", true);

  await sleep(2000);

  respawn(pos);

  /// Cleanup
  await sleep(500);
  dying = false;
  scaleform = 0;

  StopAudioScene("DEATH_SCENE");
  SetCamEffect(0);
  ClearTimecycleModifier();
}

function respawn(pos?: Position) {
  if (pos) {
    // Try to spawn on safe place
    const result = GetSafeCoordForPed(...pos, false, 16);
    if (result && result[0]) return spawnOn(result[1] as Position);
  }

  // Use default spawn
  spawnOn();
}

function spawnOn(coords?: Position) {
  resources.spawnmanager.spawnPlayer(
    coords
      ? {
          x: coords[0],
          y: coords[1],
          z: coords[2],
          heading: Math.random() * 360,
        }
      : undefined,
  );
}

async function sleep(duration: number) {
  return new Promise((r) => setTimeout(r, duration, undefined));
}

type Position = [number, number, number];
interface DeathData {
  killerType: number;
  weaponHash: string;
  killerInVeh: boolean;
  killerVehSeat: number;
  killerVehName: string;
  deathCoords: Position;
}
