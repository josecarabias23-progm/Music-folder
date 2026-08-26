export class RehearsalScheduledEvent {
  constructor(
    public readonly rehearsalId: string,
    public readonly title: string,
    public readonly date: string,
    public readonly time: string,
    public readonly venue: string,
    public readonly author?: string,
  ) {}
}
