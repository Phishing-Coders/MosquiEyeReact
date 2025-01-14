# MosquiEye – Smart Mosquito Monitoring

## Project Overview
MosquiEye is an AI-powered application aimed at monitoring and counting mosquito eggs to help control and prevent mosquito-borne diseases. This tool is designed for use by Ministry of Health officers, offering functionalities for ovitrap management, egg counting, and hotspot identification. The application is built to work seamlessly across web and mobile platforms.

## Tech Stack
- **Frontend**: React (PWA setup)
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Mobile Compatibility**: PWA (or React Native for future mobile development)
- **AI Integration**: (Specify AI tools or models used for mosquito egg counting, if applicable)

## Project Structure
- **Frontend**: `/client` - Contains the React app for the user interface.
- **Backend**: `/server` - Node.js server with Express to handle API requests.
- **Database**: MongoDB - Stores ovitrap data, egg counts, hotspot data, and user profiles.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/mosquieye.git
   cd mosquieye
   ```

2. **Backend Setup**
   - Navigate to the `/server` directory:
     ```bash
     cd server
     ```
   - Install backend dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `/server` directory with your MongoDB URI:
     ```plaintext
     MONGODB_URI=your_mongodb_connection_string
     ```
   - Start the backend server:
     ```bash
     npm run start
     ```
   The backend server should be running on `http://localhost:5000`.

3. **Frontend Setup**
   - Open a new terminal, navigate to the `/client` directory:
     ```bash
     cd client
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```
   - Start the React app:
     ```bash
     npm start
     ```
   The app should be running on `http://localhost:3000`.

4. **Set Up as PWA (Optional)**
   - Ensure the service worker is registered in `index.js` for PWA functionality:
     ```javascript
     import * as serviceWorkerRegistration from './serviceWorkerRegistration';
     serviceWorkerRegistration.register();
     ```
   This setup allows the app to work offline and be installable on mobile devices.

## Features
1. **Dashboard**: Overview of mosquito egg counts, trap activity, and alerts.
2. **Report Generation**: Generate reports on egg counts and hotspot areas.
3. **Ovitrap Management**: Manage locations and details of ovitraps.
4. **Hotspot Map**: Visualize mosquito hotspots using data from egg counts.
5. **User Profile Management**: Manage user profiles and role-based access for officers.

## Team
- Project Manager & AI Specialist: *Ahmad Nabil*
- Full Stack Developer: *Hanif & Tan Woon Zhe*
- DevOps Engineer: *Ahmad Nabil*
- UI/UX Designer: *Eizkhan*
- QA Engineer: *Aqmar Ilhan*

## Contributing
1. Fork the repository.
2. Create a new branch for each feature or bug fix.
3. Make changes and commit.
4. Open a pull request for review.

## License
This project is licensed under the MIT License.
