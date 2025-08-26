export class CreateCompanyDto {
    name!: string;
    email!: string;
    password!: string;           
    businessNumber!: string;
    phone?: string;
    ceoName?: string;
    profileImageUrl?: string;
    homepageUrl?: string;
    smartAccountAddress?: string;
  }
  