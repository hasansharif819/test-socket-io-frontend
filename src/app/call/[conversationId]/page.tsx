// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useParams } from "next/navigation";
// import { connectSocket } from "@/lib/socket";
// import VideoCall from "@/components/VideoCall";

// export default function CallPage() {
//   const { conversationId } = useParams();
//   const socketRef = useRef<any>();
//   const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const callId = useRef<string>(crypto.randomUUID());

//   useEffect(() => {
//     const socket = connectSocket();
//     socketRef.current = socket;

//     const pc = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });
//     peerConnectionRef.current = pc;

//     // Step 1: Setup Media
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setLocalStream(stream);
//         stream.getTracks().forEach((track) => pc.addTrack(track, stream));
//       });

//     const remote = new MediaStream();
//     setRemoteStream(remote);

//     pc.ontrack = (event) => {
//       event.streams[0].getTracks().forEach((track) => {
//         remote.addTrack(track);
//       });
//     };

//     // Step 2: ICE candidate
//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("iceCandidate", {
//           conversationId,
//           callId: callId.current,
//           candidate: event.candidate,
//         });
//       }
//     };

//     // Step 3: Listen
//     socket.emit("joinRoom", { conversationId });

//     socket.emit("startCall", {
//       conversationId,
//       callerId: "YOUR_USER_ID_HERE", // Replace dynamically
//       callType: "VIDEO",
//       callId: callId.current,
//     });

//     socket.on("incomingCall", async ({ callerId }) => {
//       console.log("Incoming call from", callerId);
//     });

//     socket.on("receiveOffer", async ({ offer }) => {
//       await pc.setRemoteDescription(new RTCSessionDescription(offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socket.emit("sendAnswer", {
//         conversationId,
//         callId: callId.current,
//         answer,
//       });
//     });

//     socket.on("receiveAnswer", async ({ answer }) => {
//       await pc.setRemoteDescription(new RTCSessionDescription(answer));
//     });

//     socket.on("iceCandidate", ({ candidate }) => {
//       pc.addIceCandidate(new RTCIceCandidate(candidate));
//     });

//     return () => {
//       pc.close();
//       socket.disconnect();
//     };
//   }, [conversationId]);

//   const startOffer = async () => {
//     const offer = await peerConnectionRef.current!.createOffer();
//     await peerConnectionRef.current!.setLocalDescription(offer);

//     socketRef.current.emit("sendOffer", {
//       conversationId,
//       callId: callId.current,
//       offer,
//     });
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4 text-center">Video Call</h1>
//       <VideoCall localStream={localStream} remoteStream={remoteStream} />
//       <div className="text-center mt-6">
//         <button
//           onClick={startOffer}
//           className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//         >
//           Start Call
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { connectSocket } from "@/lib/socket";
import VideoCall from "@/components/VideoCall";

export default function CallPage() {
  const { conversationId } = useParams();
  const socketRef = useRef<any>();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const callId = useRef<string>(crypto.randomUUID());

  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return { stream, isVideo: true };
    } catch (err) {
      console.warn("🎥 Video not available, trying audio only...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        return { stream, isVideo: false };
      } catch (audioErr) {
        console.error("❌ Audio not available:", audioErr);
        throw new Error("No available media devices");
      }
    }
  };

  useEffect(() => {
    const setupCall = async () => {
      const socket = connectSocket();
      socketRef.current = socket;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      try {
        const { stream, isVideo } = await getMediaStream();
        setLocalStream(stream);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (!isVideo)
          setMediaError("📞 Video not available. You're in audio-only mode.");
      } catch (err) {
        setMediaError("❌ No media devices found. Please connect a mic.");
        return;
      }

      const remote = new MediaStream();
      setRemoteStream(remote);

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remote.addTrack(track);
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", {
            conversationId,
            callId: callId.current,
            candidate: event.candidate,
          });
        }
      };

      socket.emit("joinRoom", { conversationId });
      socket.emit("startCall", {
        conversationId,
        callerId: "REPLACE_WITH_REAL_USER_ID",
        callType: "VIDEO", // You can dynamically set AUDIO if needed
        callId: callId.current,
      });

      socket.on("receiveOffer", async ({ offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("sendAnswer", {
          conversationId,
          callId: callId.current,
          answer,
        });
      });

      socket.on("receiveAnswer", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("iceCandidate", ({ candidate }) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
    };

    setupCall();

    return () => {
      peerConnectionRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [conversationId]);

  const startOffer = async () => {
    const offer = await peerConnectionRef.current!.createOffer();
    await peerConnectionRef.current!.setLocalDescription(offer);

    socketRef.current.emit("sendOffer", {
      conversationId,
      callId: callId.current,
      offer,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Call Room</h1>

      {mediaError && (
        <div className="bg-yellow-100 text-yellow-700 p-3 rounded mb-4 text-center">
          {mediaError}
        </div>
      )}

      <VideoCall localStream={localStream} remoteStream={remoteStream} />

      <div className="text-center mt-6">
        <button
          onClick={startOffer}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Start Call
        </button>
      </div>
    </div>
  );
}
