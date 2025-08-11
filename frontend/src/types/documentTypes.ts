export interface DocumentType {
    id: string;
    name: string;
    description: string;
    requirements?: string[];
}

export interface DocumentRequest {
    id: string;
    documentType: string;
    studentId: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    requestDate: string;
    pickupDate: string;
    pickupTime: string;
    purpose: string;
    notes?: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
    {
        id: 'form137',
        name: 'Form 137 (Permanent Record)',
        description: 'Official permanent record of grades and academic performance throughout high school.',
        requirements: ['Valid ID', 'Request Form', 'Authorization Letter (if not the student)']
    },
    {
        id: 'form138',
        name: 'Form 138 (Report Card)',
        description: 'Official report card showing grades for each grading period.',
        requirements: ['Valid ID', 'Request Form']
    },
    {
        id: 'diploma',
        name: 'High School Diploma',
        description: 'Official certificate of high school graduation.',
        requirements: ['Valid ID', 'Request Form', 'Clearance Form']
    },
    {
        id: 'sf10',
        name: 'School Form 10 (SF10)',
        description: 'Learner\'s permanent academic record in the K to 12 Basic Education Program.',
        requirements: ['Valid ID', 'Request Form', 'Previous School Records (if transferee)']
    },
    {
        id: 'sf9',
        name: 'School Form 9 (SF9)',
        description: 'Current school year\'s report card in the K to 12 Basic Education Program.',
        requirements: ['Valid ID', 'Request Form']
    },
    {
        id: 'goodMoral',
        name: 'Certificate of Good Moral Character',
        description: 'A character reference from the school; often required for college applications, scholarships, or job applications.',
        requirements: ['Valid ID', 'Request Form']
    },
    {
        id: 'enrollment',
        name: 'Certificate of Enrollment/Attendance',
        description: 'Proof that a student is currently enrolled or has attended a particular school.',
        requirements: ['Valid ID']
    },
    {
        id: 'graduation',
        name: 'Certificate of Graduation',
        description: 'Confirms that the student has completed senior high school (Grade 12).',
        requirements: ['Valid ID', 'Request Form']
    },
    {
        id: 'clearance',
        name: 'Clearance Form',
        description: 'Required before graduation or transfer; proves the student has settled all obligations.',
        requirements: ['Valid ID', 'No pending obligations']
    },
    {
        id: 'recommendation',
        name: 'Recommendation Letters',
        description: 'Written by teachers or administrators for college, scholarship, or job applications.',
        requirements: ['Valid ID', 'Request Form', 'Purpose Statement']
    },
    {
        id: 'awards',
        name: 'Honors/Awards Certificates',
        description: 'Recognitions like "With Honors," "Best in Math," etc.',
        requirements: ['Valid ID', 'Proof of Award']
    }
]; 