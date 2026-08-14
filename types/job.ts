export interface Job {
  id: string;
  title: string;
  slug: string;
  company: string;
  companyLogo: string;
  country: string;
  countryCode: string;
  city: string;
  category: string;
  subcategory: string;
  industry: string;
  employmentType:
    | 'Full-time'
    | 'Part-time'
    | 'Contract'
    | 'Temporary'
    | 'Internship'
    | 'Freelance';
  workplaceType: 'Remote' | 'Hybrid' | 'On-site';
  experienceLevel:
    | 'Entry Level'
    | 'Mid Level'
    | 'Senior'
    | 'Executive';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: 'hour' | 'month' | 'year';
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  sourceName: string;
  sourceUrl: string;
  applyUrl: string;
  datePosted: string;
  closingDate: string;
  lastVerified: string;
  verificationStatus: 'verified' | 'reviewed' | 'unverified';
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
}

export interface Country {
  name: string;
  slug: string;
  code: string;
  flag: string;
  jobCount: number;
  popularCities: string[];
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  icon: any;
  jobCount: number;
}