import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
import asyncio
import os
from ai01.agent import Agent, AgentOptions, AgentsEvents
from ai01.providers.openai import AudioTrack
from ai01.rtc import RTCOptions, Role, RoomEvents, HuddleClientOptions
import openai

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
openai.api_key = os.environ.get('OPENAI_API_KEY')

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

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    try:
        data = request.get_json()
        role = data.get('role')
        requirements = data.get('requirements')

        if not role or not requirements:
            return jsonify({
                "error": "Missing required fields: role and requirements"
            }), 400

        # Construct the prompt for OpenAI
        prompt = f"""
        Generate 5 technical interview questions for a {role} position.
        The candidate should meet these requirements:
        {requirements}

        Generate questions that:
        1. Are specific to the role and requirements
        2. Test both theoretical knowledge and practical experience
        3. Allow candidates to demonstrate problem-solving abilities
        4. Are open-ended but focused
        
        Return the response as a JSON array where each object has an 'id' (number) and 'question' (string) field.
        Example format:
        [
            {{"id": 1, "question": "Your question here"}},
            {{"id": 2, "question": "Another question here"}}
        ]
        """

        # Make API call to OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a technical interviewer. Always respond with properly formatted JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" },  # Ensure JSON response
            temperature=0.7,
            max_tokens=1000
        )

        # Parse the JSON response directly
        questions = response.choices[0].message.content
        return questions  # Flask will automatically jsonify the parsed JSON

    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        return jsonify({
            "error": "Failed to generate questions",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)