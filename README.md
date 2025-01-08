# Understat-FIFA Football Analytics Dashboard

<p align="center">
  <img src="https://placehold.co/200x100/1a1a1a/ddd?text=Dashboard+Logo" alt="Project Logo" width="150"/>
</p>

<p align="center">
  A comprehensive web application for football analytics, providing a suite of tools to explore and manage football data.
</p>

<p align="center">
  <a href="https://github.com/abozten/BLG317E2024Understat">
    <img src="https://img.shields.io/github/stars/abozten/BLG317E2024Understat?style=social" alt="GitHub Stars"/>
  </a>
  <a href="https://github.com/abozten/BLG317E2024Understat/issues">
        <img src="https://img.shields.io/github/issues/your-github-username/your-repo-name" alt="Issues Open"/>
    </a>
  <a href="https://github.com/abozten/BLG317E2024Understat/blob/main/LICENSE">
        <img src="https://img.shields.io/github/license/abozten/BLG317E2024Understat" alt="License">
  </a>
</p>

## Overview

This project is a full-stack web application built to analyze and manage football data, including:

*   **Teams:** View, add, update, and delete football teams.
*   **Players:** Explore player statistics, search, filter, and manage player data.
*   **Matches:** Manage match details, including scores, xG, and forecasts.
*   **Shots:** Detailed shot information with visualizations.
*   **Seasons:** Explore historical data by season, team performance and squad size.
*   **FUT23:** Data for FUT23 player cards
*   **User Authentication**: A basic system for user authentication.
*   **Responsive Design**: Works on desktop.

## Technologies Used

This project utilizes the following technologies:

*   **Frontend:**
    *   [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
    *   [Next.js](https://nextjs.org/) - A React framework for building server-rendered applications.
    *   [CSS Modules](https://github.com/css-modules/css-modules) - For styling components.
    *   [Font Awesome](https://fontawesome.com/) - For icons.
*   **Backend:**
    *   [Flask](https://flask.palletsprojects.com/en/2.3.x/) - A lightweight Python web framework.
    *   [pymysql](https://pymysql.readthedocs.io/en/latest/) - MySQL database connector for Python.
    *   [flask-cors](https://flask-cors.readthedocs.io/en/latest/) - For handling Cross-Origin Resource Sharing.
    *    [flask-session](https://flask-session.readthedocs.io/en/latest/) - For handling sessions.
*   **Database:**
    *   [MySQL](https://www.mysql.com/) - A relational database for storing the project data.

## Features

*   **Data Management:** CRUD (Create, Read, Update, Delete) functionality for teams, players, and matches.
*   **Filtering:** Robust filtering and search capabilities for player data.
*    **Visualization:** Basic visual representation of match data and shot locations.
*   **User Interface**: A clean and user-friendly interface, with expandable search functionality, and a modal for filtering data.
*    **Responsive**: The app is designed to adapt to different screen sizes.

## Setup

Follow these steps to get the project running on your local machine:

### Prerequisites

*   [Node.js](https://nodejs.org/) (>=18.x) and [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
*   [Python](https://www.python.org/) (>=3.7)
*   [MySQL](https://www.mysql.com/) Database Server

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-github-username/your-repo-name.git
    cd your-repo-name
    ```
2.  **Set up the frontend:**
    ```bash
    cd client
    npm install  # or yarn install
    ```
3.  **Set up the backend:**
   ``bash
    cd server
    pip install -r requirements.txt
    ```
4.  **Set up the database:**
   *   Create a MySQL database named `Understat`.
   *  You can load the data in with `shotdata.py` and `fut23.py`
   *  Ensure that you set up your database credentials and port in `api.py`, `shotdata.py` and `fut23.py`
  
5.  **Start the development servers:**
    *  Start the backend
       ``bash
       cd server
       python api.py
        ```
    *  Start the frontend in a new terminal
       ```bash
       cd client
       npm run dev  # or yarn dev
        ```
6. Open your web browser and access the app on <a href="http://localhost:3000">http://localhost:3000</a>

## Usage

*   **Navigation:** Use the top navigation bar to switch between different sections (Teams, Season, Players, Login).
*   **Filtering:** The options button in the player list allows to filter and search for players.
*   **Viewing Details:** Click on a player name in the player list to see details about a player.

## Contributing

Contributions are welcome! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature: `git checkout -b feature-name`.
3.  Commit your changes: `git commit -m "Add some feature"`.
4.  Push to the branch: `git push origin feature-name`.
5.  Open a pull request.

## License

This project is licensed under the [ITU License](LICENSE) - see the `LICENSE` file for details.

---
## Contact

If you have any questions, comments or concerns, feel free to create a new issue.
