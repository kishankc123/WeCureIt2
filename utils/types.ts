import { neon } from '@neondatabase/serverless';
import { PrismaClient } from "@prisma/client";
import { da } from 'date-fns/locale';

const prisma = new PrismaClient();


export const db = neon(process.env.DATABASE_URL!);
export type DoctorType = {
  user_name: string;         // from users.name
  user_id: number;           // from doctors.user_id
  doctor_id: number;         // from doctors.doctor_id
  doctor_info: string | null; // assuming it can be nullable
  doctor_name: string;       // from doctors.name
  specialty: string | null;  // from doctor_license.specialty (LEFT JOIN = possibly null)
};

  export type FacilityType = {
    clinic_id: number;
    location: string;
    location_id: number;
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
    doctor_name: string;//doctor_name
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
    state_id: number;
    specialty_id: number;
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

  export type AppointmentHistoryType = {
    date: string;
    doctor_id: number;
    text: string;
    patient_info: string;
  };

  export type UpdateAvailabilityParams = {
    doctor_id: number;
    newStartTime: string;
    newEndTime: string;
    originalStartTime: string;
    originalEndTime: string;
  };
  
  
  export async function getDoctors() {
    try {
      const data = await db`
       SELECT 
        users.name AS user_name,
        doctors.user_id, 
        doctors.doctor_id, 
        doctors.doctor_info, 
        users.name AS doctor_name -- Using users.name for doctor_name
        FROM doctors
        JOIN users ON doctors.user_id = users.user_id
        LEFT JOIN doctor_license ON doctors.doctor_id = doctor_license.doctor_id;
` as DoctorType[];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the all doctors.');
    }
  }

  export async function getAppointmentHistoryByUserId(user_id: number) {
    try {
      const data = await db`
        SELECT *
          FROM patient_history ph
          JOIN doctors d ON ph.doctor_id = d.doctor_id
          WHERE ph.patient_id = 1
          ORDER BY ph.date DESC;
      ` as {
        history_id: number;
        doctor_id: number;
        text: string;
        date: string;
      }[];
  
      console.log("Patient Appointment History:", JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to get history for user_id = ' + user_id);
    }
  }
  
  
  export async function getPatients() {
    try {
      const data = await db`
        SELECT users.name, patient_info.user_id, patient_info.patient_id
        FROM patient_info
        JOIN users ON patient_info.user_id = users.user_id` as PatientType[];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the all patients.');
    }
  }
  
  export async function getFacilities() {
    try {
      const data = await db`
        SELECT *
        FROM clinics` as FacilityType[];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the all facilities.');
    }
  }
  
  export async function getRooms(clinic_id: number) {
    try {
      const data = await db`
        SELECT *
        FROM exam_rooms
        WHERE exam_rooms.clinic_id = ${clinic_id};` as RoomType[];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the all rooms, clinic_id = ' + clinic_id);
    }
  }
  

export async function getUserInfo(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        userId: true,
        email: true,
        role: true,
        name: true,
        phoneNumber: true,
        gender: true,
        address: true,
        dob: true,
      },
    });

    return user; // already null if not found
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the user information, email = ' + email);
  }
}

  
  export async function getAvailability(doctor_id: number) {
    try {
      const data = await db`
        SELECT 
        date,
        TRIM(TO_CHAR(date, 'Day')) AS day,
        start_time,
        end_time
        FROM doctor_availability
        WHERE doctor_availability.doctor_id = ${doctor_id};` as AvailabilityType[];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the all Available time, user_id = ' + doctor_id);
    }
  }
  
  export async function searchAvailability(searchBy: SearchByType) {
    try {
      if (searchBy.specialty) {
        const data = await db`
      SELECT 
      dl.doctor_id,
      u.name,
      dl.specialty,
      dl.location,
      da.date,
      da.start_time,
      da.end_time
      FROM doctor_availability da
      JOIN doctor_licenses dl ON da.doctor_id = dl.doctor_id
      JOIN doctors d ON d.doctor_id = dl.doctor_id
      JOIN users u ON d.user_id = u.user_id
      WHERE da.date = ${searchBy.date} AND dl.specialty = ${searchBy.specialty}
      ` as AvailabilityType[];
  
      return data;
      } else {
        const data = await db`
      SELECT 
      dl.doctor_id,
      u.name,
      dl.specialty,
      dl.location,
      da.date,
      da.start_time,
      da.end_time
      FROM doctor_availability da
      JOIN doctor_licenses dl ON da.doctor_id = dl.doctor_id
      JOIN doctors d ON d.doctor_id = dl.doctor_id
      JOIN users u ON d.user_id = u.user_id
      WHERE da.date = ${searchBy.date} AND dl.location = ${searchBy.location}
      `as AvailabilityType[];
  
      return data;
      }
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to search the Available time, SearchBy = ' + JSON.stringify(searchBy));
    }
  }
  
  export async function getAppointmentByPatientId(user_id: number) {
    try {
      const futureData = await db`
        SELECT 
        da.appointment_id,
        da.duration::integer AS duration,
        da.start_time,
        TO_CHAR(da.date::timestamp, 'Month DD, YYYY') AS date,
        da.doctor_id,
        u.name
        FROM appointments da
        JOIN patient_info dl ON da.patient_id = dl.patient_id
        JOIN doctors d ON da.doctor_id = d.doctor_id
        JOIN users u ON d.user_id = u.user_id
        WHERE dl.user_id = ${user_id}
        AND da.date >= CURRENT_DATE
        AND (da.date > CURRENT_DATE OR da.start_time >= CURRENT_TIME)
        ORDER BY da.date, start_time;` as AppointmentType[]
        const pastData = await db`
        SELECT 
        da.appointment_id,
        da.duration::integer AS duration,
        da.start_time,
        TO_CHAR(da.date::timestamp, 'Month DD, YYYY') AS date,
        da.doctor_id,
        u.name
        FROM appointments da
        JOIN patient_info dl ON da.patient_id = dl.patient_id
        JOIN doctors d ON da.doctor_id = d.doctor_id
        JOIN users u ON d.user_id = u.user_id
        WHERE dl.user_id = ${user_id}
        AND da.date <= CURRENT_DATE
        AND (da.date < CURRENT_DATE OR da.start_time < CURRENT_TIME)
        ORDER BY da.date, start_time;` as AppointmentType[]
      return [pastData, futureData];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to get the all appointments for ' + {user_id});
    }
  }

  export async function getFutureAppointmentByPatientId(patient_id: number) {
    try {
      const data = await db`
        SELECT 
          a.appointment_id,
          a.duration::text AS duration,
          a.start_time,
          TO_CHAR(a.date, 'Month DD, YYYY') AS date,
          a.doctor_id,
          u.name AS doctor_name
          FROM appointment a
          JOIN users u ON a.doctor_id = u.user_id
          WHERE a.patient_id = ${patient_id}
            AND (a.date > CURRENT_DATE OR (a.date = CURRENT_DATE AND a.start_time >= CURRENT_TIME))
          ORDER BY a.date, a.start_time;

` as AppointmentType[]
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to get the all future appointments for ' + patient_id);
    }
  }

  export async function getPastAppointmentByPatientId(patient_id: number) {
    try {
      const data = await db`
       SELECT 
          a.appointment_id,
          a.duration::text AS duration,
          a.start_time,
          TO_CHAR(a.date, 'Month DD, YYYY') AS date,
          a.doctor_id,
          u.name AS doctor_name
      FROM appointment a
      JOIN users u ON a.doctor_id = u.user_id
      WHERE a.patient_id = ${patient_id}
        AND (a.date < CURRENT_DATE OR (a.date = CURRENT_DATE AND a.start_time < CURRENT_TIME))
      ORDER BY a.date DESC, a.start_time DESC;


      ` as AppointmentType[];
  
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to get all past appointments for patient_id = ' + patient_id);
    }
  }
  
  
  export async function getAppointmentByDoctorId(user_id: number) {
    try {
      const todayData = await db`
        SELECT 
        da.appointment_id,
        da.duration::text AS duration,
        da.start_time,
        TO_CHAR(da.date::timestamp, 'Month DD, YYYY') AS date,
        da.doctor_id,
        u.name
        FROM appointments da
        JOIN doctors d ON da.doctor_id = d.doctor_id
        JOIN users u ON d.user_id = u.user_id
        WHERE d.user_id = ${user_id}
        AND da.date = CURRENT_DATE
        ORDER BY da.date, start_time;` as AppointmentType[]
        const futureData = await db`
        SELECT 
        da.appointment_id,
        da.duration::text AS duration,
        da.start_time,
        TO_CHAR(da.date::timestamp, 'Month DD, YYYY') AS date,
        da.doctor_id,
        u.name
        FROM appointments da
        JOIN doctors d ON da.doctor_id = d.doctor_id
        JOIN users u ON d.user_id = u.user_id
        WHERE d.user_id = ${user_id}
        AND da.date > CURRENT_DATE
        ORDER BY da.date, start_time;` as AppointmentType[]
      console.log("db",JSON.stringify([todayData, futureData]))
      return [todayData, futureData];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to get the all appointments, user_id = ' + user_id);
    }
  }
  
  export async function getLicenses(doctor_id: number) {
    try {
      const data = await db`
        SELECT *
        FROM doctor_licenses
        WHERE doctor_licenses.doctor_id = ${doctor_id};` as LicenseType[];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the all licenses, doctor_id = ' + doctor_id);
    }
  }
  
  export async function getUsers() {
    try {
      const data = await db`
        SELECT *, TO_CHAR(dob, 'YYYY-MM-DD') AS dob
        FROM users
        ORDER BY user_id;` as UserType[];
      return data;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch the all users.');
    }
  }

  export async function getFutureAppointments(patient_id: number) {
    try {
      const data = await db`
        SELECT * FROM appointment WHERE date > CURRENT_DATE AND patient_id = patientId;
      `;
        return data;
    } catch (error: any) {
      console.error("🔴 Error getting appointments:", error);
      throw new Error("Failed to fetch future appointments");
    }
  }

  export async function updateUser(user_id: number, user: {
    name: string;
    phone_number: string;
    address: string;
    gender: string;
    dob: string; // in 'YYYY-MM-DD' format
  }) {
    try {
      const result = await db`
        UPDATE users
        SET
          name = ${user.name},
          phone_number = ${user.phone_number},
          address = ${user.address},
          gender = ${user.gender},
          dob = ${user.dob}
        WHERE
          user_id = ${user_id}
        RETURNING *;
      `;
  
      return result;
    } catch (error: any) {
      console.error("🔴 Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }
  