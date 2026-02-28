export interface EnquiryDTO {
  id: string;
  clinicId: string;
  fullName: string;
  mobile: string;
  email: string;
  patientUid: string;
  createdAt: string;
}

export interface CreateEnquiryInputDTO {
  clinicId: string;
  fullName: string;
  mobile: string;
  email: string;
}

