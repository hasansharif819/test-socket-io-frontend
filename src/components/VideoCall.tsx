"use client";
import React, { useEffect, useRef } from "react";

interface Props {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const VideoCall: React.FC<Props> = ({ localStream, remoteStream }) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  return (
    <div className="flex gap-4 justify-center">
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-1/2 rounded"
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-1/2 rounded"
      />
    </div>
  );
};

export default VideoCall;
