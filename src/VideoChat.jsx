import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://192.168.0.123:5000");
const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Using Google's free STUN server
};

function VideoChat() {
  const [remoteStream, setRemoteStream] = useState(null);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);

  useEffect(() => {
    // Get local video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        peerConnection.current = new RTCPeerConnection(configuration);

        // Add local stream to PeerConnection
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.current.ontrack = (event) => {
          const [remoteStream] = event.streams;
          setRemoteStream(remoteStream);
        };

        // Handle ICE candidates
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", "room1", event.candidate);
          }
        };

        socket.on("ice-candidate", (candidate) => {
          peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        });
      });

    socket.emit("join-room", "room1");

    socket.on("user-joined", () => {
      createOffer();
    });

    socket.on("offer", (offer) => {
      createAnswer(offer);
    });

    socket.on("answer", (answer) => {
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });
  }, []);

  const createOffer = async () => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", "room1", offer);
  };

  const createAnswer = async (offer) => {
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    socket.emit("answer", "room1", answer);
  };

  useEffect(() => {
    if (remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div>
      <h2>Video Chat</h2>
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }} />
        <video ref={remoteVideoRef} autoPlay style={{ width: "300px" }} />
      </div>
    </div>
  );
}

export default VideoChat;
