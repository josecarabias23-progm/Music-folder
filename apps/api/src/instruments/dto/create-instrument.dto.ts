import { IsString, IsEnum, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum InstrumentFamily {
  STRINGS = 'strings',
  WINDS = 'winds',
  BRASS = 'brass',
  PERCUSSION = 'percussion',
  KEYBOARD = 'keyboard',
  ELECTRONIC = 'electronic',
}

export enum Clef {
  TREBLE = 'treble',
  BASS = 'bass',
  ALTO = 'alto',
  TENOR = 'tenor',
}

export class InstrumentRangeDto {
  @ApiProperty({ example: 'G3' })
  lowest_note: string;

  @ApiProperty({ example: 'E7' })
  highest_note: string;
}

export class DynamicRangeDto {
  @ApiProperty({ example: 'ppp' })
  softest: string;

  @ApiProperty({ example: 'fff' })
  loudest: string;
}

export class CreateInstrumentDto {
  @ApiProperty({ example: 'Violin' })
  @IsString()
  name: string;

  @ApiProperty({ enum: InstrumentFamily, example: InstrumentFamily.STRINGS })
  @IsEnum(InstrumentFamily)
  family: InstrumentFamily;

  @ApiProperty({ example: 'C' })
  @IsString()
  transposition: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_transposing: boolean;

  @ApiProperty({ type: InstrumentRangeDto })
  range: InstrumentRangeDto;

  @ApiProperty({ type: InstrumentRangeDto })
  concert_range: InstrumentRangeDto;

  @ApiProperty({ enum: [Clef.TREBLE], example: [Clef.TREBLE] })
  @IsArray()
  clef: Clef[];

  @ApiProperty({ type: DynamicRangeDto })
  dynamic_range: DynamicRangeDto;

  @ApiProperty({ example: ['vibrato', 'tremolo', 'pizzicato', 'harmonics'] })
  @IsArray()
  @IsString({ each: true })
  techniques: string[];

  @ApiProperty({
    example:
      'Violins should be stored in their cases with moderate humidity levels...',
  })
  @IsString()
  maintenance_tips: string;

  @ApiProperty({
    example:
      'The violin emerged in Italy during the 16th century, evolving from the medieval fiddle...',
  })
  @IsString()
  historical_info: string;

  @ApiProperty({
    example: [
      'Violin Concerto in D Major',
      'The Four Seasons',
      'Partita No. 1 in G Minor',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notable_repertoire?: string[];
}

export class UpdateInstrumentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: InstrumentFamily, required: false })
  @IsOptional()
  @IsEnum(InstrumentFamily)
  family?: InstrumentFamily;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transposition?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_transposing?: boolean;

  @ApiProperty({ type: InstrumentRangeDto, required: false })
  @IsOptional()
  range?: InstrumentRangeDto;

  @ApiProperty({ type: InstrumentRangeDto, required: false })
  @IsOptional()
  concert_range?: InstrumentRangeDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  clef?: Clef[];

  @ApiProperty({ type: DynamicRangeDto, required: false })
  @IsOptional()
  dynamic_range?: DynamicRangeDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  techniques?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  maintenance_tips?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  historical_info?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  notable_repertoire?: string[];
}

export class InstrumentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: InstrumentFamily })
  family: InstrumentFamily;

  @ApiProperty()
  transposition: string;

  @ApiProperty()
  is_transposing: boolean;

  @ApiProperty({ type: InstrumentRangeDto })
  range: InstrumentRangeDto;

  @ApiProperty({ type: InstrumentRangeDto })
  concert_range: InstrumentRangeDto;

  @ApiProperty({ type: [String] })
  clef: Clef[];

  @ApiProperty({ type: DynamicRangeDto })
  dynamic_range: DynamicRangeDto;

  @ApiProperty({ type: [String] })
  techniques: string[];

  @ApiProperty()
  maintenance_tips: string;

  @ApiProperty()
  historical_info: string;

  @ApiProperty()
  notable_repertoire: string[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
