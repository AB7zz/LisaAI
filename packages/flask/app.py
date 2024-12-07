from flask import Flask, jsonify
from flask_cors import CORS
import asyncio
from ai01.agent import Agent, AgentOptions
from ai01.providers.openai import AudioTrack
from ai01.rtc import RTCOptions, Role, RoomEvents

app = Flask(__name__)
CORS(app)

# Configure RTC options
rtc_options = RTCOptions(
    api_key="your_huddle_api_key",
    project_id="your_project_id",
    room_id="your_room_id",
    role=Role.HOST,
    metadata={"displayName": "AI Agent"}
)

# Initialize Agent
agent = Agent(
    options=AgentOptions(
        rtc_options=rtc_options,
        audio_track=AudioTrack()
    )
)

@app.route('/ai-join', methods=['POST'])
async def ai_join():
    try:
        room = await agent.join()
        
        @room.on(RoomEvents.RoomJoined)
        def on_room_joined():
            print("Room Joined")
            
        await agent.connect()
        return jsonify({"status": "success", "message": "AI agent joined successfully"})
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)