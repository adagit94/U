import { IPager, PagerStateBase } from "dataManagment/DataManagmentTypes";
import { createState, GetState, IState, SetState } from "state";

export type Cursor = { take: number } & Partial<{ prevPage: string; nextPage: string }>;
export type CursorPagerAdvanceInfo = Cursor;
export type CursorPagerState = PagerStateBase & Cursor;
type CursorPagerSettings = Pick<CursorPagerState, "take">;

class CursorPager implements IPager<CursorPagerState, CursorPagerAdvanceInfo> {
  constructor(settings: CursorPagerSettings) {
    this.state = createState({ initState: () => ({ take: settings.take }) });
    this.getState = this.state.getState;
    this.setState = this.state.setState;
    this.reset = this.state.reset;
  }

  private state: IState<CursorPagerState>;

  public getState: GetState<CursorPagerState>;
  public setState: SetState<CursorPagerState>;
  public reset: () => void;

  public advance = () => {
    const state = this.state.getState();

    return {
      prevPage: state.prevPage,
      nextPage: state.nextPage,
      take: state.take,
    };
  };
}

export default CursorPager;
