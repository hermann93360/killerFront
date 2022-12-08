export class PlayerInTable {
  public alive: boolean
  public vote: number

  constructor(
    public pathIcon: string,
    public name: string,
    public id: number,
  ) {
    this.alive = true;
    this.vote = 0;
  }

  kill(){
    this.alive = false;
  }

  resetVote() {
    this.vote = 0;
  }

  addVote(vote: number) {
    this.vote = vote;
  }
}
