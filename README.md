# Stellar App Backend (NestJS)

## Prerequisites
- Node.js (v16+)
- MySQL Database

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Configuration**
   Update `src/app.module.ts` to match your MySQL credentials:
   ```typescript
   TypeOrmModule.forRoot({
     type: 'mysql',
     host: 'localhost',
     port: 3306,
     username: 'your_username',
     password: 'your_password', 
     database: 'stellar_app',
     autoLoadEntities: true,
     synchronize: true, // Set to false in production
   })
   ```

3. **Run the Server**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation
The API will be available at `http://localhost:3000`.
