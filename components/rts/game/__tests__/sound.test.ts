import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function load(stored?: string) {
  vi.resetModules();
  localStorage.clear();
  if (stored !== undefined) localStorage.setItem("farm3j_muted", stored);
  return import("../sound");
}

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("mute state", () => {
  it("reads the stored flag at import time", async () => {
    expect((await load()).getSoundMuted()).toBe(false);
    expect((await load("1")).getSoundMuted()).toBe(true);
    expect((await load("0")).getSoundMuted()).toBe(false);
  });

  it("setSoundMuted updates the flag and storage", async () => {
    const { getSoundMuted, setSoundMuted } = await load();
    setSoundMuted(true);
    expect(getSoundMuted()).toBe(true);
    expect(localStorage.getItem("farm3j_muted")).toBe("1");
    setSoundMuted(false);
    expect(getSoundMuted()).toBe(false);
    expect(localStorage.getItem("farm3j_muted")).toBe("0");
  });

  it("does not throw when storage throws", async () => {
    const { getSoundMuted, setSoundMuted } = await load();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => setSoundMuted(true)).not.toThrow();
    expect(getSoundMuted()).toBe(true);
  });
});

describe("playTone", () => {
  function stubAudio() {
    const param = () => ({
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    });
    const ctx = {
      state: "running",
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        frequency: param(),
        start: vi.fn(),
        stop: vi.fn(),
        type: "square",
      })),
      createGain: vi.fn(() => ({ connect: vi.fn(), gain: param() })),
    };
    const Ctor = vi.fn(function () {
      return ctx;
    });
    vi.stubGlobal("AudioContext", Ctor);
    return { Ctor, ctx };
  }

  it("does nothing when muted", async () => {
    const { Ctor } = stubAudio();
    const { playTone } = await load("1");
    playTone(440, 0.1);
    expect(Ctor).not.toHaveBeenCalled();
  });

  it("creates one AudioContext and an oscillator when unmuted", async () => {
    const { Ctor, ctx } = stubAudio();
    const { playTone } = await load();
    expect(() => playTone(440, 0.1)).not.toThrow();
    expect(Ctor).toHaveBeenCalledTimes(1);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });
});

describe("voice line tables", () => {
  it("has only non-empty arrays of non-empty strings", async () => {
    const { ACK_MOVE, ACK_ATTACK, ENEMY_VOICELINES } = await load();
    for (const table of [ACK_MOVE, ACK_ATTACK, ENEMY_VOICELINES]) {
      for (const lines of Object.values(table)) {
        expect(Array.isArray(lines)).toBe(true);
        expect(lines.length).toBeGreaterThan(0);
        for (const line of lines) expect(line.length).toBeGreaterThan(0);
      }
    }
  });

  it("only has attack acknowledgements for units that have move acknowledgements", async () => {
    const { ACK_MOVE, ACK_ATTACK } = await load();
    for (const key of Object.keys(ACK_ATTACK))
      expect(ACK_MOVE).toHaveProperty(key);
  });
});

describe("pickAck", () => {
  it("picks by Math.random", async () => {
    const { pickAck } = await load();
    const random = vi.spyOn(Math, "random");
    random.mockReturnValue(0);
    expect(pickAck(["a", "b", "c"])).toBe("a");
    random.mockReturnValue(0.99);
    expect(pickAck(["a", "b", "c"])).toBe("c");
  });

  it("returns an empty string for no lines", async () => {
    const { pickAck } = await load();
    expect(pickAck([])).toBe("");
  });
});
