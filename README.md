<h3 align="center">SMART PARKING</h3>
<p align="center">
<a href="#features">Features</a> &nbsp;&bull;&nbsp;
<a href="#tech-stack">Tech Stack</a> &nbsp;&bull;&nbsp;
<a href="#api">API</a> &nbsp;&bull;&nbsp;
<a href="#installation">Installation</a> &nbsp;&bull;&nbsp;
<a href="#usage">Usage</a> &nbsp;&bull;&nbsp;
<a href="#license">License</a>
</p>

## About

A web application designed for parking management, allowing users to efficiently control and monitor parking spaces within the sites, buildings, and floors assigned to them.

Check out the live demo <a href="https://afga-smart-parking.netlify.app/" target="_blank">here</a>.

> **Note**: For demo purposes, the API limits concurrent users. Use `admin@gmail.com` / `admin` to sign in.

## Features

- **User authentication:** Users can log in and access only the sites, buildings, and floors they manage.
- **Dashboard:** View sites, buildings, and floors, and assign or release parking spots.
- **Statistics:** Track parking occupancy and usage metrics per floor.
- **Reports:** Generate a comprehensive list of all currently occupied parking spots, with the option to export to PDF.
- **CRUD management:** Full create, read, update, and delete operations for sites, buildings, and floors, giving users complete control over the resources they manage.

## Tech Stack

- **Frontend:** Angular
- **Styling:** HTML, CSS, and, Bootstrap

## API

The application uses a REST API for managing user accounts, sites, buildings, and floors.

- **Base URL:** https://api.freeprojectapi.com/api/SmartParking
- **Endpoints:**
  - `POST /login` – Log in a user
  - `GET /getuserbyid/:id` – Get a single user
  - `GET /getallsites/:id` – Get all sites by user
  - `GET /getbuildingbysiteid/:id` – Get all buildings by site
  - `GET /getfloorsbybuildingid/:id` – Get all floors by building
  - `GET /getallparkingbyfloor/:id` – Get all parking by floor
  - `GET /getallparkingbyclientid/:id` – Get all parking by user
  - `POST /addparking` – Create a new parking spot
  - `POST /deleteparking/:id` – Delete a parking spot
  - `POST /addclientsite` – Create a new site
  - `POST /updatesite` – Update a site or building
  - `POST /deletesite/:id` – Delete a site
  - `POST /addfloor` – Create a new floor
  - `POST /updatefloor` – Update a floor
  - `POST /deletefloor/:id` – Delete a floor

> Make sure to have the API running before starting the application.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/angular_smart-parking.git
```

2. Navigate into the project folder:

```bash
cd angular_smart-parking
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm start
```

> The application should now be running at `http://localhost:4200/`. Make sure you have Node.js and Angular CLI installed.

## Usage

- **Log in:**
  - Navigate to the login page and enter your credentials.
- **Dashboard:**
  - View all sites, buildings, and floors under your control.
  - Assign a parking spot to a vehicle or release an occupied spot.
  - Check real-time statistics for each floor, such as occupancy rates.
- **Reports:**
  - Access the reports page to view a list of all currently occupied parking spots.
  - Export reports to PDF for offline review or sharing.
- **CRUD Management (Sites, buildings, and floors):**
  - Create new sites, buildings, or floors.
  - Edit existing entries to update details.
  - Delete resources that are no longer needed.
  - Only users with permissions for a given site can manage its resources.

## License

This project is licensed under the MIT License. See the <a href="https://github.com/afga-dev/angular_smart-parking/blob/master/LICENSE.md" target="_blank">LICENSE</a> file for details.
