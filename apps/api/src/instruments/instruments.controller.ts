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
import { InstrumentsService } from './instruments.service';
import {
  CreateInstrumentDto,
  UpdateInstrumentDto,
  InstrumentResponseDto,
} from './dto/create-instrument.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dto/pagination.dto';

/**
 * InstrumentsController
 * Handles all instruments encyclopedia endpoints
 * 
 * Spec: openspec/specs/api-endpoints.md - Module 2: Instruments
 */
@Controller('instruments')
@ApiTags('Instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) {}

  /**
   * List all instruments with optional filtering
   * GET /instruments
   * Spec: openspec/specs/api-endpoints.md #2.1
   */
  @Get()
  @ApiOperation({ summary: 'List all instruments with optional filters' })
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
    name: 'family',
    type: String,
    required: false,
    description: 'Filter by instrument family',
  })
  @ApiQuery({
    name: 'transposing',
    type: Boolean,
    required: false,
    description: 'Filter transposing instruments',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search by name',
  })
  @ApiResponse({
    status: 200,
    description: 'List of instruments',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
    @Query('family') family?: string,
    @Query('transposing') transposing?: string,
    @Query('search') search?: string,
  ) {
    return this.instrumentsService.findAll(
      {
        family,
        transposing: transposing === 'true',
        search,
      },
      query.skip || 0,
      query.limit || 20,
    );
  }

  /**
   * Get a single instrument by ID
   * GET /instruments/:id
   * Spec: openspec/specs/api-endpoints.md #2.2
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get instrument details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Instrument details',
    type: InstrumentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Instrument not found',
  })
  async findOne(@Param('id') id: string) {
    return this.instrumentsService.findOne(id);
  }

  /**
   * Create a new instrument (Admin only)
   * POST /instruments
   * Spec: openspec/specs/api-endpoints.md #2.3
   */
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new instrument (Admin only)',
    description: 'Only administrators can create new instruments',
  })
  @ApiResponse({
    status: 201,
    description: 'Instrument created successfully',
    type: InstrumentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  async create(@Body() createInstrumentDto: CreateInstrumentDto) {
    // TODO: Add admin role check
    return this.instrumentsService.create(createInstrumentDto);
  }

  /**
   * Update an instrument (Admin only)
   * PATCH /instruments/:id
   * Spec: openspec/specs/api-endpoints.md #2.4
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an instrument (Admin only)',
    description: 'Only administrators can update instruments',
  })
  @ApiResponse({
    status: 200,
    description: 'Instrument updated successfully',
    type: InstrumentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Instrument not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  async update(
    @Param('id') id: string,
    @Body() updateInstrumentDto: UpdateInstrumentDto,
  ) {
    // TODO: Add admin role check
    return this.instrumentsService.update(id, updateInstrumentDto);
  }

  /**
   * Delete an instrument (Admin only)
   * DELETE /instruments/:id
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete an instrument (Admin only)',
    description: 'Only administrators can delete instruments',
  })
  @ApiResponse({
    status: 204,
    description: 'Instrument deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Instrument not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin only',
  })
  async remove(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.instrumentsService.remove(id);
    return { message: 'Instrument deleted successfully' };
  }
}
