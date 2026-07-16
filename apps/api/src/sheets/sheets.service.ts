import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateSheetDto, UpdateSheetDto } from './dto/create-sheet.dto';
import { Sheet } from './entities/sheet.entity';
import { v4 as uuid } from 'uuid';

/**
 * SheetsService
 * Implements business logic for sheet music management
 * 
 * Based on spec: openspec/specs/api-endpoints.md - Module 1: Scores
 * Data models: openspec/specs/data-models.md - Entity: Score
 */
@Injectable()
export class SheetsService {
  // Mock in-memory storage (will be replaced with TypeORM repository)
  private sheets: Map<string, Sheet> = new Map();

  constructor() {
    // TODO: Remove mock data after database integration
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockSheet = new Sheet();
    mockSheet.id = uuid();
    mockSheet.title = 'Symphony No. 5';
    mockSheet.composer = 'Ludwig van Beethoven';
    mockSheet.arranger = null;
    mockSheet.owner_id = 'mock-user-id';
    mockSheet.organization_id = null;
    mockSheet.file_url = '/uploads/scores/mock/symphony-5.pdf';
    mockSheet.file_format = 'pdf';
    mockSheet.file_size = 2500000;
    mockSheet.instrument_role = 'Violin I';
    mockSheet.key_signature = 'C Minor';
    mockSheet.time_signature = '4/4';
    mockSheet.duration_minutes = 35;
    mockSheet.difficulty_level = 'intermediate';
    mockSheet.tags = ['Classical', 'Romantic'];
    mockSheet.is_public = true;
    mockSheet.created_at = new Date();
    mockSheet.updated_at = new Date();

    this.sheets.set(mockSheet.id, mockSheet);
  }

  /**
   * Create a new sheet (POST /sheets)
   * Spec: openspec/specs/api-endpoints.md #1.3
   */
  async create(createSheetDto: CreateSheetDto, userId: string): Promise<Sheet> {
    const sheet = new Sheet();
    sheet.id = uuid();
    sheet.title = createSheetDto.title;
    sheet.composer = createSheetDto.composer;
    sheet.arranger = createSheetDto.arranger || null;
    sheet.owner_id = userId;
    sheet.organization_id = createSheetDto.organization_id || null;
    sheet.file_url = `/uploads/scores/${userId}/${sheet.id}/score.pdf`;
    sheet.file_format = 'pdf';
    sheet.file_size = 0;
    sheet.instrument_role = createSheetDto.instrument_role;
    sheet.key_signature = createSheetDto.key_signature;
    sheet.time_signature = createSheetDto.time_signature;
    sheet.duration_minutes = createSheetDto.duration_minutes || null;
    sheet.difficulty_level = createSheetDto.difficulty_level;
    sheet.tags = createSheetDto.tags || [];
    sheet.is_public = createSheetDto.is_public;
    sheet.created_at = new Date();
    sheet.updated_at = new Date();

    this.sheets.set(sheet.id, sheet);
    return sheet;
  }

  /**
   * List all sheets with pagination and filters (GET /sheets)
   * Spec: openspec/specs/api-endpoints.md #1.1
   */
  async findAll(
    skip: number = 0,
    limit: number = 20,
    filters?: {
      instrument_role?: string;
      difficulty?: string;
      search?: string;
      organization_id?: string;
      sort?: 'newest' | 'title' | 'composer';
    },
  ): Promise<{
    data: Sheet[];
    pagination: { total: number; skip: number; limit: number };
  }> {
    let filtered = Array.from(this.sheets.values());

    // Apply filters
    if (filters?.instrument_role) {
      filtered = filtered.filter((s) => s.instrument_role === filters.instrument_role);
    }
    if (filters?.difficulty) {
      filtered = filtered.filter((s) => s.difficulty_level === filters.difficulty);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.composer.toLowerCase().includes(search),
      );
    }
    if (filters?.organization_id) {
      filtered = filtered.filter((s) => s.organization_id === filters.organization_id);
    }

    // Apply sorting
    if (filters?.sort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters?.sort === 'composer') {
      filtered.sort((a, b) => a.composer.localeCompare(b.composer));
    } else {
      // Default: newest first
      filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }

    // Apply pagination
    const total = filtered.length;
    const data = filtered.slice(skip, skip + limit);

    return {
      data,
      pagination: { total, skip, limit },
    };
  }

  /**
   * Get a single sheet by ID (GET /sheets/:id)
   * Spec: openspec/specs/api-endpoints.md #1.2
   */
  async findOne(id: string): Promise<Sheet> {
    const sheet = this.sheets.get(id);
    if (!sheet) {
      throw new NotFoundException(`Sheet with ID ${id} not found`);
    }
    return sheet;
  }

  /**
   * Update sheet metadata (PATCH /sheets/:id)
   * Spec: openspec/specs/api-endpoints.md #1.4
   */
  async update(id: string, updateSheetDto: UpdateSheetDto, userId: string): Promise<Sheet> {
    const sheet = await this.findOne(id);

    // Check authorization
    if (sheet.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to update this sheet');
    }

    Object.assign(sheet, updateSheetDto, {
      updated_at: new Date(),
    });

    this.sheets.set(id, sheet);
    return sheet;
  }

  /**
   * Delete a sheet (DELETE /sheets/:id)
   * Spec: openspec/specs/api-endpoints.md #1.5
   */
  async remove(id: string, userId: string): Promise<void> {
    const sheet = await this.findOne(id);

    // Check authorization
    if (sheet.owner_id !== userId) {
      throw new ForbiddenException('You do not have permission to delete this sheet');
    }

    this.sheets.delete(id);
  }

  /**
   * Get download URL for a sheet
   * Spec: openspec/specs/api-endpoints.md #1.6
   */
  getDownloadUrl(sheetId: string): string {
    return `${process.env.API_URL || 'http://localhost:3000'}/sheets/${sheetId}/download`;
  }
}
