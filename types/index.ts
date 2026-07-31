export interface BaseModel {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

export type UserRole = 'admin' | 'docente' | 'estudiante';
export type CohortMode = 'sprints_and_teams' | 'weekly';
export type CohortStatus = 'active' | 'archived';
export type EnrollmentStatus = 'active' | 'completed';
export type EnrollmentEntryType = 'new' | 'repeater';
export type AdmissionStatus = 'pending' | 'claimed' | 'cancelled';
export type WeekPublicationStatus = 'draft' | 'published';
export type EnrollmentRequestStatus = 'pending' | 'approved' | 'rejected';

export interface User extends BaseModel {
  username: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  birthDate?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
}

export interface Link extends BaseModel {
  title: string;
  url: string;
  class?: string; // Relation to Class ID (optional, mutually exclusive with assignment)
  assignment?: string; // Relation to Assignment ID (optional, mutually exclusive with class)
}

export interface Class extends BaseModel {
  title: string;
  description: string;
  sprint?: string; // Relation to Sprint ID (exclusive with week)
  week?: string; // Relation to Week ID (exclusive with sprint)
  date: string;
  // Expanding relations
  expand?: {
    links?: Link[];
  };
}

export interface Sprint extends BaseModel {
  title: string;
  description: string;
  course: string; // Relation to Course ID (if multiple courses)
  startDate: string;
  endDate: string;
  cohort?: string; // Optional only during legacy migration
  // Expanding relations
  expand?: {
    classes?: Class[];
    assignments?: Assignment[];
  };
}

export interface Assignment extends BaseModel {
  title: string;
  description: string;
  sprint?: string; // Relation to Sprint ID (exclusive with week)
  week?: string; // Relation to Week ID (exclusive with sprint)
  // Expanding relations
  expand?: {
    links?: Link[];
    deliveries?: Delivery[];
  };
}

export interface Delivery extends BaseModel {
  assignment: string;
  student: string;
  repositoryUrl: string;
  expand?: {
    student?: User;
  };
}

export interface Course extends BaseModel {
  title: string;
  description: string;
  // Expanding relations
  expand?: {
    sprints?: Sprint[];
  };
}

export interface Team extends BaseModel {
  name: string;
  cohort?: string; // Optional only during legacy migration
  members: string[]; // Relation to User IDs (students)
  expand?: {
    members?: User[];
  };
}

export interface Message extends BaseModel {
  text: string;
  sender: string; // Relation to User ID (renamed from 'user' to avoid conflicts)
  team: string; // Relation to Team ID
  expand?: {
    sender?: User;
  };
}

export interface Review extends BaseModel {
  sprint: string;
  student: string;
  teacher: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'completed' | 'cancelled';
  feedback?: string;
  private_note?: string;
  public_note?: string;
  zoomLink?: string;
  roomNumber?: string;
  expand?: {
    sprint?: Sprint;
    student?: User;
    teacher?: User;
  };
}

export interface StudentSurvey extends BaseModel {
  sprint: string; // Relation to Sprint ID
  student: string; // Relation to User ID
  status: 'completed' | 'incomplete_deliveries';
  
  // Fields for students with complete deliveries
  feelings?: string;
  feedback?: string;
  suggestions?: string;
  
  // Fields for students with incomplete deliveries
  reason?: string;
  experience?: string;
  futurePlan?: 'continue' | 'retake' | 'contact_teacher';
  delayFactors?: string;
  attitudeReflection?: string;
  learningExperience?: string;
  futureStrategies?: string;
  actionPlan?: string;
  personalCommitment?: string;
  additionalComments?: string;
  
  expand?: {
    sprint?: Sprint;
    student?: User;
  };
}

export interface Inquiry extends BaseModel {
  title: string;
  description: string;
  status: 'Pendiente' | 'Resuelta';
  author: string; // Relation to User ID
  class?: string; // Relation to Class ID (optional)
  assignment?: string; // Relation to Assignment ID (optional)
  cohort: string; // Relation to Cohort ID
  week?: string; // Optional weekly context
  expand?: {
    author?: User;
    class?: Class;
    assignment?: Assignment;
    cohort?: Cohort;
    week?: Week;
  };
}

export interface Cohort extends BaseModel {
  name: string;
  slug: string;
  mode: CohortMode;
  status: CohortStatus;
  startDate?: string;
  endDate?: string;
}

export interface CohortEnrollment extends BaseModel {
  user: string;
  cohort: string;
  status: EnrollmentStatus;
  entryType: EnrollmentEntryType;
  enrolledAt: string;
  completedAt?: string;
  expand?: { user?: User; cohort?: Cohort };
}

export interface StudentAdmission extends BaseModel {
  normalizedEmail: string;
  displayName: string;
  dni?: string;
  birthDate?: string;
  phone?: string;
  cohort: string;
  entryType: EnrollmentEntryType;
  status: AdmissionStatus;
  claimedBy?: string;
  claimedAt?: string;
  expand?: { cohort?: Cohort; claimedBy?: User };
}

export interface Week extends BaseModel {
  cohort: string;
  number: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  publicationStatus: WeekPublicationStatus;
  publishedAt?: string;
  expand?: { cohort?: Cohort; classes?: Class[]; assignments?: Assignment[] };
}

export interface JavascriptAssessmentResult extends BaseModel {
  cohort: string;
  student: string;
  assessmentVersion: string;
  attemptKind?: "initial" | "practice";
  attemptKey?: string;
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  completedAt: string;
  expand?: { cohort?: Cohort; student?: User };
}

export interface EnrollmentRequest extends BaseModel {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  normalizedEmail: string;
  phone: string;
  cohort: string;
  status: EnrollmentRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
  linkedUser?: string;
  admission?: string;
  expand?: { cohort?: Cohort; reviewedBy?: User; linkedUser?: User; admission?: StudentAdmission };
}

export interface InquiryResponse extends BaseModel {
  inquiry: string; // Relation to Inquiry ID
  author: string; // Relation to User ID
  content: string;
  expand?: {
    author?: User;
  };
}
