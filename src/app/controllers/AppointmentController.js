import Cache from '../../lib/Cache';
import Appointment from '../models/Appointment';
import File from '../models/File';
import User from '../models/User';
import CancelAppointmentService from '../services/CancelAppointmentService';
import CreateAppointmentService from '../services/CreateAppointmentService';

class AppointmentController {
  // eslint-disable-next-line consistent-return
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const cacheKey = `user:${req.userId}:appointments:${page}:${limit}`;
    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // invalidate cache
    await Cache.invalidatePrefix(`user:${req.userId}:appointments`);

    const appoitments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    await Cache.set(cacheKey, appoitments);

    res.json(appoitments);
  }

  async save(req, res) {
    const { provider_id, date } = req.body;

    const appointment = await CreateAppointmentService.run({
      provider_id,
      user_id: req.userId,
      date,
    });

    return res.json(appointment);
  }

  async remove(req, res) {
    const appointment = await CancelAppointmentService.run({
      provider_id: req.params.id,
      user_id: req.userId,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
