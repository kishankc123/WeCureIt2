import { neon } from '@neondatabase/serverless';

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
    const data = await db`
      SELECT users.name, doctors.user_id, doctors.doctor_id, doctors.doctor_info
      FROM doctors
      JOIN users ON doctors.user_id = users.user_id` as DoctorType[];
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the all doctors.');
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
      FROM clinic` as FacilityType[];
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
      FROM exam_room
      WHERE exam_room.clinic_id = ${clinic_id};` as RoomType[];
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the all rooms, clinic_id = ' + clinic_id);
  }
}

export async function getUserInfo(email: String, password: String) {
  try {
    // Direct database query with email and password
    const [user] = await db`
      SELECT user_id, email, role, name 
      FROM users 
      WHERE email = ${email} AND password = ${password}`;

    return user || null;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the user information, email = ' + email);
  }
}

export async function getAvailability(user_id: number) {
  try {
    const [user] = await db`
      SELECT doctor_id
      FROM doctors
      WHERE user_id = ${user_id}`;
    const doctor_id = user?.doctor_id || 0;
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
    throw new Error('Failed to fetch the all Available time, user_id = ' + user_id);
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
      da.duration::text AS duration,
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
      da.duration::text AS duration,
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
    throw new Error('Failed to get the all appointments, user_id = ' + user_id);
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
    console.log("db", JSON.stringify([todayData, futureData]))
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
      FROM doctor_license
      WHERE doctor_license.doctor_id = ${doctor_id};` as LicenseType[];
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
