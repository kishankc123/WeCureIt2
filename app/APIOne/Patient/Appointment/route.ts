import { createAppointmentFromRoute } from '../../lib/actions';
import { Request, Response } from 'express';

const createAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentData = req.body;
        const appointment = await createAppointmentFromRoute(appointmentData);
        return res.status(201).json(appointment);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default createAppointment;