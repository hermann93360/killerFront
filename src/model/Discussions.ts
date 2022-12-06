import {Chat} from "./Chat";

export class Discussions {
  constructor(
    public listChat: Chat[],
    public idUser1: number,
    public idUser2: number
  ) {
  }

  replace(chat: Chat[]) {
    this.listChat = chat;
  }
  equal(id1: number, id2: number) : boolean{
    return (id1 == this.idUser1 || id1 == this .idUser2) && (id2 == this.idUser1 || id2 == this .idUser2)
  }

  last() {
    return this.listChat[this.listChat.length-1];
  }
}
