import { useEffect } from 'react'

const useWebcam = (videoRef, onLoaded) => {
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: 'user'
          },
        })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            onLoaded();
          }
          videoRef.current.play();
        })
    }
  }, [onLoaded, videoRef]);
}


export default useWebcam;