#! /usr/bin/env python3.6

from typing import Optional, TypedDict
import time
from flask import Flask, request
from flask_socketio import (
    SocketIO,
    emit,
    join_room as socket_join_room,
    leave_room as socket_leave_room,
)
from flask_cors import CORS
from core.lobby import GameLobby
from core.base_player import BasePlayer

app = Flask(__name__, static_folder="dist", static_url_path="", template_folder="dist")

# TODO(Change this to only allow certain origins depending on development/production)
accepted_origins = "*"
CORS(app, resources={r"/*": {"origins": accepted_origins}})
socketio = SocketIO(app, cors_allowed_origins=accepted_origins)


lobby = GameLobby("FourPlayerThreeInARow", 4)


@socketio.on("connect")
def connect():
    pass


@socketio.on("disconnect")
def disconnect():
    print("User disconnected: ", request.sid)
    lobby.leave_lobby(request.sid)


@socketio.on("join_lobby")
def join_lobby(data):
    """
    Listens for when a player joins the multiplayer lobby and broadcasts to the other subscribers that a new player has joined the lobby.
    """
    try:
        # Create the player object
        player = BasePlayer(request.sid, data["name"], time.time())
        lobby.join_lobby(player)

        emit(
            "joined_lobby",
            {
                "rooms": lobby.rooms,
            },
            broadcast=True,
        )

        return {
            "player": player,
        }
    except Exception as err:
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("leave_lobby")
def leave_lobby():
    """
    Listens for when a player leaves the multiplayer lobby and broadcasts to the other subscribers that the player has left the lobby.
    """
    try:
        lobby.leave_lobby(request.sid)

        emit(
            "left_lobby",
            {
                "rooms": lobby.rooms,
            },
            broadcast=True,
        )
    except Exception as err:
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("create_room")
def create_room():
    """
    Listens for when a player creates a room and broadcasts to the other subscribers that a new room is created for joining.
    """
    try:
        room = lobby.create_new_room(request.sid)

        socket_join_room(room.room_id)  # Socket io join_room

        emit(
            "created_room",
            {
                "rooms": lobby.rooms,
                "selected_room_id": room.room_id,
            },
            broadcast=True,
        )

        return {"room_id": room.room_id}
    except Exception as err:
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("join_room")
def join_room(data):
    """
    Listens for when a player joins a room and broadcasts to the other subscribers that a new player has joined the room.
    """
    try:
        room_id = data["room_id"]
        room = lobby.join_room(request.sid, room_id)

        socket_join_room(room_id)  # Socket io join_room

        emit(
            "joined_room",
            {
                "rooms": lobby.rooms,
                "selected_room_id": room_id,
            },
            broadcast=True,
        )

        # Automatically start game if room is at capacity
        if room.capacity == len(room.players):
            room.start_game()
            emit(
                "started_game",
                {
                    "rooms": lobby.rooms,
                },
                broadcast=True,
            )

    except Exception as err:
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("leave_room")
def leave_room(data):
    """
    Listens for when a player leaves a room and broadcasts to the other subscribers that a player has left the room.
    """
    try:
        room_id = data["room_id"]
        lobby.leave_room(request.sid, room_id)

        socket_leave_room(room_id)  # Socket io leave_room

        emit(
            "left_room",
            {
                "rooms": lobby.rooms,
            },
            broadcast=True,
        )
    except Exception as err:
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("start_game")
def start_game(data):
    """
    Listens for when a game is started and broadcasts to the other subscribers.
    """
    try:
        room_id = data["room_id"]
        lobby.start_game_for_room(request.sid, room_id)

        emit(
            "started_game",
            {
                "rooms": lobby.rooms,
            },
            broadcast=True,
        )

    except Exception as err:
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("fetch_game_data")
def fetch_game_data(data):
    """
    Listens for when game data for a room is requested and returns the corresponding game data.
    """
    try:
        room_id = data["room_id"]
        room = lobby.get_room(room_id)
        game = room.get_game(request.sid)
        return {"game": game}

    except Exception as err:
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("handle_move_action")
def handle_move_action(data):
    """
    Listens for the action when a player moves an existing piece on the board and broadcasts the updated game data to the subscribers of the room.
    """
    try:
        room_id = data["room_id"]
        room = lobby.get_room(room_id)
        game = room.get_game(request.sid)

        game.execute_action_for_player(
            request.sid,
            {
                "type": "MOVE",
                "from_row": data["from_row"],
                "from_col": data["from_col"],
                "to_row": data["to_row"],
                "to_col": data["to_col"],
            },
        )
        emit(
            "send_game_data",
            {"game": game},
            room=room_id,  # Only broadcast to specific room
        )

    except Exception as err:
        print(str(err))
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


@socketio.on("handle_place_action")
def handle_place_action(data):
    """
    Listens for the action when a player places an unplaced piece on the board and broadcasts the updated game data to the subscribers of the room.
    """
    try:
        room_id = data["room_id"]
        room = lobby.get_room(room_id)
        game = room.get_game(request.sid)

        game.execute_action_for_player(
            request.sid,
            {
                "type": "PLACE",
                "num_pieces": data["num_pieces"],
                "row": data["row"],
                "col": data["col"],
            },
        )
        emit(
            "send_game_data",
            {"game": game},
            room=room_id,  # Only broadcast to specific room
        )

    except Exception as err:
        print(str(err))
        emit(
            "invalid_request",
            {"message": str(err)},
            room=request.sid,  # Send only to the requesting client
        )


if __name__ == "__main__":
    socketio.run(app, debug=True, port=3001)
