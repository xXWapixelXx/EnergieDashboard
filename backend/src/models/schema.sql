-- Create database if not exists
CREATE DATABASE IF NOT EXISTS energydashboard;
USE energydashboard;

-- Create measurements table
CREATE TABLE IF NOT EXISTS measurements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    solar_voltage DECIMAL(10,2),
    solar_current DECIMAL(10,2),
    hydrogen_production DECIMAL(10,2),
    power_consumption DECIMAL(10,2),
    hydrogen_consumption DECIMAL(10,2),
    outside_temperature DECIMAL(5,2),
    inside_temperature DECIMAL(5,2),
    air_pressure DECIMAL(6,2),
    humidity DECIMAL(5,2),
    battery_level DECIMAL(5,2),
    co2_level DECIMAL(10,2),
    hydrogen_storage_house DECIMAL(5,2),
    hydrogen_storage_car DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_power_consumption (power_consumption),
    INDEX idx_solar_voltage (solar_voltage)
) ENGINE=InnoDB;

-- Create daily_aggregations table
CREATE TABLE IF NOT EXISTS daily_aggregations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    avg_solar_voltage DECIMAL(10,2),
    avg_solar_current DECIMAL(10,2),
    avg_hydrogen_production DECIMAL(10,2),
    avg_power_consumption DECIMAL(10,2),
    avg_hydrogen_consumption DECIMAL(10,2),
    avg_outside_temperature DECIMAL(5,2),
    avg_inside_temperature DECIMAL(5,2),
    avg_air_pressure DECIMAL(6,2),
    avg_humidity DECIMAL(5,2),
    avg_battery_level DECIMAL(5,2),
    avg_co2_level DECIMAL(10,2),
    avg_hydrogen_storage_house DECIMAL(5,2),
    avg_hydrogen_storage_car DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
) ENGINE=InnoDB;

-- Create event to update daily aggregations
DELIMITER //
CREATE EVENT IF NOT EXISTS update_daily_aggregations
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
BEGIN
    INSERT INTO daily_aggregations (
        date,
        avg_solar_voltage,
        avg_solar_current,
        avg_hydrogen_production,
        avg_power_consumption,
        avg_hydrogen_consumption,
        avg_outside_temperature,
        avg_inside_temperature,
        avg_air_pressure,
        avg_humidity,
        avg_battery_level,
        avg_co2_level,
        avg_hydrogen_storage_house,
        avg_hydrogen_storage_car
    )
    SELECT 
        DATE(timestamp),
        AVG(solar_voltage),
        AVG(solar_current),
        AVG(hydrogen_production),
        AVG(power_consumption),
        AVG(hydrogen_consumption),
        AVG(outside_temperature),
        AVG(inside_temperature),
        AVG(air_pressure),
        AVG(humidity),
        AVG(battery_level),
        AVG(co2_level),
        AVG(hydrogen_storage_house),
        AVG(hydrogen_storage_car)
    FROM measurements
    WHERE DATE(timestamp) = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY)
    GROUP BY DATE(timestamp)
    ON DUPLICATE KEY UPDATE
        avg_solar_voltage = VALUES(avg_solar_voltage),
        avg_solar_current = VALUES(avg_solar_current),
        avg_hydrogen_production = VALUES(avg_hydrogen_production),
        avg_power_consumption = VALUES(avg_power_consumption),
        avg_hydrogen_consumption = VALUES(avg_hydrogen_consumption),
        avg_outside_temperature = VALUES(avg_outside_temperature),
        avg_inside_temperature = VALUES(avg_inside_temperature),
        avg_air_pressure = VALUES(avg_air_pressure),
        avg_humidity = VALUES(avg_humidity),
        avg_battery_level = VALUES(avg_battery_level),
        avg_co2_level = VALUES(avg_co2_level),
        avg_hydrogen_storage_house = VALUES(avg_hydrogen_storage_house),
        avg_hydrogen_storage_car = VALUES(avg_hydrogen_storage_car);
END //
DELIMITER ;