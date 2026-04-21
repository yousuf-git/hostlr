import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.3',
    info: { title: 'HOSTLR API', version: '1.0.0', description: 'Hostel Finder MVP API' },
    servers: [{ url: 'http://localhost:4000', description: 'Local dev' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Hostels', description: 'Hostel management' },
      { name: 'Rooms', description: 'Room management' },
      { name: 'Browse', description: 'Public browse' },
      { name: 'Reservations', description: 'Reservation flow' },
      { name: 'Chat', description: 'Messaging' },
      { name: 'Admin', description: 'Admin panel' },
    ],
  },
  apis: ['./src/routes/**/*.js'],
}

export default swaggerJsdoc(options)
