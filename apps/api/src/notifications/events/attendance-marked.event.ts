export class AttendanceMarkedEvent {
  constructor(
    public readonly rehearsalId: string,
    public readonly rehearsalTitle: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly status: 'presente' | 'ausente' | 'justificado',
    public readonly date?: string,
  ) {}
}
