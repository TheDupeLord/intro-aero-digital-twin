import {
  describe,
  expect,
  test
} from "vitest";

import {
  calculateCm,
  calculateDeltaCm,
  calculateTrimAngleDeg,
  calculateTrimAngleRad,
  degreesToRadians,
  classifyDisturbance,
  isTrimmed
} from "../../src/student/physics/trim-response.js";

describe("trim-response physics", () => {
  test(
    "converts degrees to radians within the specification reference tolerance",
    () => {
      expect(
        Math.abs(
          degreesToRadians(2.86) -
            0.04992
        )
      ).toBeLessThanOrEqual(1e-5);

      expect(
        Math.abs(
          degreesToRadians(2.0) -
            0.0349
        )
      ).toBeLessThanOrEqual(1e-5);

      expect(
        Math.abs(
          degreesToRadians(-2.0) +
            0.0349
        )
      ).toBeLessThanOrEqual(1e-5);
    }
  );

  test(
    "numerical case follows the governing equations",
    () => {
      const cm0 = 0.04;
      const cmAlphaPerRad = -0.8;
      const angleOfAttackDeg = 2.86;
      const disturbanceAlphaDeg = 2.0;

      const cm = calculateCm(
        cm0,
        cmAlphaPerRad,
        angleOfAttackDeg
      );

      const trimAngleRad =
        calculateTrimAngleRad(
          cm0,
          cmAlphaPerRad
        );

      const trimAngleDeg =
        calculateTrimAngleDeg(
          cm0,
          cmAlphaPerRad
        );

      const deltaCm =
        calculateDeltaCm(
          cmAlphaPerRad,
          disturbanceAlphaDeg
        );

      expect(cm).toBeCloseTo(
        0.000067,
        6
      );

      expect(
        trimAngleRad
      ).toBeCloseTo(
        0.05,
        6
      );

      expect(
        trimAngleDeg
      ).toBeCloseTo(
        2.864788975654116,
        6
      );

      expect(deltaCm).toBeCloseTo(
        -0.02792526803190927,
        6
      );

      expect(
        isTrimmed(cm)
      ).toBe(false);

      expect(
        classifyDisturbance(
          disturbanceAlphaDeg,
          deltaCm
        )
      ).toBe("restoring");
    }
  );

  test(
    "reversing the disturbance reverses delta_Cm while preserving Cm(alpha)",
    () => {
      const cm0 = 0.04;
      const cmAlphaPerRad = -0.8;
      const angleOfAttackDeg = 2.86;

      const positiveDeltaCm =
        calculateDeltaCm(
          cmAlphaPerRad,
          2.0
        );

      const negativeDeltaCm =
        calculateDeltaCm(
          cmAlphaPerRad,
          -2.0
        );

      const cm = calculateCm(
        cm0,
        cmAlphaPerRad,
        angleOfAttackDeg
      );

      expect(
        positiveDeltaCm
      ).toBeCloseTo(
        -0.02792526803190927,
        6
      );

      expect(
        negativeDeltaCm
      ).toBeCloseTo(
        0.02792526803190927,
        6
      );

      expect(
        negativeDeltaCm
      ).toBeCloseTo(
        -positiveDeltaCm,
        12
      );

      expect(cm).toBeCloseTo(
        0.000067,
        6
      );

      expect(
        classifyDisturbance(
          2.0,
          positiveDeltaCm
        )
      ).toBe("restoring");

      expect(
        classifyDisturbance(
          -2.0,
          negativeDeltaCm
        )
      ).toBe("restoring");
    }
  );

  test(
    "zero slope returns no unique trim angle and zero disturbance response",
    () => {
      const cm0 = 0.04;
      const cmAlphaPerRad = 0.0;
      const angleOfAttackDeg = 2.86;
      const disturbanceAlphaDeg = 2.0;

      const cm = calculateCm(
        cm0,
        cmAlphaPerRad,
        angleOfAttackDeg
      );

      const trimAngleRad =
        calculateTrimAngleRad(
          cm0,
          cmAlphaPerRad
        );

      const trimAngleDeg =
        calculateTrimAngleDeg(
          cm0,
          cmAlphaPerRad
        );

      const deltaCm =
        calculateDeltaCm(
          cmAlphaPerRad,
          disturbanceAlphaDeg
        );

      expect(cm).toBeCloseTo(
        0.04,
        12
      );

      expect(
        trimAngleRad
      ).toBeNull();

      expect(
        trimAngleDeg
      ).toBeNull();

      expect(
        deltaCm
      ).toBe(0);

      expect(
        Object.is(deltaCm, -0)
      ).toBe(false);

      expect(
        isTrimmed(cm)
      ).toBe(false);

      expect(
        classifyDisturbance(
          disturbanceAlphaDeg,
          deltaCm
        )
      ).toBe("neutral");
    }
  );

  test(
    "zero disturbance returns ordinary zero",
    () => {
      const deltaCm =
        calculateDeltaCm(
          -0.8,
          0
        );

      expect(deltaCm).toBe(0);

      expect(
        Object.is(deltaCm, -0)
      ).toBe(false);

      expect(
        classifyDisturbance(
          0,
          deltaCm
        )
      ).toBe("neutral");
    }
  );

  test(
    "rejects non-finite engineering inputs",
    () => {
      expect(() =>
        degreesToRadians(
          Number.NaN
        )
      ).toThrow();

      expect(() =>
        degreesToRadians(
          Infinity
        )
      ).toThrow();

      expect(() =>
        calculateCm(
          0.04,
          Infinity,
          2.86
        )
      ).toThrow();

      expect(() =>
        calculateTrimAngleRad(
          0.04,
          Number.NaN
        )
      ).toThrow();

      expect(() =>
        calculateDeltaCm(
          -0.8,
          Infinity
        )
      ).toThrow();

      expect(() =>
        classifyDisturbance(
          Number.NaN,
          0
        )
      ).toThrow();

      expect(() =>
        isTrimmed(Infinity)
      ).toThrow();
    }
  );
});