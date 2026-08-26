export class SheetUploadedEvent {
  constructor(
    public readonly sheetId: string,
    public readonly title: string,
    public readonly composer: string,
    public readonly ensemble: string,
    public readonly uploader?: string,
  ) {}
}
