-- Simple schema for user authentication
CREATE DATABASE IF NOT EXISTS health_monitoring_db;
USE health_monitoring_db;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  age INT,
  gender VARCHAR(10),
  contact VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  userType VARCHAR(20) DEFAULT 'PATIENT'
);

CREATE TABLE IF NOT EXISTS health_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NOT NULL,
  heart_rate INT,
  systolic_bp INT,
  diastolic_bp INT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(5,2),
  symptoms TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT NOT NULL,
  doctor_id BIGINT,
  appointment_date DATETIME NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert a demo user
INSERT INTO users (username, email, password, userType) VALUES ('Demo User', 'demo@example.com', 'password', 'PATIENT');