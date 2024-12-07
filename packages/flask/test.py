import asyncio
import logging
import os
import base64
from gtts import gTTS
from io import BytesIO
from playsound import playsound
from pyee import AsyncIOEventEmitter

from dotenv import load_dotenv

from ai01.agent import Agent, AgentOptions, AgentsEvents
from ai01.providers.openai import AudioTrack
from ai01.providers.openai.realtime import RealTimeModel, RealTimeModelOptions
from ai01.rtc import (
    HuddleClientOptions,
    ProduceOptions,
    Role,
    RoomEvents,
    RoomEventsData,
    RTCOptions,
)
import threading

load_dotenv()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Chatbot")

print(os.getenv("HUDDLE_API_KEY"))
print(os.getenv("HUDDLE_PROJECT_ID"))
print(os.getenv("OPENAI_API_KEY"))


class EnhancedEventEmitter(AsyncIOEventEmitter):
    def __init__(self, loop=None):
        super(EnhancedEventEmitter, self).__init__(loop=loop)

    async def emit_for_results(self, event, *args, **kwargs):
        results = []
        for f in list(self._events[event].values()):
            try:
                result = await f(*args, **kwargs)
            except Exception as exc:
                self.emit("error", exc)
            else:
                if result:
                    results.append(result)
        return results


async def main():
    try:
        # Huddle01 API Key
        huddle_api_key = os.getenv("HUDDLE_API_KEY")

        # Huddle01 Project ID
        huddle_project_id = os.getenv("HUDDLE_PROJECT_ID")

        # OpenAI API Key
        openai_api_key = os.getenv("OPENAI_API_KEY")

        if not huddle_api_key or not huddle_project_id or not openai_api_key:
            raise ValueError("Required Environment Variables are not set")

        # RTCOptions is the configuration for the RTC
        rtcOptions = RTCOptions(
            api_key=huddle_api_key,
            project_id=huddle_project_id,
            room_id="rfo-elri-zwb",
            role=Role.HOST,
            metadata={"displayName": "Agent"},
            huddle_client_options=HuddleClientOptions(
                autoConsume=True, volatileMessaging=False
            ),
        )

        # Agent is the Peer which is going to connect to the Room 
        agent = Agent(
            options=AgentOptions(rtc_options=rtcOptions, audio_track=AudioTrack() ),
        )

        agent._lock = threading.Lock()

        # Join the dRTC Network, which creates a Room instance for the Agent to Join.
        room = await agent.join()
        @room.on(RoomEvents.RoomJoined)
        def on_room_joined():
            print("Room Joined")

        await agent.connect()

        # Convert text to speech and test it locally first
        text = "Hello, this is a test message"
        tts = gTTS(text=text, lang='en')
        
        # Method 1: Save and play from file
        tts.save("test_audio.mp3")
        playsound("test_audio.mp3")  # This will play the audio!
        
        # Method 2: Using BytesIO (for emission)
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        base64_audio = base64.b64encode(audio_buffer.read()).decode('utf-8')
        
        # Now emit after confirming the audio sounds good
        agent.emit(AgentsEvents.Speaking)
        agent.audio_track.enqueue_audio(base64_audio=base64_audio)

        try:
            await asyncio.Future()
        except KeyboardInterrupt:
            logger.info("Exiting...")

    except KeyboardInterrupt:
        print("Exiting...")

    except Exception as e:
        print(e)


if __name__ == "__main__":
    asyncio.run(main())