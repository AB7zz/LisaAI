"use client";

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useRoom,
  useLocalVideo,
  useLocalAudio,
  useLocalScreenShare,
  usePeerIds,
  useRemoteVideo,
  useRemoteAudio,
} from '@huddle01/react/hooks';
import { Video, Audio } from '@huddle01/react/components';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const RemotePeer = ({ peerId }: { peerId: string }) => {
  const { stream: videoStream } = useRemoteVideo({ peerId });
  const { stream: audioStream } = useRemoteAudio({ peerId });

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log('Remote Peer:', peerId);
  }, [peerId]);

  useEffect(() => {
    if (audioRef.current && audioStream) {
      console.log('Setting audio stream');
      console.log(audioStream);
      audioRef.current.srcObject = audioStream;
    }
  }, [audioStream]);

  return (
    <div className="relative bg-base-100 rounded-xl p-4 shadow-lg">
      <div className="aspect-video bg-base-300 rounded-lg overflow-hidden">
        {videoStream ? (
          <Video
            stream={videoStream}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content">
            Peer Camera Off
          </div>
        )}
      </div>
      {audioStream && 
      <>
        <p>Audio Stream</p>
        <audio ref={audioRef} autoPlay />
      </>}
    </div>
  );
};

const VideoCallPage = ({ params }: { params: { meetid: string; id: string } }) => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [questions, setQuestions] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [responses, setResponses] = useState<Array<{question: string, answer: string}>>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => console.log('Joined the room'),
    onLeave: () => console.log('Left the room'),
  });

  const { stream: videoStream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { track: audioTrack, stream: audioStream, enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();
  const { peerIds } = usePeerIds();

  // Inside VideoCallPage component, add these states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Replace startRecording with this simpler version
  const startRecording = () => {
    resetTranscript();
    SpeechRecognition.startListening();
    
    // Stop after 10 seconds and save the response
    setTimeout(() => {
      SpeechRecognition.stopListening();
      setResponses(prev => [...prev, {
        question: questions[currentQuestionIndex].question,
        answer: transcript
      }]);
      
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAsking(false);
    }, 10000);
  };

  // Modify the question asking effect
  useEffect(() => {
    if (!questions || isAsking || !window.speechSynthesis || !browserSupportsSpeechRecognition) return;

    const askQuestion = async () => {
      if (currentQuestionIndex >= questions.length) {
        console.log('All questions have been asked');
        return;
      }

      setIsAsking(true);
      setIsSpeaking(true);
      
      const utterance = new window.SpeechSynthesisUtterance();
      utterance.text = questions[currentQuestionIndex].question;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => {
        setIsSpeaking(false);
        startRecording();
      };

      window.speechSynthesis.speak(utterance);
    };

    askQuestion();
  }, [questions, currentQuestionIndex, isAsking, browserSupportsSpeechRecognition]);

  // Add these control functions
  const restartInterview = () => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    setCurrentQuestionIndex(0);
    setIsAsking(false);
    setIsSpeaking(false);
  };

  const skipQuestion = () => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length));
    setIsAsking(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    console.log('Peers updated:', peerIds);
  }, [peerIds]);

  useEffect(() => {
    if (token && params.meetid) {
      // const hasJoined = sessionStorage.getItem(`room-${params.meetid}`);
      // if (hasJoined) return;
      console.log('Downloading questions');
      // Call the download API
      fetch(`/api/download/${params.id}`)
        .then(response => response.json())
        .then(data => {
          console.log('Downloaded questions:', data);
          setQuestions(data);

        })
        .catch(error => console.error('Error downloading questions:', error));

      joinRoom({
        roomId: params.meetid,
        token: token
      });

      fetch('http://localhost:5000/ai-join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: params.meetid,
          bucket_id: params.id
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('AI agent status:', data);
        sessionStorage.setItem(`room-${params.meetid}`, 'true');
      })
      .catch(error => console.error('Error adding AI agent:', error));
    }
  }, [token, params.meetid, params.id, joinRoom, peerIds]);

  // Add this to show current status in the UI
  const renderInterviewStatus = () => (
    <div className="mt-4 p-4 bg-base-100 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Interview Status:</h3>
      <p>Speaking: {isSpeaking ? 'Yes' : 'No'}</p>
      <p>Listening: {listening ? 'Yes' : 'No'}</p>
      {listening && (
        <p>Current Response: {transcript}</p>
      )}
      <p>Question {currentQuestionIndex + 1} of {questions?.length}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-base-200">
      <div className="max-w-4xl mx-auto">
        {renderInterviewStatus()}
        {/* AI Response Display */}
        {aiResponse && (
          <div className="mt-4 p-4 bg-base-100 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2">AI Response:</h3>
            <p className="whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
        {/* Local Video Display */}
        <div className="relative bg-base-100 rounded-xl p-4 shadow-lg">
          <div className="aspect-video bg-base-300 rounded-lg overflow-hidden">
            {videoStream ? (
              <Video
                stream={videoStream}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content">
                Camera Off
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={() => isVideoOn ? disableVideo() : enableVideo()}
              className={`btn btn-circle ${isVideoOn ? 'btn-primary' : 'btn-ghost'}`}
            >
              {isVideoOn ? '🎥' : '📵'}
            </button>
            <button
              onClick={() => isAudioOn ? disableAudio() : enableAudio()}
              className={`btn btn-circle ${isAudioOn ? 'btn-primary' : 'btn-ghost'}`}
            >
              {isAudioOn ? '🎤' : '🔇'}
            </button>
            <button
              onClick={() => shareStream ? stopScreenShare() : startScreenShare()}
              className={`btn btn-circle ${shareStream ? 'btn-primary' : 'btn-ghost'}`}
            >
              💻
            </button>
          </div>
        </div>

        {/* Remote Peers Display */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {peerIds && peerIds.map((peerId) => (
            <RemotePeer key={peerId} peerId={peerId} />
          ))}
        </div>

        {/* Leave Button */}
        <div className="mt-4 text-center">
          <button
            onClick={leaveRoom}
            className="btn btn-error btn-wide"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;