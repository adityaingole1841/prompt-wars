export interface PsychologistCenter {
  id: string;
  name: string;
  city: string;
  state: string;
  type: 'Government Institute' | 'Registered Clinic' | 'Crisis NGO' | 'Hospital Dept';
  address: string;
  phone: string;
  hours: string;
  feeType: 'Free / Subsidized' | 'Standard Fees' | 'Free Helpline';
  languages: string[];
  website?: string;
  mapsQuery: string;
}

export interface MentalHelpline {
  id: string;
  name: string;
  phone: string;
  rawPhone: string;
  description: string;
  availability: string;
  languages: string;
  isPrimary?: boolean;
}

export const TELE_MANAS_INFO = {
  shortCode: '14416',
  tollFree: '1800-891-4416',
  title: 'Tele-MANAS (National Mental Health Helpline)',
  authority: 'Ministry of Health & Family Welfare, Govt. of India & NIMHANS',
  description:
    'Free, 24/7, confidential mental health counseling and psychiatric consultation provided by certified mental health specialists across India in 20+ regional languages.',
  availability: '24 Hours, 7 Days a Week (Always Free)',
  languages: 'Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese & more',
};

export const CRISIS_HELPLINES: MentalHelpline[] = [
  {
    id: 'tele-manas',
    name: 'Tele-MANAS National Helpline',
    phone: '14416 / 1800-891-4416',
    rawPhone: '14416',
    description: 'Government of India national unified 24/7 mental health & psychiatric crisis care.',
    availability: '24x7 Free Service',
    languages: 'All Indian Regional Languages',
    isPrimary: true,
  },
  {
    id: 'kiran',
    name: 'KIRAN National Mental Health Helpline',
    phone: '1800-599-0019',
    rawPhone: '18005990019',
    description: 'Department of Empowerment of Persons with Disabilities, Govt. of India for stress, depression & anxiety.',
    availability: '24x7 Toll-Free',
    languages: 'Hindi, English & 13 Regional Languages',
  },
  {
    id: 'vandrevala',
    name: 'Vandrevala Foundation',
    phone: '+91 9999 666 555',
    rawPhone: '9999666555',
    description: 'Professional telephone counseling with trained clinical psychologists & mental health counselors.',
    availability: '24x7 Free Consultation',
    languages: 'Hindi, English, Gujarati, Marathi',
  },
  {
    id: 'aasra',
    name: 'AASRA Suicide Prevention & Crisis',
    phone: '+91 98204 66726',
    rawPhone: '9820466726',
    description: '24x7 helpline for individuals dealing with extreme distress, loneliness, or suicidal ideation.',
    availability: '24x7 Confidential',
    languages: 'English & Hindi',
  },
  {
    id: 'icall',
    name: 'iCall (Tata Institute of Social Sciences)',
    phone: '+91 91529 87821',
    rawPhone: '9152987821',
    description: 'Free psychosocial counseling by qualified psychologists and counselors at TISS Mumbai.',
    availability: 'Mon - Sat (8:00 AM - 10:00 PM)',
    languages: 'English, Hindi, Marathi, Bengali, Malayalam',
  },
];

export const REGIONAL_CENTERS: PsychologistCenter[] = [
  {
    id: 'nimhans-blr',
    name: 'NIMHANS Center for Well-Being & Emergency Psychiatry',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Government Institute',
    address: 'Hosur Road, Near Dairy Circle, Bengaluru, Karnataka 560029',
    phone: '080-26995000',
    hours: '24/7 Emergency & Walk-in OPD (9:00 AM - 4:00 PM)',
    feeType: 'Free / Subsidized',
    languages: ['Kannada', 'English', 'Hindi', 'Tamil', 'Telugu'],
    mapsQuery: 'NIMHANS+Hosur+Road+Bengaluru',
  },
  {
    id: 'aiims-del',
    name: 'AIIMS Dept. of Psychiatry & Behavioral Sciences',
    city: 'Delhi NCR',
    state: 'Delhi',
    type: 'Government Institute',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
    phone: '011-26588500',
    hours: 'Emergency 24/7 | OPD Mon-Sat 8:30 AM - 1:00 PM',
    feeType: 'Free / Subsidized',
    languages: ['Hindi', 'English', 'Punjabi'],
    mapsQuery: 'AIIMS+Psychiatry+Ansari+Nagar+New+Delhi',
  },
  {
    id: 'vimhans-del',
    name: 'VIMHANS (Vidyasagar Institute of Mental Health)',
    city: 'Delhi NCR',
    state: 'Delhi',
    type: 'Registered Clinic',
    address: '1 Institutional Area, Nehru Nagar, New Delhi 110065',
    phone: '011-29849018',
    hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    feeType: 'Standard Fees',
    languages: ['Hindi', 'English'],
    mapsQuery: 'VIMHANS+Nehru+Nagar+Delhi',
  },
  {
    id: 'kem-mum',
    name: 'KEM Hospital Psychiatry & Mental Health Outpatient',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Government Institute',
    address: 'Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012',
    phone: '022-24107000',
    hours: 'Emergency 24x7 | OPD Mon-Fri 8:30 AM - 12:30 PM',
    feeType: 'Free / Subsidized',
    languages: ['Marathi', 'Hindi', 'English'],
    mapsQuery: 'KEM+Hospital+Psychiatry+Parel+Mumbai',
  },
  {
    id: 'masina-mum',
    name: 'Masina Hospital - Department of Psychiatry & Psychology',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Hospital Dept',
    address: 'Sant Savta Mali Marg, Byculla East, Mumbai, Maharashtra 400027',
    phone: '022-61841200',
    hours: 'Mon-Sat: 9:00 AM - 8:00 PM',
    feeType: 'Standard Fees',
    languages: ['English', 'Hindi', 'Marathi'],
    mapsQuery: 'Masina+Hospital+Byculla+Mumbai',
  },
  {
    id: 'scarf-chn',
    name: 'SCARF (Schizophrenia Research Foundation) & Mental Health Clinic',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Crisis NGO',
    address: 'R/7A North Main Road, Anna Nagar West Extension, Chennai 600101',
    phone: '044-26151073',
    hours: 'Mon-Sat: 9:00 AM - 5:00 PM',
    feeType: 'Free / Subsidized',
    languages: ['Tamil', 'English'],
    mapsQuery: 'SCARF+Anna+Nagar+Chennai',
  },
  {
    id: 'asha-hyd',
    name: 'Asha Hospital - Psychiatry & Clinical Psychology Center',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Registered Clinic',
    address: 'Road No 14, Banjara Hills, Hyderabad, Telangana 500034',
    phone: '040-44445555',
    hours: '24/7 Psychiatric Emergency & Outpatient Services',
    feeType: 'Standard Fees',
    languages: ['Telugu', 'Hindi', 'English', 'Urdu'],
    mapsQuery: 'Asha+Hospital+Banjara+Hills+Hyderabad',
  },
  {
    id: 'iop-kol',
    name: 'Institute of Psychiatry (IPGMER & SSKM Hospital)',
    city: 'Kolkata',
    state: 'West Bengal',
    type: 'Government Institute',
    address: '7 DL Khan Road, Bhowanipore, Kolkata, West Bengal 700025',
    phone: '033-22234000',
    hours: 'Mon-Sat: 9:00 AM - 2:00 PM (Emergency 24x7)',
    feeType: 'Free / Subsidized',
    languages: ['Bengali', 'Hindi', 'English'],
    mapsQuery: 'Institute+of+Psychiatry+SSKM+Kolkata',
  },
  {
    id: 'connecting-pune',
    name: 'Connecting NGO & Psychological Support Center',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'Crisis NGO',
    address: 'Dhole Patil Road, Sangamvadi, Pune, Maharashtra 411001',
    phone: '9922001122',
    hours: 'Daily: 12:00 PM - 8:00 PM',
    feeType: 'Free / Subsidized',
    languages: ['Marathi', 'Hindi', 'English'],
    mapsQuery: 'Connecting+Trust+Dhole+Patil+Road+Pune',
  },
];
