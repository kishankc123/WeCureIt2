DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clinics CASCADE;
DROP TABLE IF EXISTS exam_rooms CASCADE;
DROP TABLE IF EXISTS patient_info CASCADE;
DROP TABLE IF EXISTS patient_history CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS doctor_licenses CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS doctor_schedule_breakdown CASCADE;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    dob DATE,
    gender VARCHAR(10),
    address VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    role VARCHAR(50) CHECK (role IN ('admin', 'doctor', 'patient'))
);


CREATE TABLE exam_rooms (
    clinic_id INT REFERENCES clinics(clinic_id),
    exam_room_id SERIAL PRIMARY KEY,
    capability VARCHAR(100) 
);

CREATE TABLE patient_info (
    user_id INT REFERENCES users(user_id),
    patient_id SERIAL PRIMARY KEY,
    cc_number INT, 
    cc_cvc INT,    
    cc_expiration DATE 
);

CREATE TABLE patient_history (
    history_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient_info(patient_id),
    doctor_id INT REFERENCES users(user_id),  
    text TEXT,
    date DATE
);


CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    duration INTERVAL,
    start_time TIME,
    date DATE,
    clinic_id INT REFERENCES clinics(clinic_id),
    exam_room_id INT REFERENCES exam_rooms(exam_room_id),
    doctor_id INT REFERENCES users(user_id) 
);


CREATE TABLE doctors (
    doctor_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    doctor_info TEXT
);


CREATE TABLE doctor_licenses (
    doctor_id INT REFERENCES doctors(doctor_id),
    location VARCHAR(255),
    specialty VARCHAR(100)
);


CREATE TABLE doctor_availability (
    doctor_id INT REFERENCES doctors(doctor_id),
    date DATE,
    start_time TIME,
    end_time TIME
);

CREATE TABLE doctor_schedules (
    schedule_id SERIAL PRIMARY KEY,
    doctor_id INT REFERENCES doctors(doctor_id),
    clinic_id INT REFERENCES clinics(clinic_id),
    start_time TIME,
    end_time TIME
);


CREATE TABLE doctor_schedule_breakdown (
    schedule_id INT REFERENCES doctor_schedules(schedule_id),
    status VARCHAR(20), 
    appointment_id INT REFERENCES appointments(appointment_id),
    start_time TIME,
    end_time TIME
);


INSERT INTO users (name, dob, gender, address, phone_number, email, role) VALUES ('test', '1-1-1', 'test', '1', '1', '1', 'test');
INSERT INTO clinics (location) VALUES ('test');
INSERT INTO exam_rooms (clinic_id, capability) VALUES (1, 'test');
INSERT INTO patient_info (user_id, cc_number, cc_cvc, cc_expiration) VALUES (1, '1', '1', '1-1-1');
INSERT INTO patient_history (patient_id, doctor_id, text, date) VALUES (1, 1, 'test', '1-1-1');
INSERT INTO appointments (appointment_id, duration, start_time, date, clinic_id, exam_room_id, doctor_id) VALUES (1, '00:30:00', '01:00:00', '1-1-1', 1, 1, 1);
INSERT INTO doctors (user_id, doctor_info) VALUES (1, 'test');
INSERT INTO doctor_licenses (doctor_id, location, specialty) VALUES (1, 'test', 'test');
INSERT INTO doctor_availability (doctor_id, date, start_time, end_time) VALUES (1, '1-1-1', '01:00:00', '02:00:00');
INSERT INTO doctor_schedules (doctor_id, clinic_id, start_time, end_time) VALUES (1, 1, '01:00:00', '02:00:00');
INSERT INTO doctor_schedule_breakdown (schedule_id, status, appointment_id, start_time, end_time) VALUES (1, 'test', 1, '01:00:00', '02:00:00');

SELECT * FROM users;
SELECT * FROM clinics;
SELECT * FROM exam_rooms;
SELECT * FROM patient_info;
SELECT * FROM patient_history;
SELECT * FROM appointments;
SELECT * FROM doctors;
SELECT * FROM doctor_licenses;
SELECT * FROM doctor_availability;
SELECT * FROM doctor_schedules;
SELECT * FROM doctor_schedule_breakdown;
