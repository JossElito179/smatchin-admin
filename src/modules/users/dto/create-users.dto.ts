import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  user_name?: string;

  @IsBoolean()
  role: boolean;

  @IsString()
  @Length(6, 50)
  password?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone_number: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  profil_img?: string;
}
