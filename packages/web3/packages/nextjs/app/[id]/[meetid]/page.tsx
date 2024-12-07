"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  useRoom,
  useLocalVideo,
  useLocalAudio,
  useLocalScreenShare,
} from '@huddle01/react/hooks';
import { Video } from '@huddle01/react/components';

const VideoCallPage = ({ params }: { params: { meetid: string } }) => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => console.log('Joined the room'),
    onLeave: () => console.log('Left the room'),
  });

  const { stream: videoStream, enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { stream: audioStream, enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();

  useEffect(() => {
    if (token && params.meetid) {
      joinRoom({
        roomId: params.meetid,
        token: token
      });
    }
  }, [token, params.meetid, joinRoom]);

  return (
    <div className="min-h-screen p-4 bg-base-200">
      <div className="max-w-4xl mx-auto">
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