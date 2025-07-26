import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceModeController = () => {
  const [isVoiceModeOn, setIsVoiceModeOn] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const processCommand = (command) => {
    const cmd = command.toLowerCase();
    console.log("✅ Command recognized:", cmd);

    if (cmd.includes("dashboard")) {
      speak("Opening dashboard");
      navigate(`/admin/dashboard`);

    } else if (cmd.includes("course") || cmd.includes("lesson")) {
      speak("Opening course");
      navigate("/admin/course");
    } else if (cmd.includes("logout")) {
      speak("Logging out");
      navigate("/logout");
    } else {
      speak("Sorry, I didn't understand that command.");
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("❌ SpeechRecognition not supported");
      speak("Sorry, your browser does not support speech recognition.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log("🎙️ Voice recognition started");
        speak("Voice mode activated. Listening for commands.");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        console.log("🎧 Heard:", transcript);
        processCommand(transcript);
      };

      recognition.onerror = (event) => {
        console.error("❌ Recognition error:", event.error);
        speak("Error with voice recognition: " + event.error);
      };

      recognition.onend = () => {
        console.log("🛑 Recognition ended");
        if (isVoiceModeOn) {
          console.log("🔁 Restarting recognition...");
          recognition.start(); // restart if voice mode still on
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error("❌ Failed to start recognition:", error);
      speak("Could not start voice recognition.");
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      speak("Voice mode turned off.");
      console.log("🛑 Voice mode manually turned off");
    }
  };

  const toggleVoiceMode = () => {
    const nextState = !isVoiceModeOn;
    setIsVoiceModeOn(nextState);

    if (nextState) {
      startVoiceRecognition();
    } else {
      stopVoiceRecognition();
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <button
        onClick={toggleVoiceMode}
        style={{
          fontSize: '18px',
          padding: '15px 30px',
          borderRadius: '30px',
          backgroundColor: isVoiceModeOn ? '#e53935' : '#43a047',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        {isVoiceModeOn ? '🔇 Stop Voice Mode' : '🎤 Start Voice Mode'}
      </button>
    </div>
  );
};

export default VoiceModeController;
