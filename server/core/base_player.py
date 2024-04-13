import json_fix


class BasePlayer:
    def __init__(self, id: str, name: str, created_at: float):
        self.id = id
        self.name = name
        self.created_at = created_at
        self.room_id = None

    def join_room(self, room_id: str):
        self.room_id = room_id

    def leave_room(self):
        self.room_id = None

    def __json__(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "room_id": self.room_id,
        }
