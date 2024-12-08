import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
import asyncio
import os
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
from openai import OpenAI
from dotenv import load_dotenv
import requests
import threading
import logging
import tempfile

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AIAgent")

app = Flask(__name__)
CORS(app)

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
HUDDLE_API_KEY = os.environ.get("HUDDLE_API_KEY")
HUDDLE_PROJECT_ID = os.environ.get("HUDDLE_PROJECT_ID")

API_BASE_URL = "http://localhost:8000"

print(OPENAI_API_KEY)
print(HUDDLE_API_KEY)
print(HUDDLE_PROJECT_ID)

openai_client = OpenAI(
    api_key=OPENAI_API_KEY,
)

active_agents = {}  # Dictionary to track active agents by room_id

async def setup_ai_agent(room_id, bucket_id):
    # Configure RTC options with environment variables
    rtc_options = RTCOptions(
        api_key=os.environ.get('HUDDLE_API_KEY'),
        project_id=os.environ.get('HUDDLE_PROJECT_ID'),
        room_id=room_id,
        role=Role.HOST,
        metadata={"displayName": "AI Agent"},
        huddle_client_options=HuddleClientOptions(
            autoConsume=True, volatileMessaging=False
        ),
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
            instructions="You are a interviewer. You will ask the candidate questions based on software engineering requirements.",
        ),
    )
    
    room = await agent.join()

    # Room Events
    # @room.on(RoomEvents.RoomJoined)
    # def on_room_joined():
    #     logger.info("Room Joined")

    # @room.on(RoomEvents.NewPeerJoined)
    # def on_new_remote_peer(data: RoomEventsData.NewPeerJoined):
    #     logger.info(f"New Remote Peer: {data['remote_peer']}")

    # @room.on(RoomEvents.RemotePeerLeft)
    # def on_peer_left(data: RoomEventsData.RemotePeerLeft):
    #     logger.info(f"Peer Left: {data['remote_peer_id']}")

    # @room.on(RoomEvents.RoomClosed)
    # def on_room_closed(data: RoomEventsData.RoomClosed):
    #     logger.info("Room Closed")

    # @room.on(RoomEvents.RemoteProducerAdded)
    # def on_remote_producer_added(data: RoomEventsData.RemoteProducerAdded):
    #     logger.info(f"Remote Producer Added: {data['producer_id']}")

    # @room.on(RoomEvents.RemoteProducerClosed)
    # def on_remote_producer_closed(data: RoomEventsData.RemoteProducerClosed):
    #     logger.info(f"Remote Producer Closed: {data['producer_id']}")

    # @room.on(RoomEvents.NewConsumerAdded)
    # def on_remote_consumer_added(data: RoomEventsData.NewConsumerAdded):
    #     logger.info(f"Remote Consumer Added: {data}")

    #     if data['kind'] == 'audio':
    #         track = data['consumer'].track

    #         if track is None:
    #             logger.error("Consumer Track is None, This should never happen.")
    #             return

    #         llm.conversation.add_track(data['consumer_id'], track)
    
    # # Agent Events
    # @agent.on(AgentsEvents.Connected)
    # def on_agent_connected():
    #     logger.info("Agent Connected")

    # @agent.on(AgentsEvents.Disconnected)
    # def on_agent_disconnected():
    #     logger.info("Agent Disconnected")

    # @agent.on(AgentsEvents.Speaking)
    # def on_agent_speaking():
    #     logger.info("Agent Speaking")

    # @agent.on(AgentsEvents.Listening)
    # def on_agent_listening():
    #     logger.info("Agent Listening")

    # @agent.on(AgentsEvents.Thinking)
    # def on_agent_thinking():
    #     logger.info("Agent Thinking")


    await llm.connect()
        
    await agent.connect()

    if agent.audio_track is not None:
        await agent.rtc.produce(
            options=ProduceOptions(
                label="audio",
                track=agent.audio_track,
            )
        )

def run_in_new_loop(room_id, bucket_id):
    """Run the agent setup in a new event loop in a separate thread"""
    async def _run():
        try:
            await setup_ai_agent(room_id, bucket_id)
            # Keep the agent running
            await asyncio.Future()  # This will run indefinitely
        except Exception as e:
            logger.error(f"Agent error: {e}")

    # Create new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_run())

@app.route('/ai-join', methods=['POST'])
def ai_join():
    try:
        data = request.get_json()
        room_id = data.get('room_id')
        bucket_id = data.get('bucket_id')

        if not room_id:
            return jsonify({"status": "error", "message": "room_id is required"}), 400

        # Check if an agent is already active in this room
        if room_id in active_agents and active_agents[room_id].is_alive():
            return jsonify({
                "status": "error",
                "message": "AI agent already exists in this room"
            }), 400

        # Start the agent in a new thread
        thread = threading.Thread(target=run_in_new_loop, args=(room_id, bucket_id))
        thread.daemon = True
        thread.start()
        
        # Store the thread reference
        active_agents[room_id] = thread

        return jsonify({
            "status": "success",
            "message": "AI agent setup initiated",
            "room_id": room_id
        })

    except Exception as e:
        logger.error(f"Error in ai_join: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

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
        response = openai_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a technical interviewer. Always respond with properly formatted JSON."},
                {"role": "user", "content": prompt}
            ],
            model="gpt-4o",
            response_format={"type": "json_object"},
        )

        # print(response)

        # Parse the JSON response directly
        questions = response.choices[0].message.content
        return questions  # Flask will automatically jsonify the parsed JSON

    except Exception as e:
        print(f"Error generating questions: {str(e)}")
        return jsonify({
            "error": "Failed to generate questions",
            "details": str(e)
        }), 500

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({
                "error": "No audio file provided"
            }), 400

        audio_file = request.files['audio']

        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            
            # Open the saved audio file and transcribe it using OpenAI's Whisper
            with open(temp_audio.name, 'rb') as audio:
                transcript = openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio,
                )

        # Clean up the temporary file
        os.unlink(temp_audio.name)

        return jsonify({
            "text": transcript.text
        })

    except Exception as e:
        logger.error(f"Error in transcribe: {e}")
        return jsonify({
            "error": "Failed to transcribe audio",
            "details": str(e)
        }), 500

@app.route('/score', methods=['POST'])
def score_interview():
    try:
        data = request.get_json()
        responses = data.get('responses')

        if not responses:
            return jsonify({
                "error": "No responses provided"
            }), 400

        # Create a prompt for GPT-4 to analyze the responses
        prompt = """
        Analyze these interview responses and provide a single overall score from 0-100. 
        Consider the candidate's entire performance across all responses, evaluating:
        - Technical accuracy and knowledge
        - Communication skills and clarity
        - Problem-solving approach
        - Depth of understanding
        
        Return only a single integer score between 0-100.
        
        Responses to analyze:
        """
        
        for qa in responses:
            prompt += f"\nQ: {qa['question']}\nA: {qa['answer']}\n"

        # Get evaluation from GPT-4
        response = openai_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer. Evaluate the entire interview and return only a single number 0-100."},
                {"role": "user", "content": prompt}
            ],
            model="gpt-4",
            temperature=0.7,
        )

        # Extract the score from the response
        try:
            score = int(response.choices[0].message.content.strip())
            # Ensure score is within bounds
            score = max(0, min(100, score))
        except ValueError:
            score = 50  # Default score if parsing fails

        return jsonify({
            "score": score
        })

    except Exception as e:
        logger.error(f"Error in score_interview: {e}")
        return jsonify({
            "error": "Failed to score interview",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)