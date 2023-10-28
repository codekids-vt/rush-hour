import socket
import cv2
from cam_to_cars import convert_color_map_to_cars, get_and_process_frame

def main():
    s = socket.socket()
    s.bind(("127.0.0.1", 5000))
    s.listen(5)
    
    while True:  # Infinite loop to keep the server listening
        print("Waiting for a connection...")
        conn, addr = s.accept()
        print(f"Connected to {addr}")

        vid = cv2.VideoCapture(0)
        while True:
            try:
                # Close the connection if 'q' is pressed
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

                color_map, display_frame = get_and_process_frame(vid)
                current_cars = convert_color_map_to_cars(color_map)

                cv2.imshow('frame', display_frame)

                str_version = str(current_cars).encode()
                conn.send(str_version)

            except ConnectionAbortedError:
                print("Connection aborted by the client or software in host machine.")
                break  # Break out of the inner while loop to accept another connection
            except Exception as e:
                print(f"An error occurred: {e}")
                break

        conn.close()
        print("Connection closed.")

if __name__ == "__main__":
    main()
