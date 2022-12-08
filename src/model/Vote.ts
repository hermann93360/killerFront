export class Vote {
  constructor(
    public idMainUser: number,
    public idTargetUser: number,
    public idRoom: number,
    public numberOfVoteTargetUser?: number) {
  }
}
