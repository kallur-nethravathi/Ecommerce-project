import { uuidv7 } from "uuidv7";
import argon2 from "argon2";
import moment from "moment-timezone";

class UtilityHelper {
    // Time-related methods
    static getUTCTimestamp() {
        const now = new Date();
        return now.toISOString();
    }

    static generateUUID() {
        return uuidv7();
    }

    static getEpochTimestampString() {
        const epochTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
        return epochTimestampInSeconds.toString();
    }

    static async timeStampToEpoch(timeStamp) {
        return Math.floor(timeStamp);
    }

    static async epochToTimeStamp(epoch) {
        const date = new Date(epoch * 1000);
        return date.toISOString();
    }

    static convertTimeZone(utcTime, targetTimeZone) {
        if (targetTimeZone.toLowerCase() === "ist") {
            return moment.tz(utcTime, "Asia/Kolkata").format();
        }
        return utcTime;
    }

    // User-related methods
    static async generateUsername(firstName, lastName) {
        const twoAlphsFirstName = firstName.trim().substring(0, 2).toUpperCase();
        const twoAlphsLastName = lastName.trim().substring(0, 2).toUpperCase();
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        
        return `${twoAlphsFirstName}-${twoAlphsLastName}-${randomDigits}`;
    }

    // Password-related methods
    static async hashPassword(password) {
        return await argon2.hash(password);
    }

    static async verifyPassword(enteredPassword, hashedPassword) {
        return await argon2.verify(hashedPassword, enteredPassword);
    }

    // OTP-related methods
    static async generateOTP(size) {
        const min = 10 ** (size - 1);
        const max = 10 ** size - 1;
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    // Additional utility methods can be added here
    static isValidTimeZone(timeZone) {
        return moment.tz.zone(timeZone) !== null;
    }

    static formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        return moment(date).format(format);
    }

    static getDaysBetweenDates(startDate, endDate) {
        const start = moment(startDate);
        const end = moment(endDate);
        return end.diff(start, 'days');
    }
}

export default UtilityHelper;