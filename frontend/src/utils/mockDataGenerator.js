// Common Filipino first names from Cordillera region
const firstNames = [
    'Crisanto Abel', 'Ernesto',
    'Fernando', 'Joe Juan',
    'Nina', 'Olivia', 'Kevin', 'Benedict',
    'Airies Petra', 'Quina', 'Rosa', 'Sofia', 'Teresa',
    'Victoria Anne', 'Xyra Mae',
    'Maria', 'Ana', 'Elena', 'Clara',
    'Michael', 'John', 'Mark', 'Luke', 'Stephen Matthew',
    'James', 'Peter', 'Paul', 'John', 'Mark',
    'Luke', 'Matthew', 'James', 'Peter', 'Paul'
];

// Common Filipino surnames from Cordillera region
const lastNames = [
    'Abalos', 'Bakitan', 'Carino', 'Dawagan', 'Equipaje',
    'Fangloy', 'Guinoden', 'Hangdaan', 'Ignacio', 'Julian',
    'Kiangan', 'Lamut', 'Malanas', 'Nabus', 'Ognayon',
    'Pagador', 'Quilio', 'Ramirez', 'Sarol', 'Tauli',
    'Ulep', 'Valdez', 'Wanawan', 'Yabut', 'Zabala'
];

// Common religions in the region
const religions = [
    'Roman Catholic',
    'Protestant',
    'Iglesia ni Cristo',
    'Baptist'
];

// Common Cordillera addresses and barangays
const addresses = [
    'Poblacion, La Trinidad, Benguet',
    'Central Guisad, Baguio City',
    'Calanan, Tabuk City, Kalinga',
    'Bulanao, Tabuk City, Kalinga',
    'Bangued, Abra',
    'Lagawe, Ifugao',
    'Bontoc, Mountain Province',
    'Bauko, Mountain Province',
    'Buyagan, La Trinidad',
    'Puguis, La Trinidad'
];

// Schools in Cordillera
const schools = [
    'Baguio City National High School',
    'Saint Louis School of La Trinidad',
    'Benguet State University Laboratory High School',
    'Mountain Province General Comprehensive High School',
    'Kalinga State University Laboratory School',
    'Ifugao State University Laboratory School',
    'Cordillera Career Development College',
    'Easter College',
    'University of Baguio Science High School',
    'Eastern La Trinidad National High School'
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

const generateBirthDate = () => {
    const start = new Date(2007, 0, 1); // For high school students
    const end = new Date(2010, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        .toISOString().split('T')[0];
};

const generateLRN = () => {
    return '1' + Array(11).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
};

const generatePhoneNumber = () => {
    return '09' + Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
};

const generateEmail = (firstName, lastName) => {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@${getRandomElement(domains)}`;
};

export const generateStudentData = () => {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const middleInitial = getRandomElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    // Generate parent names
    const fatherName = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
    const motherName = `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
    const guardianName = Math.random() > 0.5 ? fatherName : motherName;

    // Generate address components
    const addressParts = getRandomElement(addresses).split(', ');

    return {
        // Student Information
        firstName,
        lastName,
        middleName: getRandomElement(lastNames),
        middleInitial,
        birthDate: generateBirthDate(),
        lrn: generateLRN(),
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        age: Math.floor(Math.random() * (17 - 12 + 1)) + 12,
        religion: getRandomElement(religions),
        citizenship: 'Filipino',

        // Contact & Address
        phoneNumber: generatePhoneNumber(),
        email: generateEmail(firstName, lastName),
        address: getRandomElement(addresses),
        barangay: addressParts[0] || '',
        city: addressParts[1] || '',
        province: addressParts[2] || '',

        // Educational Information
        lastSchoolAttended: getRandomElement(schools),
        gradeToEnroll: `Grade ${Math.min(11, Math.max(7, Math.floor(Math.random() * 5) + 7))}`, // Will generate Grade 7-11
        strand: getRandomElement(['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL']),
        schoolYear: '2025-2026',

        // Family Information
        fatherName,
        fatherOccupation: 'Professional',
        fatherContact: generatePhoneNumber(),
        motherName,
        motherOccupation: 'Business Owner',
        motherContact: generatePhoneNumber(),
        guardianName,
        guardianRelationship: Math.random() > 0.5 ? 'Father' : 'Mother',
        guardianOccupation: 'Professional',
        guardianContact: generatePhoneNumber(),
        
        // Additional fields
        placeOfBirth: getRandomElement([
            'Baguio City', 
            'La Trinidad', 
            'Tabuk City',
            'Bangued',
            'Lagawe'
        ])
    };
};
