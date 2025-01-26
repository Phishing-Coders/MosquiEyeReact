<h1 align="center">
  <br>
  <a href="https://github.com/Phishing-Coders/MosquiEyeReact"><img src="https://github.com/user-attachments/assets/ca865741-38d5-4e30-b684-ecb99a92f829" alt="MosquiEye" width="200"></a>
  <br>
  MosquiEye – Smart Mosquito Monitoring
  <br>
</h1>

## Project Overview
MosquiEye is an AI-powered application aimed at monitoring and counting mosquito eggs to help control and prevent mosquito-borne diseases. This tool is designed for use by Ministry of Health officers, offering functionalities for ovitrap management, egg counting, and hotspot identification. The application is built to work seamlessly across web and mobile platforms.

## Tech Stack
- **Frontend**: React JS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Mobile Compatibility**: PWA
- **AI Integration**: OpenCV

## Project Structure
- **Frontend**: `/mosquieye` - Contains the React app for the user interface.
- **Backend**: `/mosquieye/server` - Node.js server with Express to handle API requests.
- **Database**: MongoDB - Stores ovitrap data, egg counts, hotspot data, and user profiles.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas)

### Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Phishing-Coders/MosquiEyeReact.git
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
   - If env is not declared, create a `.env` file in the `/server` directory with your MongoDB URI :
     ```plaintext
     MONGODB_URI=your_mongodb_connection_string
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```
   The backend server should be running on `http://localhost:5000`.

3. **Frontend Setup**
   - Open a new terminal, navigate to the `/mosquieye` directory:
     ```bash
     cd mosquieye
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

## Features
1. **Dashboard**: Overview of mosquito egg counts, trap activity, and alerts.
2. **Report Generation**: Generate reports on egg counts and hotspot areas.
3. **Ovitrap Management**: Manage locations and details of ovitraps.
4. **Hotspot Map**: Visualize mosquito hotspots using data from egg counts.
5. **User Profile Management**: Manage user profiles and role-based access for officers.

## Team
- Project Manager & AI Specialist: *Ahmad Nabil*
- Full Stack Developer: *Hanif Azri & Tan Woon Zhe*
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
