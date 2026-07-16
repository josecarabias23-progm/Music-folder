import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SheetsService } from './sheets.service';
import { CreateSheetDto, UpdateSheetDto, SheetResponseDto } from './dto/create-sheet.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

/**
 * SheetsController
 * Handles all sheet music endpoints
 * 
 * Spec: openspec/specs/api-endpoints.md - Module 1: Scores
 */
@Controller('sheets')
@ApiTags('Sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  /**
   * List all sheets with optional filtering
   * GET /sheets
   * Spec: openspec/specs/api-endpoints.md #1.1
   */
  @Get()
  @ApiOperation({ summary: 'List all sheets with pagination and filters' })
  @ApiQuery({
    name: 'skip',
    type: Number,
    required: false,
    description: 'Pagination offset',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'instrument_role',
    type: String,
    required: false,
    description: 'Filter by instrument role',
  })
  @ApiQuery({
    name: 'difficulty',
    type: String,
    required: false,
    description: 'Filter by difficulty level',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search in title/composer',
  })
  @ApiResponse({
    status: 200,
    description: 'List of sheets',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('instrument_role') instrument_role?: string,
    @Query('difficulty') difficulty?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: 'newest' | 'title' | 'composer',
  ) {
    return this.sheetsService.findAll(query.skip || 0, query.limit || 20, {
      instrument_role,
      difficulty,
      search,
      sort: sort || 'newest',
    });
  }

  /**
   * Get a single sheet by ID
   * GET /sheets/:id
   * Spec: openspec/specs/api-endpoints.md #1.2
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get sheet details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sheet details',
    type: SheetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sheet not found',
  })
  async findOne(@Param('id') id: string) {
    const sheet = await this.sheetsService.findOne(id);
    return {
      ...sheet,
      download_url: this.sheetsService.getDownloadUrl(id),
    };
  }

  /**
   * Create a new sheet
   * POST /sheets
   * Spec: openspec/specs/api-endpoints.md #1.3
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a new sheet' })
  @ApiResponse({
    status: 201,
    description: 'Sheet created successfully',
    type: SheetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @Body() createSheetDto: CreateSheetDto,
  ) {
    // TODO: Extract from JWT token
    const userId = 'mock-user-id';
    const sheet = await this.sheetsService.create(createSheetDto, userId);
    return {
      ...sheet,
      download_url: this.sheetsService.getDownloadUrl(sheet.id),
    };
  }

  /**
   * Update sheet metadata
   * PATCH /sheets/:id
   * Spec: openspec/specs/api-endpoints.md #1.4
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update sheet metadata' })
  @ApiResponse({
    status: 200,
    description: 'Sheet updated successfully',
    type: SheetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Sheet not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized - only owner can update',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSheetDto: UpdateSheetDto,
  ) {
    const userId = 'mock-user-id';
    const sheet = await this.sheetsService.update(id, updateSheetDto, userId);
    return {
      ...sheet,
      download_url: this.sheetsService.getDownloadUrl(id),
    };
  }

  /**
   * Delete a sheet
   * DELETE /sheets/:id
   * Spec: openspec/specs/api-endpoints.md #1.5
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a sheet' })
  @ApiResponse({
    status: 204,
    description: 'Sheet deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Sheet not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Unauthorized - only owner can delete',
  })
  async remove(@Param('id') id: string) {
    const userId = 'mock-user-id';
    await this.sheetsService.remove(id, userId);
    return { message: 'Sheet deleted successfully' };
  }

  /**
   * Download sheet file
   * GET /sheets/:id/download
   * Spec: openspec/specs/api-endpoints.md #1.6
   */
  @Get(':id/download')
  @ApiOperation({ summary: 'Download sheet file' })
  @ApiResponse({
    status: 200,
    description: 'File download',
  })
  @ApiResponse({
    status: 404,
    description: 'Sheet not found',
  })
  async download(@Param('id') id: string) {
    const sheet = await this.sheetsService.findOne(id);
    // TODO: Return file stream from storage
    return {
      message: 'File download initiated',
      file_url: sheet.file_url,
      file_name: `${sheet.composer} - ${sheet.title}.pdf`,
    };
  }
}
