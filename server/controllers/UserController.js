import path from 'path';
import fs from 'fs';
import User from '#models/User.js';

export default class UserController {
    constructor() {}

    async updateUserLastSeenTime(userId) {
        try {
            return (new User).updateUserLastSeenTime(userId);
        } catch (error) {
            console.log('updateUserLastSeenTime error:', error);
        }
    }
}