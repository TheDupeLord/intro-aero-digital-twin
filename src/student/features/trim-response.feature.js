import {
  calculateCm,
  calculateDeltaCm,
  calculateTrimAngleDeg,
  calculateTrimAngleRad,
  degreesToRadians,
  classifyDisturbance,
  isTrimmed
} from "../physics/trim-response.js";

const INPUT_KEYS = [
  "cm0",
  "cmAlphaPerRad",
  "angleOfAttackDeg",
  "disturbanceAlphaDeg"
];

const REQUIRED_CAPABILITY = {
  id: "loads.pitch.component-sum",
  version: 1
};

const PROVIDED_CAPABILITY = {
  id: "stability.pitch.cm-alpha",
  version: 1
};

function approximatelyEqual(
  actual,
  expected,
  tolerance
) {
  return Math.abs(actual - expected) <= tolerance;
}

function capabilityAvailable(
  capabilityContext
) {
  const capabilities =
    capabilityContext?.capabilities ?? [];

  return capabilities.some(
    (capability) =>
      capability?.id ===
        REQUIRED_CAPABILITY.id &&
      Number(capability?.version) >=
        REQUIRED_CAPABILITY.version
  );
}

function analyzeInputs(aircraft) {
  const alphaRad =
    degreesToRadians(
      aircraft.angleOfAttackDeg
    );

  const disturbanceAlphaRad =
    degreesToRadians(
      aircraft.disturbanceAlphaDeg
    );

  const cm = calculateCm(
    aircraft.cm0,
    aircraft.cmAlphaPerRad,
    aircraft.angleOfAttackDeg
  );

  const trimAngleRad =
    calculateTrimAngleRad(
      aircraft.cm0,
      aircraft.cmAlphaPerRad
    );

  const trimAngleDeg =
    calculateTrimAngleDeg(
      aircraft.cm0,
      aircraft.cmAlphaPerRad
    );

  const deltaCm =
    calculateDeltaCm(
      aircraft.cmAlphaPerRad,
      aircraft.disturbanceAlphaDeg
    );

  const trimmed =
    isTrimmed(cm);

  const tendency =
    classifyDisturbance(
      aircraft.disturbanceAlphaDeg,
      deltaCm
    );

  return {
    alphaRad,
    disturbanceAlphaRad,
    cm,
    trimAngleRad,
    trimAngleDeg,
    deltaCm,
    trimmed,
    tendency
  };
}

function numericalVerificationCase() {
  const inputs = {
    cm0: 0.04,
    cmAlphaPerRad: -0.8,
    angleOfAttackDeg: 2.86,
    disturbanceAlphaDeg: 2.0
  };

  const actual =
    analyzeInputs(inputs);

  return {
    name: "Numerical case",
    inputs,

    passed:
      approximatelyEqual(
        actual.alphaRad,
        0.04992,
        1e-5
      ) &&
      approximatelyEqual(
        actual.disturbanceAlphaRad,
        0.0349,
        1e-5
      ) &&
      approximatelyEqual(
        actual.cm,
        0.000067,
        1e-6
      ) &&
      approximatelyEqual(
        actual.trimAngleRad,
        0.05,
        1e-6
      ) &&
      approximatelyEqual(
        actual.trimAngleDeg,
        2.864788975654116,
        1e-6
      ) &&
      approximatelyEqual(
        actual.deltaCm,
        -0.02792526803190927,
        1e-6
      ) &&
      actual.trimmed === false &&
      actual.tendency === "restoring",

    actual,

    expected: {
      alphaRad: 0.04992,
      disturbanceAlphaRad: 0.0349,
      cm: 0.000067,
      trimAngleRad: 0.05,
      trimAngleDeg: 2.864788975654116,
      deltaCm: -0.02792526803190927,
      trimmed: false,
      tendency: "restoring"
    }
  };
}

function behavioralVerificationCase() {
  const inputs = {
    cm0: 0.04,
    cmAlphaPerRad: -0.8,
    angleOfAttackDeg: 2.86,
    disturbanceAlphaDeg: -2.0
  };

  const actual =
    analyzeInputs(inputs);

  return {
    name: "Behavioral case",
    inputs,

    passed:
      approximatelyEqual(
        actual.alphaRad,
        0.04992,
        1e-5
      ) &&
      approximatelyEqual(
        actual.disturbanceAlphaRad,
        -0.0349,
        1e-5
      ) &&
      approximatelyEqual(
        actual.cm,
        0.000067,
        1e-6
      ) &&
      approximatelyEqual(
        actual.trimAngleRad,
        0.05,
        1e-6
      ) &&
      approximatelyEqual(
        actual.trimAngleDeg,
        2.864788975654116,
        1e-6
      ) &&
      approximatelyEqual(
        actual.deltaCm,
        0.02792526803190927,
        1e-6
      ) &&
      actual.trimmed === false &&
      actual.tendency === "restoring",

    actual,

    expected: {
      alphaRad: 0.04992,
      disturbanceAlphaRad: -0.0349,
      cm: 0.000067,
      trimAngleRad: 0.05,
      trimAngleDeg: 2.864788975654116,
      deltaCm: 0.02792526803190927,
      trimmed: false,
      tendency: "restoring"
    }
  };
}

function boundaryVerificationCase() {
  const inputs = {
    cm0: 0.04,
    cmAlphaPerRad: 0.0,
    angleOfAttackDeg: 2.86,
    disturbanceAlphaDeg: 2.0
  };

  const actual =
    analyzeInputs(inputs);

  return {
    name: "Boundary / sanity case",
    inputs,

    passed:
      approximatelyEqual(
        actual.alphaRad,
        0.04992,
        1e-5
      ) &&
      approximatelyEqual(
        actual.disturbanceAlphaRad,
        0.0349,
        1e-5
      ) &&
      approximatelyEqual(
        actual.cm,
        0.04,
        1e-12
      ) &&
      actual.trimAngleRad === null &&
      actual.trimAngleDeg === null &&
      approximatelyEqual(
        actual.deltaCm,
        0,
        1e-12
      ) &&
      actual.trimmed === false &&
      actual.tendency === "neutral",

    actual,

    expected: {
      alphaRad: 0.04992,
      disturbanceAlphaRad: 0.0349,
      cm: 0.04,
      trimAngleRad: null,
      trimAngleDeg: null,
      deltaCm: 0,
      trimmed: false,
      tendency: "neutral"
    }
  };
}

function buildPlotPoints(aircraft) {
  const points = [];

  for (
    let angleDeg = -10;
    angleDeg <= 10;
    angleDeg += 1
  ) {
    points.push({
      x: angleDeg,
      y: calculateCm(
        aircraft.cm0,
        aircraft.cmAlphaPerRad,
        angleDeg
      )
    });
  }

  return points;
}

export const feature = {
  contractVersion: 4,
  id: "trim-response",
  title:
    "Live Cm–alpha relationship and trim",

  description:
    "Evaluate the linear Cm–alpha relationship, trim condition, and disturbance tendency.",

  category:
    "Stability · Student feature",

  learningMode: "concept",
  topicId: "stability",

  inputKeys: INPUT_KEYS,

  requiresCapabilities: [
    REQUIRED_CAPABILITY
  ],

  providesCapabilities: [
    PROVIDED_CAPABILITY
  ],

  assumptions: [
    "The Cm–alpha relationship is linear over the investigated range.",
    "The model is quasi-static and represents a small disturbance about the selected condition.",
    "Cm0 and Cm_alpha represent the same aircraft configuration and flight condition.",
    "Positive pitching moment and positive angle of attack are nose-up."
  ],

  validityLimits: [
    "Do not use this linear relationship at stall, at large angle of attack, or where aerodynamic coefficients are strongly nonlinear.",
    "This model does not calculate a time history, damping, control motion, or handling quality.",
    "A restoring tendency is not proof of acceptable safety, controllability, or flightworthiness.",
    "The calculated trim angle is meaningful only when the linear model remains valid at that angle."
  ],

  simulation: {
    display: "analysis-only",
    durationS: 1,
    initialState: {},
    controls: {},
    disturbance: {}
  },

  analyze(
    aircraft,
    capabilityContext
  ) {
    if (
      !capabilityAvailable(
        capabilityContext
      )
    ) {
      return {
        results: [],
        verificationCases: [],

        decision: {
          question:
            "At the selected angle of attack, is the simplified pitching-moment model trimmed, and does a small angle-of-attack disturbance create a restoring moment tendency?",

          interpretation:
            "The required loads.pitch.component-sum capability is not available, so Stage 4 remains locked.",

          status: "caution"
        },

        plots: [],
        scene: null
      };
    }

    const analysis =
      analyzeInputs(aircraft);

    return {
      results: [
        {
          key: "cm",
          label: "Cm(alpha)",
          value: analysis.cm,
          unit: "",
          precision: 6,
          emphasis: true
        },

        {
          key: "trimAngleDeg",
          label: "Trim angle",
          value:
            analysis.trimAngleDeg === null
              ? "not available"
              : analysis.trimAngleDeg,
          unit:
            analysis.trimAngleDeg === null
              ? ""
              : "deg",
          precision: 4
        },

        {
          key: "deltaCm",
          label:
            "Disturbance moment-coefficient change",
          value: analysis.deltaCm,
          unit: "",
          precision: 6
        },

        {
          key: "trimmed",
          label: "Selected condition",
          value: analysis.trimmed
            ? "trimmed"
            : "not trimmed",
          unit: ""
        },

        {
          key: "tendency",
          label: "Disturbance tendency",
          value: analysis.tendency,
          unit: ""
        }
      ],

      verificationCases: [
        numericalVerificationCase(),
        behavioralVerificationCase(),
        boundaryVerificationCase()
      ],

      decision: {
        question:
          "At the selected angle of attack, is the simplified pitching-moment model trimmed, and does a small angle-of-attack disturbance create a restoring moment tendency?",

        interpretation:
          analysis.trimmed
            ? `The selected condition is trimmed under the specified tolerance, and the disturbance produces a ${analysis.tendency} tendency under the specified sign-product rule.`
            : `The selected condition is not trimmed under the specified tolerance, and the disturbance produces a ${analysis.tendency} tendency under the specified sign-product rule.`,

        status:
          analysis.trimmed
            ? "pass"
            : "caution"
      },

      plots: [
        {
          id: "cm-alpha",
          title:
            "Cm–alpha relationship",

          xAxis: {
            label: "Angle of attack",
            unit: "deg"
          },

          yAxis: {
            label:
              "Pitching-moment coefficient",
            unit: ""
          },

          series: [
            {
              id: "cm-alpha-values",
              label: "Cm(alpha)",
              points:
                buildPlotPoints(aircraft)
            }
          ],

          regions: [],

          referenceLines: [
            {
              id: "trim-line",
              label: "Cm = 0",
              y: 0
            }
          ]
        }
      ],

      scene: null
    };
  }
};

export const model = {
  kind: "derived",

  evaluate(runtimeContext) {
    const aircraft =
      runtimeContext?.aircraft;

    if (!aircraft) {
      return {
        values: {}
      };
    }

    const analysis =
      analyzeInputs(aircraft);

    return {
      values: {
        cm: analysis.cm,
        trimAngleRad:
          analysis.trimAngleRad,
        trimAngleDeg:
          analysis.trimAngleDeg,
        deltaCm:
          analysis.deltaCm,
        trimmed:
          analysis.trimmed,
        tendency:
          analysis.tendency
      }
    };
  }
};