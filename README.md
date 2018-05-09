# os x chrome 66 canvas / mediarecorder test

Reduced test case showing/testing Chrome 66 on OS X canvas.context.drawImage stall issue when
a stream returned by canvas.captureStream is feeding a MediaRecorder

High-level description

1. create a canvas
2. begin drawing to the canvas every 1/CANVAS_DRAW_FRAMERATE milliseconds
3. use `canvas.captureStream(CANVAS_GRAB_FRAMERATE)` to get a stream
4. pass the stream to `new MediaRecorder()`

On OS X, if CANVAS_DRAW_FRAMERATE is less than approximately triple CANVAS_GRAB_FRAMERATE, timing of the draws to the canvas
are noticeably jittery. In other words, some of the draw calls appear to fail to actually happen. The problem is worse, the
lower the draw framerate.

Note that it is not actually necessary to call `mediaRecorderInstance.start()`. This sample code *does* call `start()` so
that it is possible to examine the output of the MediaRecorder, in addition to visually examining the canvas on the
web page. In every instance we have looked at, the output of MediaRecorder appears to match what we think we saw
while watching the canvas live.

This bug appears to be worst on OS X, but also appears to be present on Windows. This test case does not show the bug on
Windows -- but in our production application we see jittery frame rates on Windows in Chrome 66 that we did not see
in Chrome 65. This bug does not manifest on any of our Linux machines.

Our current workaround for our production application is to set CANVAS_DRAW_FRAMERATE to 75 and CANVAS_GRAB_FRAMERATE to 25.
In other words, we are rendering to the canvas at 75 fps and recording at 25 fps. Previously, we were rendering at 40 fps
and recording at 30 fps.

## Live test page

https://kwindla.github.io/mediarecorder-test/

1. Click on [ record from canvas ] to see the bug
2. Click on [ record directly from camera ] to see a smooth framerate both on canvas and in video file

On the live test page, CANVAS_GRAB_FRAMERATE is 30 and CANVAS_DRAW_FRAMERATE is 20.
