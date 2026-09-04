const DEG_TO_RAD = Math.PI / 180;
const TRIM_TOLERANCE = 1e-6;

function assertFiniteNumber(value, name) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

// Input: degrees.
// Output: radians.
// Angles are converted before applying Cm_alpha, which is per radian.
export function degreesToRadians(degrees) {
  assertFiniteNumber(degrees, "degrees");
  return degrees * DEG_TO_RAD;
}

// Inputs:
// cm0: dimensionless
// cmAlphaPerRad: 1/rad
// angleOfAttackDeg: deg
//
// Output: Cm(alpha), dimensionless.
// Positive Cm and positive angle of attack are nose-up.
export function calculateCm(
  cm0,
  cmAlphaPerRad,
  angleOfAttackDeg
) {
  assertFiniteNumber(cm0, "cm0");
  assertFiniteNumber(cmAlphaPerRad, "cmAlphaPerRad");
  assertFiniteNumber(angleOfAttackDeg, "angleOfAttackDeg");

  const alphaRad =
    degreesToRadians(angleOfAttackDeg);

  return cm0 + cmAlphaPerRad * alphaRad;
}

// Inputs:
// cm0: dimensionless
// cmAlphaPerRad: 1/rad
//
// Output:
// trim angle in radians, or null when no unique trim angle exists.
export function calculateTrimAngleRad(
  cm0,
  cmAlphaPerRad
) {
  assertFiniteNumber(cm0, "cm0");
  assertFiniteNumber(cmAlphaPerRad, "cmAlphaPerRad");

  if (cmAlphaPerRad === 0) {
    return null;
  }

  return -cm0 / cmAlphaPerRad;
}

// Output:
// trim angle in degrees, or null when no unique trim angle exists.
export function calculateTrimAngleDeg(
  cm0,
  cmAlphaPerRad
) {
  const trimAngleRad =
    calculateTrimAngleRad(
      cm0,
      cmAlphaPerRad
    );

  if (trimAngleRad === null) {
    return null;
  }

  return trimAngleRad / DEG_TO_RAD;
}

// Inputs:
// cmAlphaPerRad: 1/rad
// disturbanceAlphaDeg: deg
//
// Output:
// delta_Cm, dimensionless.
export function calculateDeltaCm(
  cmAlphaPerRad,
  disturbanceAlphaDeg
) {
  assertFiniteNumber(
    cmAlphaPerRad,
    "cmAlphaPerRad"
  );

  assertFiniteNumber(
    disturbanceAlphaDeg,
    "disturbanceAlphaDeg"
  );

  const disturbanceAlphaRad =
    degreesToRadians(
      disturbanceAlphaDeg
    );

  const deltaCm =
    cmAlphaPerRad *
    disturbanceAlphaRad;

  // Normalize JavaScript signed zero to ordinary zero.
  return deltaCm === 0 ? 0 : deltaCm;
}

// Classification is based on:
// delta_alpha_rad * delta_Cm
//
// Negative: restoring
// Positive: destabilizing
// Zero: neutral
export function classifyDisturbance(
  disturbanceAlphaDeg,
  deltaCm
) {
  assertFiniteNumber(
    disturbanceAlphaDeg,
    "disturbanceAlphaDeg"
  );

  assertFiniteNumber(
    deltaCm,
    "deltaCm"
  );

  const disturbanceAlphaRad =
    degreesToRadians(
      disturbanceAlphaDeg
    );

  const product =
    disturbanceAlphaRad * deltaCm;

  if (product < 0) {
    return "restoring";
  }

  if (product > 0) {
    return "destabilizing";
  }

  return "neutral";
}

// Trimmed when:
// abs(Cm(alpha)) <= 1e-6
export function isTrimmed(cm) {
  assertFiniteNumber(cm, "cm");
  return Math.abs(cm) <= TRIM_TOLERANCE;
}