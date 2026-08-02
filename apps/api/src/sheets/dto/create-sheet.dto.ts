import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional',
}

export enum FileFormat {
  PDF = 'pdf',
  JPG = 'jpg',
  PNG = 'png',
  MUSICXML = 'musicxml',
}

export class CreateSheetDto {
  @ApiProperty({ example: 'Symphony No. 5' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Ludwig van Beethoven' })
  @IsString()
  composer: string;

  @ApiProperty({ example: 'Custom Arrangement', required: false })
  @IsOptional()
  @IsString()
  arranger?: string;

  @ApiProperty({ example: 'Violin I' })
  @IsString()
  instrument_role: string;

  @ApiProperty({ example: 'C Minor' })
  @IsString()
  key_signature: string;

  @ApiProperty({ example: '4/4' })
  @IsString()
  time_signature: string;

  @ApiProperty({ example: 35, required: false })
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiProperty({ enum: DifficultyLevel, example: DifficultyLevel.INTERMEDIATE })
  @IsEnum(DifficultyLevel)
  difficulty_level: DifficultyLevel;

  @ApiProperty({ example: ['Classical', 'Romantic'] })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: true })
  @IsBoolean()
  is_public: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organization_id?: string;
}

export class UpdateSheetDto {
  @ApiProperty({ example: 'Symphony No. 5', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Ludwig van Beethoven', required: false })
  @IsOptional()
  @IsString()
  composer?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  arranger?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instrument_role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  key_signature?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  time_signature?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  duration_minutes?: number;

  @ApiProperty({ enum: DifficultyLevel, required: false })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty_level?: DifficultyLevel;

  @ApiProperty({ required: false })
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}

export class SheetResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  composer: string;

  @ApiProperty({ nullable: true })
  arranger: string | null;

  @ApiProperty()
  upload_date: Date;

  @ApiProperty()
  instrument_role: string;

  @ApiProperty()
  difficulty_level: DifficultyLevel;

  @ApiProperty()
  file_format: FileFormat;

  @ApiProperty()
  file_size: number;

  @ApiProperty()
  key_signature: string;

  @ApiProperty()
  time_signature: string;

  @ApiProperty({ nullable: true })
  duration_minutes: number | null;

  @ApiProperty()
  tags: string[];

  @ApiProperty()
  is_public: boolean;

  @ApiProperty({ example: 'uuid' })
  owner_id: string;

  @ApiProperty({ nullable: true })
  organization_id: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ nullable: true })
  download_url?: string;
}
