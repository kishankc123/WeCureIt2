import { neon } from '@neondatabase/serverless';
import { RoomType, AvailabilityType, AppointmentType, PatientType, LicenseType, UserType,UpdateAvailabilityParams } from '@/utils/types';
import { DoctorType, FacilityType } from './db';

export const db = neon(process.env.DATABASE_URL!);

export async function createRoom(room: RoomType) {
    try {
        const data = await db`
        INSERT INTO exam_room(
        clinic_id, 
        capability
        ) VALUES (
        ${room.clinic_id}, 
        ${room.capability})
        RETURNING *
    `;
        return data[0].exam_room_id;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Insert room, room = ' + room);
        return { message: 'Database Error: Failed to Insert room, room = ' + JSON.stringify(room) };
    }
}

export async function updateRoom(room: RoomType) {
    try {
        await db`
        UPDATE exam_room
        SET capability = ${room.capability}
        WHERE exam_room_id = ${room.exam_room_id}
      `;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Update room, room = ' + room);
        return { message: 'Database Error: Failed to Update room, exam_room_id = ' + room.exam_room_id };
    }
}

export async function deleteRoom(room: RoomType) {
    try {
        await db`DELETE FROM exam_rooms WHERE exam_room_id = ${room.exam_room_id}`;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Delete room, room = ' + room);
        return { message: 'Database Error: Failed to Delete room, exam_room_id = ' + room.exam_room_id };
    }
}

export async function addAvailability(availability: AvailabilityType, doctor_id: number) {
    try {
      const normalizeTime = (time: string) => time.length === 5 ? `${time}:00` : time;
      const date = availability.date;
      const start_time = normalizeTime(availability.start_time);
      const end_time = normalizeTime(availability.end_time);
  
      await db`
        INSERT INTO doctor_availability 
        (doctor_id, date, start_time, end_time)
        VALUES (${doctor_id}, ${date}, ${start_time}, ${end_time});
      `;
  
      return { success: true }; // ✅ Ensure this is returned
    } catch (error) {
      console.error('Database Error:', error);
      return {
        success: false,
        message: 'Failed to add availability: ' + (error instanceof Error ? error.message : String(error)),
      };
    }
  }
  

  export async function deleteAvailability(
    availability: AvailabilityType,
    doctor_id: number
  ) {
    try {
      const dateOnly = new Date(availability.date).toISOString().split('T')[0];
  
      const normalizeTime = (t: string) => t.length === 5 ? `${t}:00` : t;
      const start_time = normalizeTime(availability.start_time);
      const end_time = normalizeTime(availability.end_time);
  
      console.log('Deleting availability:', { doctor_id, dateOnly, start_time, end_time });
  
      await db`
        DELETE FROM doctor_availability
        WHERE doctor_id = ${doctor_id}
          AND date = ${dateOnly}
          AND start_time = ${start_time}
          AND end_time = ${end_time}
      `;
    } catch (error) {
      console.error('Database Error:', error);
      return {
        message: 'Database Error: Failed to delete availability',
        error,
      };
    }
  }

// You can modify this type as needed
export async function updateAvailability({
    doctor_id,
    newStartTime,
    newEndTime,
    originalStartTime,
    originalEndTime,
  }: UpdateAvailabilityParams) {
    try {
      const normalizeTime = (t: string) => {
        if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
        if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
        throw new Error('Invalid time format');
      };
  
      const start_time = normalizeTime(newStartTime);
      const end_time = normalizeTime(newEndTime);
      const original_start_time = normalizeTime(originalStartTime);
      const original_end_time = normalizeTime(originalEndTime);
  
      console.log('Updating availability:', {
        doctor_id,
        original_start_time,
        original_end_time,
        start_time,
        end_time,
      });
  
      await db`
        UPDATE doctor_availability
        SET start_time = ${start_time}, end_time = ${end_time}
        WHERE doctor_id = ${doctor_id}
          AND start_time = ${original_start_time}
          AND end_time = ${original_end_time};
      `;
  
      return { success: true, message: 'Availability updated successfully' };
    } catch (error) {
      console.error('Database Error:', error);
      return { success: false, message: 'Failed to update availability', error };
    }
  }  

export async function createAppointment(appointment: AppointmentType, user_id: number) {
    try {
        const [user] = await db`
        SELECT patient_id
        FROM patient_info
        WHERE user_id = ${user_id}`;
        const patient_id = user?.patient_id || 0;
        await db`
        UPDATE doctor_availability 
        SET start_time = (start_time + INTERVAL '30 minutes')::TIME
        WHERE
        doctor_id = ${appointment.doctor_id} AND
        date = ${appointment.date} AND
        start_time = ${appointment.start_time}
      `;
        const [facility] = await db`
        SELECT clinic_id 
        FROM clinics 
        WHERE location = ${appointment.location}`;

        // Book the appointment
        const inserted = await db`
        INSERT INTO appointments (
        duration, 
        start_time, 
        date, 
        clinic_id, 
        exam_room_id, 
        doctor_id, 
        patient_id
        ) VALUES (
        ${appointment.duration}, 
        ${appointment.start_time},
        ${appointment.date},  
        ${facility.clinic_id}, 
        1, 
        ${appointment.doctor_id}, 
        ${patient_id})
        RETURNING appointment_id
    `;
        const result = await db`
        SELECT 
        *, 
        TO_CHAR(date::timestamp, 'Month DD, YYYY') AS date
        FROM appointments
        WHERE appointment_id = ${inserted[0].appointment_id}
        `;
        return result;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to create Appointment = ' + JSON.stringify(appointment));
        return { message: 'Database Error: Failed to create Appointment' };
    }
}

export async function deleteAppointment(appointment: AppointmentType, patient_id: number) {
    try {
      await db`
        DELETE FROM appointment 
        WHERE 
          appointment_id = ${appointment.appointment_id} AND
          patient_id = ${patient_id}
      `;
    } catch (error) {
      console.error('Database Error:', error);
      console.error('Failed to delete appointment:', JSON.stringify(appointment));
      return { message: `Database Error: Failed to delete appointment, appointment_id = ${appointment.appointment_id}` };
    }
  }

export async function createPatient(user: PatientType) {
    try {
        const data = await db`
        INSERT INTO users (
        name, 
        email, 
        password,
        role
        ) VALUES (
         ${user.name}, 
         ${user.email}, 
         ${user.password},
         ${user.role})
         RETURNING user_id
        `;
        console.log("user_id", data[0].user_id)
        const patient_id = await db`
        INSERT INTO patient_info (
        user_id
        ) VALUES (
         ${data[0].user_id})
         RETURNING patient_id
        `;
        user.user_id = data[0].user_id
        return { data: user };
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to create patient, info = ' + JSON.stringify(user));
        return { message: 'Failed to create patient, info = ' + JSON.stringify(user) };
    }
}

export async function addLicense(license: LicenseType) {
    try {
        await db`
        INSERT INTO doctor_license(
        doctor_id, 
        location, 
        specialty
        ) VALUES (
        ${license.doctor_id}, 
        ${license.location}, 
        ${license.specialty})
    `;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Insert license, license = ' + JSON.stringify(license));
        return { message: 'Database Error: Failed to Insert license, license = ' + JSON.stringify(license) };
    }
}

export async function deleteLicense(license: LicenseType) {
    try {
        await db`DELETE FROM doctor_license 
        WHERE 
        doctor_id = ${license.doctor_id} AND
        location = ${license.location} AND
        specialty = ${license.specialty}
        `;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Delete license, license = ' + JSON.stringify(license));
        return { message: 'Database Error: Failed to Delete license, license = ' + JSON.stringify(license) };
    }
}

export async function updateUserInfo(user: UserType) {
    try {
        await db`
        UPDATE users
        SET 
        name = ${user.name},
        dob = ${user.dob},
        gender = ${user.gender},
        address = ${user.address},
        phone_number = ${user.phone_number},
        email = ${user.email}
        WHERE user_id = ${user.user_id}
      `;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Update user, user = ' + JSON.stringify(user));
        return { message: 'Database Error: Failed to Update user, user = ' + JSON.stringify(user) };
    }
}


export async function createFacility(facility: FacilityType) {
    try {
        const data = await db`
        INSERT INTO clinic(
        location
        ) VALUES (
        ${facility.location})
        RETURNING *
    `;
        return data[0].clinic_id;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Insert facility, facility = ' + JSON.stringify(facility));
        return { message: 'Database Error: Failed to Insert facility, facility = ' + JSON.stringify(facility) };
    }
}

export async function deleteFacility(facility: FacilityType) {
    try {
        await db`DELETE FROM clinic 
        WHERE 
        clinic_id = ${facility.clinic_id}
        `;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Delete facility, facility = ' + JSON.stringify(facility));
        return { message: 'Database Error: Failed to Delete facility, facility = ' + JSON.stringify(facility) };
    }
}

// export async function createDoctor(doctor: DoctorType) {
//     try {
        
//     } catch (error) {

//     }
// }

export async function deleteDoctor(doctor: DoctorType) {
    try {
        await db`DELETE FROM doctors 
        WHERE 
        doctor_id = ${doctor.doctor_id}
        `;
    } catch (error) {
        console.error('Database Error:', error);
        console.error('Failed to Delete doctor, doctor = ' + JSON.stringify(doctor));
        return { message: 'Database Error: Failed to Delete doctor, doctor = ' + JSON.stringify(doctor) };
    }
}