// import React, { useEffect } from 'react';
// import cv from 'opencv.js'; // Adjust the import based on how you include OpenCV

// const OpenCVComponent = () => {
//   useEffect(() => {
//     // Ensure OpenCV is ready before using it
//     cv['onRuntimeInitialized'] = () => {
//       // Your OpenCV code here
//       const src = cv.imread('canvasInput');
//       const dst = new cv.Mat();
//       cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
//       cv.imshow('canvasOutput', dst);
//       src.delete();
//       dst.delete();
//     };
//   }, []);

//   return (
//     <div>
//       <canvas id="canvasInput"></canvas>
//       <canvas id="canvasOutput"></canvas>
//     </div>
//   );
// };

// export default OpenCVComponent;