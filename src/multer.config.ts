import * as path from 'path';
import { diskStorage } from 'multer';
import * as fs from 'fs';


// For model profile photos
export const modelProfileStorage = {
    storage: diskStorage({
        destination: './uploads/models/profile',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const fileExt = path.extname(file.originalname);
            cb(null, `profile-${uniqueSuffix}${fileExt}`);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req: any, file: { mimetype: string; }, cb: (arg0: Error, arg1: boolean) => void) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    },
};

// For identity verification documents
export const verificationStorage = {
    storage: diskStorage({
        destination: (req: any, file, cb) => {
            // Determine folder based on document type
            const documentType = req.body?.documentType || 'nic';
            let folder = 'documents';

            if (documentType === 'nic') folder = 'nic';
            else if (documentType === 'driving_license') folder = 'driving_license';
            else if (documentType === 'passport') folder = 'passport';

            const uploadPath = path.join('./uploads/verification', folder);

            // Ensure directory exists
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        },
        filename: (req: any, file, cb) => {
            const userId = req.user?.userId || 'unknown';
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1e9);
            const fileExt = path.extname(file.originalname);

            const field = file.fieldname; // frontImage, backImage, parentalConsent
            cb(null, `${userId}-${field}-${timestamp}-${random}${fileExt}`);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for documents
    },
    fileFilter: (req: any, file: { mimetype: string }, cb: (arg0: Error, arg1: boolean) => void) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
        }
    },
};

// Alternative: Single storage with dynamic destination
export const dynamicStorage = {
    storage: diskStorage({
        destination: (req: any, file: { fieldname: string; }, cb: (arg0: Error, arg1: string) => void) => {
            // Determine upload type from request
            const uploadType = req.params?.type || req.body?.uploadType || 'general';
            let folder = 'general';

            switch (uploadType) {
                case 'model_profile':
                    folder = 'models/profile';
                    break;
                case 'nic':
                    folder = 'verification/nic';
                    break;
                case 'driving_license':
                    folder = 'verification/driving_license';
                    break;
                case 'portfolio':
                    folder = 'models/portfolio';
                    break;
                default:
                    folder = 'general';
            }

            // Create directory if it doesn't exist
            const fs = require('fs');
            const path = require('path');
            const uploadPath = `./uploads/${folder}`;

            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
        },
        filename: (req: any, file, cb) => {
            const userId = req.user.userId || 'anonymous';
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1e9);
            const fileExt = path.extname(file.originalname);

            // Clean original filename
            const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');

            cb(null, `${userId}-${timestamp}-${random}-${originalName}`);
        },
    }),
};

export const directorVerificationStorage = {
    storage: diskStorage({
        destination: (req: any, file, cb) => {
            const uploadPath = file.fieldname === 'companyLogo'
                ? './uploads/directors/logo'
                : './uploads/directors/verification';

            if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
        },
        filename: (req: any, file, cb) => {
            const userId = req.user?.userId || 'anonymous';
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `${userId}-${file.fieldname}-${timestamp}-${random}${ext}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // max for documents
    fileFilter: (req: any, file, cb: any) => {
        const logoMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const docMimes = [...logoMimes, 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (file.fieldname === 'companyLogo') {
            logoMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed for logo'));
        } else {
            docMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images and documents allowed'));
        }
    }
};
