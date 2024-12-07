import asyncio
import logging
import os

from dotenv import load_dotenv

from ai01.agent import Agent, AgentOptions
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

load_dotenv()


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Chatbot")

print(os.getenv("HUDDLE_API_KEY"))
print(os.getenv("HUDDLE_PROJECT_ID"))
print(os.getenv("OPENAI_API_KEY"))


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
            room_id="yyj-nell-qdr",
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

        # RealTimeModel is the Model which is going to be used by the Agent
        llm = RealTimeModel(
            agent=agent,
            options=RealTimeModelOptions(
                oai_api_key=openai_api_key,
                instructions="You are a interviewer. You will ask the candidate questions based on software engineering requirements.",
            ),
        )

        # Join the dRTC Network, which creates a Room instance for the Agent to Join.
        room = await agent.join()
        @room.on(RoomEvent.RoomJoined)
        def on_room_joined():
            print("Room Joined")
            
        await agent.connect()

    except KeyboardInterrupt:
        print("Exiting...")

    except Exception as e:
        print(e)


if __name__ == "__main__":
    asyncio.run(main())