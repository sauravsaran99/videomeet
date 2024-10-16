import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import io from "socket.io-client";

// Connect to the Socket.io server
const socket = io("http://192.168.0.111:5000/");

// Configuration for WebRTC STUN server
const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const VideoCallUI = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const localVideoRef = useRef(null); // Local user video stream reference
  const remoteVideoRefs = useRef([]); // Array to store multiple remote videos
  const peerConnections = useRef({}); // To store multiple peer connections

  const roomId = "1"; // Hardcoded room ID for now

  useEffect(() => {
    // Request user media (camera and microphone)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((localStream) => {
        localVideoRef.current.srcObject = localStream;

        // Join room and notify server
        socket.emit("join-room", roomId, socket.id);

        // BUG:Handle receiving offer from new participant
        socket.on("offer", async (offer, userId) => {
          const peerConnection = createPeerConnection(userId);
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit("answer", answer, roomId, socket.id);
        });

        // Handle receiving answer from participant
        socket.on("answer", async (answer, userId) => {
          const peerConnection = peerConnections.current[userId];
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });

        // Handle ICE candidate exchange
        socket.on("ice-candidate", (candidate, userId) => {
          const peerConnection = peerConnections.current[userId];
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // When a new user connects, create an offer for them
        socket.on("user-connected", (userId) => {
          const peerConnection = createPeerConnection(userId);
          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
          });

          peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
            socket.emit("offer", offer, roomId, socket.id);
          });
        });

        // Handle user disconnected
        socket.on("user-disconnected", (userId) => {
          if (peerConnections.current[userId]) {
            peerConnections.current[userId].close();
            delete peerConnections.current[userId];
          }
        });
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, []);

  // Function to create a new WebRTC peer connection
  const createPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection(configuration);

    // Add the new remote stream to the video element
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      remoteVideoRefs.current[userId].srcObject = remoteStream;
    };

    // Send ICE candidates to the signaling server
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", event.candidate, roomId, socket.id);
      }
    };

    peerConnections.current[userId] = peerConnection;
    return peerConnection;
  };

  // Handle chat message submission
  const sendMessage = () => {
    socket.emit("send-message", { text: newMessage, sender: "You" }, roomId);
    setMessages([...messages, { text: newMessage, sender: "You" }]);
    setNewMessage("");
  };

  useEffect(() => {
    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  return (
    <div className="video-call-container">
      {/* Header */}
      <div className="header">
        <h3 className="title">Meet 5 - Discuss Management Project</h3>
        <div className="class-tag">Business talks</div>
        <div className="record-timer">
          <span className="red-dot"></span> Record 00:25:36
        </div>
        <button className="invite-button">Invite people</button>
      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Video Section */}
        <div className="video-section">
          <div className="main-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="main-video-img"
            />
            <p className="caption">
              Hello guys.. Yesterday we discussed about Management Project and
              the example of ...
            </p>
          </div>
          {/* <div className="participants">
            <div className="participant">
              <video
                ref={(el) => (remoteVideoRefs.current["user1"] = el)}
                autoPlay
              />
              <p>Devi</p>
            </div>
            <div className="participant">
              <video
                ref={(el) => (remoteVideoRefs.current["user2"] = el)}
                autoPlay
              />
              <p>Marcelo</p>
            </div>
            <div className="participant">
              <video
                ref={(el) => (remoteVideoRefs.current["user3"] = el)}
                autoPlay
              />
              <p>Octavia</p>
            </div>
            <div className="participant">
              <video
                ref={(el) => (remoteVideoRefs.current["you"] = el)}
                autoPlay
              />
              <p>You</p>
            </div>
          </div> */}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="poll-section">
            <h4>Class X president election</h4>
            <div className="poll-bar">
              <p>Alberto Sam</p>
              <div
                className="poll-bar-fill"
                style={{
                  width: "55%",
                  height: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                }}
              >
                55%
              </div>
              <p>Julian Smithen</p>
              <div
                className="poll-bar-fill"
                style={{
                  width: "25%",
                  height: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                }}
              >
                25%
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <div className="messages">
              {messages.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </p>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button className="control-button">Volume</button>
        <button className="control-button">Mic</button>
        <button className="control-button">Cam</button>
        <button className="control-button">Display</button>
        <button className="control-button">Screen</button>
        <button className="leave-button">Leave</button>
      </div>
    </div>
  );
};

export default VideoCallUI;
