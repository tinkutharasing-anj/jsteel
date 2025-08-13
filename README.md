# Welding Work Manager

A comprehensive mobile and web application for managing daily welding work details, built with React Native and Node.js.

## Features

- **Daily Weld Logging**: Record and manage welding operations with customizable fields
- **Editable Labels**: All field names and categories are configurable
- **Dynamic Field Management**: Add, remove, or modify fields through the admin interface
- **CSV Import/Export**: Bulk data management with CSV files
- **Responsive Design**: Optimized for both tablets (primary) and phones
- **Search & Filtering**: Find specific welds, welders, dates, etc.
- **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

### Frontend
- **React Native** with Expo for cross-platform development
- **React Navigation** for navigation
- **React Native Paper** for Material Design components
- **TypeScript** for type safety

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Multer** for file uploads
- **CSV Parser** for data import/export

## Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd welding-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=welding_app
DB_PASSWORD=your_password_here
DB_PORT=5432
JWT_SECRET=your_jwt_secret_here
```

### 3. Database Setup
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE welding_app;

# Connect to the database
\c welding_app

# Run the schema (copy content from config/schema.sql)
```

### 4. Frontend Setup
```bash
cd ..
npm install
```

## Running the Application

### Backend
```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend
```bash
# For web
npm run web

# For iOS
npm run ios

# For Android
npm run android
```

## Usage

### 1. Field Management
- Navigate to Settings → Field Management
- Add new fields with custom labels
- Reorder fields as needed
- Set field types (text, number, date, etc.)
- Mark fields as required or optional

### 2. Adding Welds
- Tap the + button on the main screen
- Fill in the required fields
- Save the weld record

### 3. Importing Data
- Go to Settings → Import/Export
- Download the sample CSV template
- Fill in your data following the format
- Upload the CSV file

### 4. Exporting Data
- Go to Settings → Import/Export
- Set date range if needed
- Export to CSV format

## CSV Format

The application expects CSV files with these headers:
```
DATE,TYPE FIT,WPS,PIPE DIA,GRADE /CLASS,WELD #,WELDER,1st HT#,"1st Length",JT#,2nd HT#,"2nd Length",PRE HEAT,VT,Process,NDE#,Amps,Volts,IPM
```

## Database Schema

### Tables
- **users**: User authentication and management
- **field_definitions**: Configurable field definitions
- **welds**: Main welding records
- **projects**: Project management (future feature)

### Key Features
- All field names are stored in `field_definitions` table
- Fields can be reordered, added, or removed dynamically
- Support for custom field types and validation rules

## Deployment

### Backend Deployment
1. **Railway** (Recommended for cost-effectiveness):
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

2. **Render**:
   - Free tier available
   - Easy PostgreSQL integration

3. **Heroku**:
   - Free tier available
   - Add PostgreSQL addon

### Frontend Deployment
- **Expo**: Free hosting for web version
- **App Stores**: Free deployment for mobile apps

## Cost Breakdown

- **Backend Hosting**: $5-10/month (Railway/Render)
- **Database**: Included with hosting
- **Frontend**: Free (Expo hosting)
- **Total**: $5-10/month maximum

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] User authentication and roles
- [ ] Project management
- [ ] Advanced reporting and analytics
- [ ] Offline data synchronization
- [ ] Photo attachments for welds
- [ ] Barcode/QR code scanning
- [ ] Integration with welding equipment
- [ ] Multi-language support
