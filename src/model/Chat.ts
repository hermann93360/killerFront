export class Chat {
  constructor(
    public message: string,
    public nameSender?: string,
    public idSender?: number,
    public idDestination?: number
  ) {
  }
}
