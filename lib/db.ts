import { neon } from '@neondatabase/serverless';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const db = neon(process.env.DATABASE_URL!);

export type DoctorType = {
  user_id: number;
  name: string;
  doctor_id: number;
  doctor_info: string;
};

export type FacilityType = {
  clinic_id: number;
  location: string;
};

export type RoomType = {
  clinic_id: number;
  exam_room_id: number;
  capability: string;
};

export type PatientType = {
  user_id: number;
  name: string;
  email: string;
  password: string;
  role: string;
};

export type AvailabilityType = {
  date: string,
  day: string;
  start_time: string;
  end_time: string;
};

export type SearchByType = {
  date: string;
  specialty: string;
  location: string;
};

export type DoctorAvailabilityType = {
  name: string;
  doctor_id: number;
  specialty: string;
  location: string;
  date: string;
  start_time: string;
  end_time: string;
};

export type AppointmentType = {
  name: string;//doctor_name
  appointment_id: number;
  duration: string;
  start_time: string;
  date: string;
  clinic_id: number;
  exam_room_id: number;
  doctor_id: number;
  specialty: string;
  location: string;
};

export type LicenseType = {
  doctor_id: number;
  location: string;
  specialty: string;
};

export type UserType = {
  user_id: number;
  name: string;
  dob: string;
  gender: string;
  address: string;
  phone_number: string;
  email: string;
  role: string;
};

export type VeriCodeType = {
  email: string;
  code: string;
  expires_at: string;
  used: boolean;
};

export async function getDoctors() {
  try {
    const data = await prisma.doctor.findMany({
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    return data.map(d => ({
      name: d.user?.name,
      user_id: d.userId,
      doctor_id: d.doctorId,
      doctor_info: d.doctorInfo
    }))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the all doctors.')
  }
}


export async function getPatients() {
  try {
    const data = await prisma.patientInfo.findMany({
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    return data.map(p => ({
      name: p.user?.name,
      user_id: p.userId,
      patient_id: p.patientId
    }))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the all patients.')
  }
}


export async function getFacilities() {
  try {
    return await prisma.clinic.findMany()
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the all facilities.')
  }
}


export async function getRooms(clinic_id: number) {
  try {
    return await prisma.examRoom.findMany({
      where: { clinicId: clinic_id }
    })
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the all rooms, clinic_id = ' + clinic_id)
  }
}


export async function getUserInfo(email: string, password: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        password
      },
      select: {
        userId: true,
        email: true,
        role: true,
        name: true
      }
    })

    return user || null
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the user information, email = ' + email)
  }
}


export async function getAvailability(user_id: number) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user_id }
    })

    if (!doctor) return []

    const data = await prisma.doctorAvailability.findMany({
      where: { doctorId: doctor.doctorId }
    })

    return data.map(a => ({
      date: a.date,
      day: a.date?.toLocaleDateString('en-US', { weekday: 'long' }),
      start_time: a.startTime,
      end_time: a.endTime
    }))
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the all Available time, user_id = ' + user_id)
  }
}


export async function searchAvailability(searchBy: SearchByType) {
  try {
    return await prisma.doctorAvailability.findMany({
      where: {
        date: searchBy.date,
        doctor: {
          doctorLicenses: searchBy.specialty
            ? {
                some: {
                  specialty: {
                    name: searchBy.specialty
                  }
                }
              }
            : {
                some: {
                  state: {
                    name: searchBy.location
                  }
                }
              }
        }
      },
      include: {
        doctor: {
          include: {
            user: true,
            doctorLicenses: {
              include: {
                specialty: true,
                state: true
              }
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error(
      'Failed to search the Available time, SearchBy = ' +
        JSON.stringify(searchBy)
    )
  }
}


export async function getAppointmentByPatientId(user_id: number) {
  try {
    const patient = await prisma.patientInfo.findFirst({
      where: { userId: user_id }
    })

    if (!patient) return [[], []]

    const now = new Date()

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.patientId },
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const past = appointments.filter(a => new Date(a.date!) < now)
    const future = appointments.filter(a => new Date(a.date!) >= now)

    return [past, future]
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to get the all appointments, user_id = ' + user_id)
  }
}


export async function getAppointmentByDoctorId(user_id: number) {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user_id }
    })

    if (!doctor) return [[], []]

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.doctorId },
      include: {
        doctor: {
          include: { user: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const todayAppointments = appointments.filter(a =>
      a.date?.toDateString() === new Date().toDateString()
    )

    const futureAppointments = appointments.filter(a =>
      a.date! > today
    )

    return [todayAppointments, futureAppointments]
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to get the all appointments, user_id = ' + user_id)
  }
}


export async function getLicenses(doctor_id: number) {
  try {
    return await prisma.doctorLicense.findMany({
      where: { doctorId: doctor_id },
      include: {
        specialty: true,
        state: true
      }
    })
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the all licenses, doctor_id = ' + doctor_id)
  }
}


export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { userId: 'asc' }
    })
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the all users.')
  }
}

