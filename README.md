# rush-hour

To run the camera, run the following commands in a seperate window from the storybook
Camera use is optional and can be toggled on and off in the storybook window

If there are errors with the camera due to lighting then remove all cars and open the pygame window,
then press space to calibrate the board. This should make the board be read correctly.

Run the files in backend/src/database in psql to create a PostgreSQL database that can be used as a backend source for the web application. 

```bash
cd frontend/camera_backend
python main.py
```

To run storybook to play with components, run the following command:

```bash
cd frontend && npm run storybook
```

To run backend for storybook run following command:

```bash
cd backend && npm run build && npm start
```
