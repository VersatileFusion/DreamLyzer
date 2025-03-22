# Dreamlyzer: Dream Journal and Analysis API

Dreamlyzer is a digital dream journal API that helps users track, analyze, and gain insights from their dreams. The application analyzes dream content to extract keywords, identify emotions, and recognize common dream symbols, providing users with a deeper understanding of their subconscious mind.

[Persian (فارسی) README](./README.fa.md)

## Author

**Erfan Ahmadvand**  
Phone: +989109924707

## Features

- **User Authentication**: Register and login to access your personal dream journal
- **Dream Management**: Create, read, update, and delete dream entries
- **Automated Analysis**: 
  - Extracts important keywords from dream content
  - Analyzes emotional tone (positive, negative, neutral)
  - Identifies common dream symbols and their meanings
- **Statistics**: Get insights about patterns in your dreams over time
- **API Documentation**: Interactive Swagger documentation for all endpoints

## Tech Stack

- **Backend**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Natural Language Processing**: Natural.js library for text analysis
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- pnpm package manager

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/dreamlyzer.git
   cd dreamlyzer
   ```

2. Install dependencies
   ```
   pnpm install
   ```

3. Create a .env file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dreamlyzer
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the development server
   ```
   pnpm dev
   ```

5. The server will be running at http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (requires authentication)

### Dreams

- `POST /api/dreams` - Create a new dream entry
- `GET /api/dreams` - Get all dreams for current user
- `GET /api/dreams/:id` - Get a specific dream by ID
- `PUT /api/dreams/:id` - Update a dream entry
- `DELETE /api/dreams/:id` - Delete a dream entry
- `GET /api/dreams/stats` - Get statistics about user's dreams

## Development

### Running in Development Mode

```
pnpm dev
```

This uses nodemon to automatically restart the server when changes are detected.

### Running in Production Mode

```
pnpm start
```

## Architecture

The project follows a modular architecture:

- **Models**: MongoDB schemas and models
- **Routes**: API endpoints and request handlers
- **Utils**: Utility functions for dream analysis
- **Middleware**: Authentication and validation middleware

## Dream Analysis

Dreamlyzer uses natural language processing to analyze dream content:

1. **Keyword Extraction**: Extracts significant words by filtering out common stop words and ranking by frequency
2. **Emotion Analysis**: Evaluates the emotional tone by examining positive, negative, and neutral emotion words
3. **Symbol Recognition**: Identifies common dream symbols (e.g., flying, water, snakes) and provides their potential meanings

## Future Enhancements

- Machine learning models for more sophisticated dream analysis
- Community features to share and discuss dreams anonymously
- Integration with sleep trackers
- Mobile app frontend
- Enhanced statistics and visualizations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Dream symbol interpretations based on common psychological understandings
- Special thanks to the natural.js library for NLP capabilities 