# DynamoDB Local Setup Guide

This guide explains how to set up and use DynamoDB Local with Docker for development.

## Prerequisites

- Docker Desktop installed and running
- .NET 8.0 SDK
- Node.js (for React frontend)

## Quick Start

### 1. Start DynamoDB Local

You can start DynamoDB Local using Docker Compose (recommended) or Docker directly:

#### Option A: Using Docker Compose (Recommended)
```bash
cd "Hackathon project/aws-dynamodb-crud-aspnet-core"
docker-compose up -d
```

#### Option B: Using Docker directly
```bash
docker run -p 8000:8000 amazon/dynamodb-local:latest
```

### 2. Verify DynamoDB Local is Running

Check if the container is running:
```bash
docker ps
```

You should see a container with the image `amazon/dynamodb-local` running on port 8000.

### 3. Test DynamoDB Local Connection

You can test the connection using AWS CLI or a tool like Postman:

```bash
# Using AWS CLI (if installed)
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Or test with curl
curl -X POST http://localhost:8000/shell
```

### 4. Run the .NET Backend

```bash
cd "Hackathon project/aws-dynamodb-crud-aspnet-core/DynamoStudentManager"
dotnet run
```

The application will:
- Connect to DynamoDB Local on `http://localhost:8000`
- Create the `Mappings` table if it doesn't exist
- Seed the table with data from `Data/Mappings.json`

### 5. Run the React Frontend

```bash
cd "Hackathon project/IntelliRouteStudio"
npm install
npm run dev
```

## Configuration

### Backend Configuration

The backend is configured in `appsettings.json`:

```json
{
  "UseMockRepository": false,
  "DynamoDB": {
    "LocalEndpoint": "http://localhost:8000",
    "TableName": "Mappings"
  }
}
```

### Frontend Configuration

The frontend connects to the backend on `http://localhost:5214` (configured in `mappingsService.ts`).

## DynamoDB Table Structure

The `Mappings` table is created with the following structure:

- **Primary Key**: `Id` (String)
- **Attributes**:
  - `Operation` (String)
  - `Version` (Number)
  - `Status` (String)
  - `LastModified` (String - ISO 8601 format)
  - `IsDeleted` (Boolean)
  - `DeletedAt` (String - ISO 8601 format, nullable)
  - `Soap` (String - JSON serialized, nullable)
  - `Rest` (String - JSON serialized, nullable)
  - `RestSource` (String - JSON serialized, nullable)
  - `RestDestination` (String - JSON serialized, nullable)

## Data Seeding

The application automatically seeds the DynamoDB table with data from `Data/Mappings.json` when:
- The table is first created
- The table exists but is empty

## Troubleshooting

### Common Issues

1. **Port 8000 already in use**
   ```bash
   # Find what's using port 8000
   netstat -ano | findstr :8000
   
   # Stop the process or use a different port
   ```

2. **DynamoDB Local not accessible**
   ```bash
   # Check if container is running
   docker ps
   
   # Check container logs
   docker logs dynamodb-local
   ```

3. **Table creation fails**
   - Ensure DynamoDB Local is running and accessible
   - Check application logs for detailed error messages
   - Verify the `Data/Mappings.json` file exists and is valid JSON

4. **CORS issues**
   - The backend is configured with CORS policies for development
   - Ensure the frontend is running on the expected ports

### Reset DynamoDB Local

To completely reset the local DynamoDB:

```bash
# Stop and remove the container
docker-compose down

# Remove the volume (this will delete all data)
docker volume rm aws-dynamodb-crud-aspnet-core_dynamodb_data

# Start fresh
docker-compose up -d
```

## Development Workflow

1. **Start DynamoDB Local**: `docker-compose up -d`
2. **Run Backend**: `dotnet run` (in DynamoStudentManager directory)
3. **Run Frontend**: `npm run dev` (in IntelliRouteStudio directory)
4. **Make Changes**: The backend will automatically recreate tables and seed data
5. **Stop Services**: Use `Ctrl+C` to stop backend/frontend, `docker-compose down` to stop DynamoDB

## Production Considerations

- This setup is for development only
- For production, use AWS DynamoDB with proper IAM roles and security
- Update `appsettings.json` to use AWS credentials and region
- Set `UseMockRepository` to `false` in production
- Configure proper CORS policies for production domains
