import { bootstrapCameraKit, createMediaStreamSource, Transform2D } from '@snap/camera-kit';
import type { CameraKitSession, Lens } from '@snap/camera-kit';

let mediaStream: MediaStream;

async function init() {
  const liveRenderTarget = document.getElementById(
    'canvas'
  ) as HTMLCanvasElement;
  const cameraKit = await bootstrapCameraKit({ apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU3NjAxMDM5LCJzdWIiOiJmNzQ0Zjk2ZC0wMTc2LTRlYzktOWM5MS1lMGM4M2MzOTliOTZ-UFJPRFVDVElPTn4xMzQ4Mzc1Ni1mMDc3LTQwNTUtODU5MC1kNGJkNzgyYTcyMzUifQ.eLCHYnWauzVV_u1F8WEcTI1Yf9RLQx06-uwpLUB5di8' });
  const session = await cameraKit.createSession({ liveRenderTarget });

  let lenses: Lens[] = [];
  try {
    const loaded = await cameraKit.lensRepository.loadLensGroups([
      'cade53de-3148-40c4-ac0b-bf835e27542b',
    ]);
    lenses = loaded.lenses || [];
  } catch (err) {
    console.error('Failed to load lens group', err);
  }

  const desiredLensIds = [
    '18a366c7-dda6-4116-99a8-d6b9d0521665',
    'fe209741-6b58-4fea-9e8e-58856048b8b7',
    '2de0a413-29ec-45c5-b9d6-315041272319',
  ];

  const selectedLenses = lenses.filter((lens) => desiredLensIds.includes(lens.id));

  let appliedLensId: string | undefined;
  if (selectedLenses.length > 0) {
    await session.applyLens(selectedLenses[0]);
    appliedLensId = selectedLenses[0].id;
  } else if (lenses.length > 0) {
    await session.applyLens(lenses[0]);
    appliedLensId = lenses[0].id;
  }

  await setCameraKitSource(session);

  attachCamerasToSelect(session);
  const listForUi = selectedLenses.length > 0 ? selectedLenses : lenses;
  attachLensesToSelect(listForUi, session);
  attachLensCarousel(listForUi, session, appliedLensId);
}

async function setCameraKitSource(
  session: CameraKitSession,
  deviceId?: string
) {
  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId },
  });

  const source = createMediaStreamSource(mediaStream);

  await session.setSource(source);

  source.setTransform(Transform2D.MirrorX);

  session.play();
}

async function attachCamerasToSelect(session: CameraKitSession) {
  const cameraSelect = document.getElementById('cameras') as HTMLSelectElement;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(({ kind }) => kind === 'videoinput');

  cameras.forEach((camera) => {
    const option = document.createElement('option');

    option.value = camera.deviceId;
    option.text = camera.label;

    cameraSelect.appendChild(option);
  });

  cameraSelect.addEventListener('change', (event) => {
    const deviceId = (event.target as HTMLSelectElement).selectedOptions[0]
      .value;

    setCameraKitSource(session, deviceId);
  });
}

async function attachLensesToSelect(lenses: Lens[], session: CameraKitSession) {
  const lensSelect = document.getElementById('lenses') as HTMLSelectElement;

  lenses.forEach((lens) => {
    const option = document.createElement('option');

    option.value = lens.id;
    option.text = lens.name;

    lensSelect.appendChild(option);
  });

  lensSelect.addEventListener('change', (event) => {
    const lensId = (event.target as HTMLSelectElement).selectedOptions[0].value;
    const lens = lenses.find((lens) => lens.id === lensId);

    if (lens) session.applyLens(lens);
  });
}

function resolveLensThumbnail(lens: Lens): string | undefined {
  // Try several commonly used fields for thumbnails/icons. Fallback to undefined.
  const anyLens = lens as unknown as Record<string, any>;
  return (
    anyLens.iconUrl ||
    anyLens.thumbnailUrl ||
    anyLens.previewThumbnailUrl ||
    anyLens.previewImageUrl ||
    (anyLens.icon && anyLens.icon.uri) ||
    (anyLens.preview && (anyLens.preview.thumbnailUrl || anyLens.preview.imageUrl))
  );
}

function attachLensCarousel(
  lenses: Lens[],
  session: CameraKitSession,
  activeLensId?: string
) {
  const container = document.getElementById('lens-carousel') as HTMLDivElement | null;
  if (!container) return;

  container.innerHTML = '';

  if (!lenses || lenses.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'lens-chip';
    empty.textContent = 'No lenses available';
    container.appendChild(empty);
    return;
  }

  const chips: HTMLDivElement[] = [];

  lenses.forEach((lens) => {
    const chip = document.createElement('div');
    chip.className = 'lens-chip';

    const thumbUrl = resolveLensThumbnail(lens);
    if (thumbUrl) {
      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = lens.name || 'Lens';
      chip.appendChild(img);
    }

    const label = document.createElement('span');
    label.textContent = lens.name || 'Lens';
    chip.appendChild(label);

    if (activeLensId && lens.id === activeLensId) {
      chip.classList.add('active');
    }

    chip.addEventListener('click', async () => {
      await session.applyLens(lens);
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });

    chips.push(chip);
    container.appendChild(chip);
  });
}

init();