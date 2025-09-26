// import { bootstrapCameraKit } from "@snap/camera-kit";
// (async function () {
//   const cameraKit = await bootstrapCameraKit({
//     apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzU3NjAxMDM5LCJzdWIiOiJmNzQ0Zjk2ZC0wMTc2LTRlYzktOWM5MS1lMGM4M2MzOTliOTZ-UFJPRFVDVElPTn4xMzQ4Mzc1Ni1mMDc3LTQwNTUtODU5MC1kNGJkNzgyYTcyMzUifQ.eLCHYnWauzVV_u1F8WEcTI1Yf9RLQx06-uwpLUB5di8'
//   });
//   const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
//   const session = await cameraKit.createSession({ liveRenderTarget});

//   const mediaStream = await navigator.mediaDevices.getUserMedia({
//     video: {
//       facingMode: 'user'
//     }
//   });
//   await session.setSource(mediaStream);
//   await session.play();

//   const lens = await cameraKit.lensRepository.loadLens('bb52d5dc-62bb-4b26-86eb-68680d2497f6' , 'a6df0dea-ddef-4df0-824a-6dc9c41b34f7');
  
//   await session.applyLens(lens);
// })();