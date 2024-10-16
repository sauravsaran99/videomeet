import React, { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaVideo,
  FaDesktop,
  FaSignOutAlt,
  FaComments,
} from "react-icons/fa";
import io from "socket.io-client";
import "./App.css";
import VideoCallUI from "./VideoCallUI";

const socket = io("http://192.168.0.111:5000");
const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function App() {
  // const [remoteStream, setRemoteStream] = useState(null);
  // const [localStream, setLocalStream] = useState(null);
  // const [messages, setMessages] = useState([]);
  // const [message, setMessage] = useState("");
  // const localVideoRef = useRef();
  // const remoteVideoRef = useRef();
  // const peerConnection = useRef(null);

  // const roomId = "room1"; // For now, we are hardcoding the room ID.

  // useEffect(() => {
  //   // Get user media for the local video stream
  //   navigator.mediaDevices
  //     .getUserMedia({ video: true, audio: true })
  //     .then((stream) => {
  //       setLocalStream(stream);
  //       localVideoRef.current.srcObject = stream;

  //       peerConnection.current = new RTCPeerConnection(configuration);

  //       stream.getTracks().forEach((track) => {
  //         peerConnection.current.addTrack(track, stream);
  //       });

  //       peerConnection.current.ontrack = (event) => {
  //         const [remoteStream] = event.streams;
  //         setRemoteStream(remoteStream);
  //       };

  //       peerConnection.current.onicecandidate = (event) => {
  //         if (event.candidate) {
  //           socket.emit("ice-candidate", event.candidate);
  //         }
  //       };
  //     });

  //   // Connect to the signaling server and join the room
  //   socket.emit("join-room", roomId, socket.id);

  //   socket.on("user-connected", () => {
  //     createOffer();
  //   });

  //   socket.on("receive-offer", (offer) => {
  //     createAnswer(offer);
  //   });

  //   socket.on("receive-answer", (answer) => {
  //     peerConnection.current.setRemoteDescription(
  //       new RTCSessionDescription(answer)
  //     );
  //   });

  //   socket.on("receive-ice-candidate", (candidate) => {
  //     peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
  //   });

  //   socket.on("receive-message", (msg) => {
  //     setMessages((prevMessages) => [...prevMessages, msg]);
  //   });
  // }, []);

  // const createOffer = async () => {
  //   const offer = await peerConnection.current.createOffer();
  //   await peerConnection.current.setLocalDescription(offer);
  //   socket.emit("offer", offer);
  // };

  // const createAnswer = async (offer) => {
  //   await peerConnection.current.setRemoteDescription(
  //     new RTCSessionDescription(offer)
  //   );
  //   const answer = await peerConnection.current.createAnswer();
  //   await peerConnection.current.setLocalDescription(answer);
  //   socket.emit("answer", answer);
  // };

  // const sendMessage = () => {
  //   socket.emit("send-message", { text: message, sender: socket.id });
  //   setMessages((prevMessages) => [
  //     ...prevMessages,
  //     { text: message, sender: "You" },
  //   ]);
  //   setMessage("");
  // };

  // useEffect(() => {
  //   if (remoteStream) {
  //     remoteVideoRef.current.srcObject = remoteStream;
  //   }
  // }, [remoteStream]);

  return <VideoCallUI />;
}

export default App;
