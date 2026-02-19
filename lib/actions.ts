import { neon } from '@neondatabase/serverless';
import { RoomType, AvailabilityType, AppointmentType, PatientType, LicenseType, UserType,UpdateAvailabilityParams } from '@/utils/types';
import { DoctorType, FacilityType } from './db';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const db = neon(process.env.DATABASE_URL!);

export async function createRoom(room: RoomType) {
  try {
    const data = await prisma.examRoom.create({
      data: {
        clinicId: room.clinic_id,   // map snake_case → camelCase
        capability: room.capability,
      },
      select: {
        examRoomId: true,
      },
    });

    return data.examRoomId;
  } catch (error) {
    console.error("Database Error:", error);
    console.error("Failed to Insert room, room =", room);

    return {
      message:
        "Database Error: Failed to Insert room, room = " +
        JSON.stringify(room),
    };
  }
}

export async function updateRoom(room: RoomType) {
  try {
    await prisma.examRoom.update({
      where: {
        examRoomId: room.exam_room_id,
      },
      data: {
        capability: room.capability,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: `Database Error: Failed to Update room, examRoomId = ${room.exam_room_id}`,
    };
  }
}


export async function deleteRoom(room: RoomType) {
  try {
    await prisma.examRoom.delete({
      where: {
        examRoomId: room.exam_room_id,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return {
      message: `Database Error: Failed to Delete room, examRoomId = ${room.exam_room_id}`,
    };
  }
}


export async function addAvailability(
  availability: AvailabilityType,
  doctorId: number
) {
  try {
    await prisma.doctorAvailability.create({
      data: {
        doctorId,
        date: new Date(availability.date),
        startTime: new Date(`1970-01-01T${availability.start_time}`),
        endTime: new Date(`1970-01-01T${availability.end_time}`),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, message: "Failed to add availability" };
  }
}

  

export async function deleteAvailability(
  availability: AvailabilityType,
  doctorId: number
) {
  try {
    await prisma.doctorAvailability.deleteMany({
      where: {
        doctorId,
        date: new Date(availability.date),
        startTime: new Date(`1970-01-01T${availability.start_time}`),
        endTime: new Date(`1970-01-01T${availability.end_time}`),
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Failed to delete availability" };
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
    await prisma.doctorAvailability.updateMany({
      where: {
        doctorId: doctor_id,
        startTime: new Date(`1970-01-01T${originalStartTime}`),
        endTime: new Date(`1970-01-01T${originalEndTime}`),
      },
      data: {
        startTime: new Date(`1970-01-01T${newStartTime}`),
        endTime: new Date(`1970-01-01T${newEndTime}`),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
}

export async function createAppointment(
  appointment: AppointmentType,
  user_id: number
) {
  try {
    const patient = await prisma.patientInfo.findFirst({
      where: { userId: user_id },
    });

    if (!patient) throw new Error("Patient not found");

    const created = await prisma.appointment.create({
      data: {
        duration: Number(appointment.duration),
        startTime: new Date(`1970-01-01T${appointment.start_time}`),
        date: new Date(appointment.date),
        clinicId: appointment.clinic_id,
        examRoomId: 1,
        doctorId: appointment.doctor_id,
        patientId: patient.patientId,
      },
    });

    return created;
  } catch (error) {
    console.error("Database Error:", error);
    return { message: "Database Error: Failed to create Appointment" };
  }
}



  export async function deleteAppointment(
    appointment: AppointmentType,
    patient_id: number
  ) {
    try {
      await prisma.appointment.deleteMany({
        where: {
          appointmentId: appointment.appointment_id,
          patientId: patient_id,
        },
      });
    } catch (error) {
      console.error("Database Error:", error);
      return {
        message: `Database Error: Failed to delete appointment, appointment_id = ${appointment.appointment_id}`,
      };
    }
  }
  

  export async function createPatient(user: PatientType) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
          },
        });
  
        await tx.patientInfo.create({
          data: {
            userId: createdUser.userId,
          },
        });
  
        return createdUser;
      });
  
      return { data: result };
    } catch (error) {
      console.error("Database Error:", error);
      return { message: "Failed to create patient" };
    }
  }
  

  export async function addLicense(license: LicenseType) {
  try {
    await prisma.doctorLicense.create({
      data: {
        doctorId: license.doctor_id,
        specialtyId: license.specialty_id,
        stateId: license.state_id,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
  }
}

  

export async function deleteLicense(license: LicenseType) {
  try {
    await prisma.doctorLicense.deleteMany({
      where: {
        doctorId: license.doctor_id,
        specialtyId: license.specialty_id,
        stateId: license.state_id,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
  }
}

  
  export async function updateUserInfo(user: UserType) {
    try {
      await prisma.user.update({
        where: {
          userId: user.user_id,
        },
        data: {
          name: user.name,
          dob: user.dob,
          gender: user.gender,
          address: user.address,
          phoneNumber: user.phone_number,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Database Error:", error);
    }
  }
  


  // export async function createFacility(facility: FacilityType) {
  //   try {
  //     const data = await prisma.clinic.create({
  //       data: {
  //         name: facility.
  //         locationId: facility.location_id,
  //       },
  //       select: {
  //         clinicId: true,
  //       },
  //     });
  
  //     return data.clinicId;
  //   } catch (error) {
  //     console.error("Database Error:", error);
  //   }
  // }
  
  

  export async function deleteFacility(facility: FacilityType) {
    try {
      await prisma.clinic.delete({
        where: {
          clinicId: facility.clinic_id,
        },
      });
    } catch (error) {
      console.error("Database Error:", error);
    }
  }
  

// export async function createDoctor(doctor: DoctorType) {
//     try {
        
//     } catch (error) {

//     }
// }

export async function deleteDoctor(doctor: DoctorType) {
  try {
    await prisma.doctor.delete({
      where: {
        doctorId: doctor.doctor_id,
      },
    });
  } catch (error) {
    console.error("Database Error:", error);
  }
}
