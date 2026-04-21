import connectDatabase from '../database/database.js'
import User from '../models/user.model.js'
import Hostel from '../models/hostel.model.js'
import Room from '../models/room.model.js'
import Seat from '../models/seat.model.js'
import Reservation from '../models/reservation.model.js'
import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js'

connectDatabase()

export { User, Hostel, Room, Seat, Reservation, Conversation, Message }
