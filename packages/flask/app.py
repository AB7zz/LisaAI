import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
import asyncio
import os
from ai01.agent import Agent, AgentOptions, AgentsEvents
from ai01.providers.openai import AudioTrack
from ai01.rtc import RTCOptions, Role, RoomEvents, HuddleClientOptions

app = Flask(__name__)
CORS(app)

@app.route('/ai-join', methods=['POST'])
async def ai_join():
    try:
        # Get room_id from POST request
        data = request.get_json()
        room_id = data.get('room_id')

        print(room_id)
        
        if not room_id:
            return jsonify({"status": "error", "message": "room_id is required"}), 400

        # Configure RTC options with environment variables
        rtc_options = RTCOptions(
            api_key=os.environ.get('HUDDLE_API_KEY'),
            project_id=os.environ.get('HUDDLE_PROJECT_ID'),
            room_id=room_id,
            role=Role.HOST,
            huddle_client_options=HuddleClientOptions(
                autoConsume=True, volatileMessaging=False
            )
            metadata={"displayName": "AI Agent"}
        )

        # Initialize Agent
        agent = Agent(
            options=AgentOptions(
                rtc_options=rtc_options,
                audio_track=AudioTrack()
            )
        )

        llm = RealTimeModel(
            agent=agent,
            options=RealTimeModelOptions(
                oai_api_key=os.environ.get('OPENAI_API_KEY'),
                instructions=bot_prompt,
            ),
        )
        
        room = await agent.join()

        # Room Events
        @room.on(RoomEvents.RoomJoined)
        def on_room_joined():
            logger.info("Room Joined")

        @room.on(RoomEvents.NewPeerJoined)
        def on_new_remote_peer(data: RoomEventsData.NewPeerJoined):
            logger.info(f"New Remote Peer: {data['remote_peer']}")

        @room.on(RoomEvents.RemotePeerLeft)
        def on_peer_left(data: RoomEventsData.RemotePeerLeft):
            logger.info(f"Peer Left: {data['remote_peer_id']}")

        @room.on(RoomEvents.RoomClosed)
        def on_room_closed(data: RoomEventsData.RoomClosed):
            logger.info("Room Closed")

        @room.on(RoomEvents.RemoteProducerAdded)
        def on_remote_producer_added(data: RoomEventsData.RemoteProducerAdded):
            logger.info(f"Remote Producer Added: {data['producer_id']}")

        @room.on(RoomEvents.RemoteProducerClosed)
        def on_remote_producer_closed(data: RoomEventsData.RemoteProducerClosed):
            logger.info(f"Remote Producer Closed: {data['producer_id']}")

        @room.on(RoomEvents.NewConsumerAdded)
        def on_remote_consumer_added(data: RoomEventsData.NewConsumerAdded):
            logger.info(f"Remote Consumer Added: {data}")

            if data['kind'] == 'audio':
                track = data['consumer'].track

                if track is None:
                    logger.error("Consumer Track is None, This should never happen.")
                    return

                llm.conversation.add_track(data['consumer_id'], track)
        
        # # Agent Events
        @agent.on(AgentsEvents.Connected)
        def on_agent_connected():
            logger.info("Agent Connected")

        @agent.on(AgentsEvents.Disconnected)
        def on_agent_disconnected():
            logger.info("Agent Disconnected")

        @agent.on(AgentsEvents.Speaking)
        def on_agent_speaking():
            logger.info("Agent Speaking")

        @agent.on(AgentsEvents.Listening)
        def on_agent_listening():
            logger.info("Agent Listening")

        @agent.on(AgentsEvents.Thinking)
        def on_agent_thinking():
            logger.info("Agent Thinking")


        await llm.connect()
            
        await agent.connect()

        if agent.audio_track is not None:
            await agent.rtc.produce(
                options=ProduceOptions(
                    label="audio",
                    track=agent.audio_track,
                )
            )

        try:
            await asyncio.Future()
        except KeyboardInterrupt:
            logger.info("Exiting...")
    except KeyboardInterrupt:
        print("Exiting...")

    except Exception as e:
        print(e)

if __name__ == '__main__':
    app.run(debug=True)