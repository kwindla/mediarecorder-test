const MIME_TYPE = 'video/webm;codecs="vp8,opus"';
const AUDIO_BITRATE =   48000;
const VIDEO_BITRATE = 1400000;
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const RECORDER_TIMESLICE = 5000;
const CANVAS_DRAW_FRAMERATE = 20;
const CANVAS_GRAB_FRAMERATE = 30;
const BACKGROUND_COLOR = '#1F2D3D';
const RECORDING_DURATION = 11 * 1000;

window.camStream;
window.canvas = document.getElementById('testCanvas');
window.canvasDrawInterval;
window.mediaRecorder;
window.isRecording;
window.recordingBuff = [];

// ----

async function recordDirectFromCamera() {
  console.log('recording from camera');
  await getCameraStream();
  startRecording(camStream);
  setTimeout(stopRecording, RECORDING_DURATION);
}

async function recordFromCanvas() {
  console.log('recording from canvas');
  await getCameraStream();
  let vidStream = canvas.captureStream(CANVAS_GRAB_FRAMERATE);
  let stream = new MediaStream([
    vidStream.getVideoTracks()[0],
  ]);

  startRecording(stream);
  setTimeout(stopRecording, RECORDING_DURATION);
}

function startRecording(stream) {
  mediaRecorder = new MediaRecorder(
    stream,
    {
      mimeType: MIME_TYPE,
      audioBitsPerSecond: AUDIO_BITRATE,
      videoBitsPerSecond: VIDEO_BITRATE,
    }
  );
  mediaRecorder.ondataavailable = onData;
  mediaRecorder.onerror = onError;

  // it is not actually necessary to start() the MediaRecorder
  // instance to see the issue. draws to the canvas still stall if you
  // comment out the following line ...
  mediaRecorder.start(RECORDER_TIMESLICE);
}

function stopRecording() {
  console.log('stopping recording');
  mediaRecorder.stop();
  camStream.getTracks().forEach((t)=>t.stop());
  clearInterval(canvasDrawInterval);
}

function onData (blobEvent) {
  if (mediaRecorder.state !== 'recording') {
    console.log('saving file');
    recordingBuff.push(blobEvent.data);
    let file = new File(recordingBuff,
                        'testfile.webm',
                        {type: 'video/webm'});
    saveAs(file);
    return;
  }
  recordingBuff.push(blobEvent.data);
}

function onError (e) {
  console.error(e);
}


async function getCameraStream() {
  try {
    // get camera stream
    camStream = await navigator.mediaDevices.getUserMedia(
      {
        audio: true,
        video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT }
      }
    );

    // create offscreen video element that serves as canvas image
    // source
    let video = document.createElement('video');
    // document.body.appendChild(video);
    video.volume = 0;
    video.srcObject = camStream;
    video.oncanplay = ()=>video.play();

    // draw to the canvas at fps of CANVAS_FRAMERATE
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
    let context = canvas.getContext('2d');
    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    canvasDrawInterval = setInterval(() => {
      context.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    }, 1000/CANVAS_DRAW_FRAMERATE);
  } catch (e) {
    console.error(e);
  }
}
