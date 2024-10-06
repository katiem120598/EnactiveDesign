import asyncio
import websockets
import json
import leap
import time

class MyListener(leap.Listener):
    def __init__(self):
        super(MyListener, self).__init__()
        self.latest_hand_data = None

    def on_connection_event(self, event):
        print("Connected")

    def on_device_event(self, event):
        try:
            with event.device.open():
                info = event.device.get_info()
        except leap.LeapCannotOpenDeviceError:
            info = event.device.get_info()

        print(f"Found device {info.serial}")

    def on_tracking_event(self, event):
        hand_data = []
        for hand in event.hands:
            hand_type = "left" if str(hand.type) == "HandType.Left" else "right"
            palm_position = hand.palm.position
            
            # Check if palm_position has valid coordinates
            if palm_position.x is not None and palm_position.y is not None and palm_position.z is not None:
                hand_data.append({
                    'id': hand.id,
                    'type': hand_type,
                    'x': palm_position.x,
                    'y': palm_position.y,
                    'z': palm_position.z
                })
            else:
                print("Received invalid hand position data.")

        # Update the latest hand data only if valid hand data is available
        if hand_data:
            self.latest_hand_data = hand_data


# WebSocket server to send hand coordinates to JS client
async def send_coordinates(websocket, listener):
    while True:
        # Send the latest hand data if available
        if listener.latest_hand_data:
            await websocket.send(json.dumps(listener.latest_hand_data))
        await asyncio.sleep(0.01)  # Send updates at a high frequency (adjust as needed)

def main():
    my_listener = MyListener()import asyncio
import websockets
import json
import leap
import time

class MyListener(leap.Listener):
    def __init__(self):
        super(MyListener, self).__init__()
        self.latest_hand_data = None

    def on_connection_event(self, event):
        print("Connected to Leap Motion")

    def on_device_event(self, event):
        try:
            with event.device.open():
                info = event.device.get_info()
        except leap.LeapCannotOpenDeviceError:
            info = event.device.get_info()

        print(f"Found device {info.serial}")

    def on_tracking_event(self, event):
        hand_data = []
        for hand in event.hands:
            hand_type = "left" if str(hand.type) == "HandType.Left" else "right"
            palm_position = hand.palm.position
            
            if palm_position.x is not None and palm_position.y is not None and palm_position.z is not None:
                hand_data.append({
                    'id': hand.id,
                    'type': hand_type,
                    'x': palm_position.x,
                    'y': palm_position.y,
                    'z': palm_position.z
                })
            else:
                print("Invalid hand position data")

        if hand_data:
            self.latest_hand_data = hand_data


async def send_coordinates(websocket, listener):
    while True:
        if listener.latest_hand_data:
            await websocket.send(json.dumps(listener.latest_hand_data))
        await asyncio.sleep(0.01)

def main():
    my_listener = MyListener()
    connection = leap.Connection()
    connection.add_listener(my_listener)

    with connection.open():
        connection.set_tracking_mode(leap.TrackingMode.Desktop)
        
        async def server():
            async with websockets.serve(lambda ws, path: send_coordinates(ws, my_listener), "localhost", 8765):
                await asyncio.Future()

        asyncio.run(server())

if __name__ == "__main__":
    main()


    connection = leap.Connection()
    connection.add_listener(my_listener)

    # Start the Leap Motion tracking connection
    with connection.open():
        connection.set_tracking_mode(leap.TrackingMode.Desktop)
        
        # Start WebSocket server
        async def server():
            async with websockets.serve(lambda ws, path: send_coordinates(ws, my_listener), "localhost", 8765):
                await asyncio.Future()  # Keep server running

        asyncio.run(server())

if __name__ == "__main__":
    main()
