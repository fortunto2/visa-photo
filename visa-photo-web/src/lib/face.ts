/**
 * Where the face sits in a photo, in the terms a document specification uses.
 *
 * Deliberately a narrow interface over the detector. MediaPipe is what runs today, but it costs
 * ~15 MB; if a lighter ONNX landmark model turns up it can be swapped underneath without the
 * crop or the checker noticing.
 *
 * The hard part is the crown. ICAO measures chin to "top of head, not hair", and landmarks
 * cannot see a skull under a hairstyle. Two estimates are produced instead of one:
 *
 *   skullTop  — extrapolated from the face, the number a document actually wants
 *   hairTop   — the top of the silhouette, which is what a person sees in the mirror
 *
 * For a bald head they coincide. For thick hair they diverge, and that gap is worth showing
 * rather than hiding: a photo can be rejected for either, depending on who is measuring.
 */

export interface FacePlacement {
  /** normalised 0–1 within the source image */
  chinY: number;
  skullTopY: number;
  eyeY: number;
  faceCenterX: number;
  /** how far apart the two crown estimates are, in fractions of image height */
  hairAllowance: number;
  /** roll in degrees, positive is head tilted clockwise */
  tiltDeg: number;
}

let landmarker: unknown = null;

/** MediaPipe landmark indices used here. 152 is the chin, 10 the top of the forehead. */
const CHIN = 152;
const FOREHEAD = 10;
const LEFT_EYE = 33;
const RIGHT_EYE = 263;

/**
 * The face occupies roughly the lower 87 % of the skull: the forehead landmark sits at the
 * hairline, not at the crown. This constant lifts it the rest of the way, which is the same
 * correction the open-source `ppp` tool applies for exactly this reason.
 */
const FOREHEAD_TO_CROWN = 0.13;

async function loadLandmarker() {
  if (landmarker) return landmarker;

  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks("/mediapipe");

  landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: "/models/face_landmarker.task", delegate: "CPU" },
    runningMode: "IMAGE",
    numFaces: 1,
    outputFaceBlendshapes: false,
  });
  return landmarker;
}

/** True once the model is in the HTTP cache, so the UI can act without a wait. */
export async function isFaceModelCached(): Promise<boolean> {
  if (landmarker) return true;
  if (typeof caches === "undefined") return false;
  try {
    const hit = await caches.match("/models/face_landmarker.task");
    return Boolean(hit);
  } catch {
    return false;
  }
}

/**
 * Detection runs on a downscaled copy.
 *
 * A phone photo is 3024x4032, and the detector returned nothing at that size while finding the
 * same face immediately at 1024. Landmarks come back normalised, so scaling down costs no
 * precision in the numbers that matter here.
 */
const DETECT_MAX = 1024;

function fitForDetection(img: HTMLImageElement): HTMLCanvasElement {
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  const ratio = longest > DETECT_MAX ? DETECT_MAX / longest : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * ratio);
  canvas.height = Math.round(img.naturalHeight * ratio);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function findFace(img: HTMLImageElement): Promise<FacePlacement | null> {
  const detector = (await loadLandmarker()) as {
    detect: (i: HTMLCanvasElement) => { faceLandmarks: { x: number; y: number }[][] };
  };

  const result = detector.detect(fitForDetection(img));
  const points = result.faceLandmarks?.[0];
  if (!points) return null;

  const chin = points[CHIN];
  const forehead = points[FOREHEAD];
  const left = points[LEFT_EYE];
  const right = points[RIGHT_EYE];
  if (!chin || !forehead || !left || !right) return null;

  const faceHeight = chin.y - forehead.y;
  const skullTopY = Math.max(0, forehead.y - faceHeight * FOREHEAD_TO_CROWN);
  const eyeY = (left.y + right.y) / 2;

  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const tiltDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    chinY: chin.y,
    skullTopY,
    eyeY,
    faceCenterX: (left.x + right.x) / 2,
    hairAllowance: 0,
    tiltDeg,
  };
}

/**
 * Top of the visible silhouette — hair included — from the alpha of a cut-out.
 * Only meaningful once the background has been removed.
 */
export function silhouetteTop(mask: ImageData): number | null {
  const { width, height, data } = mask;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 128) return y / height;
    }
  }
  return null;
}
