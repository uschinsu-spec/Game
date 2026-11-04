export interface State<T> {
  name: string;
  enter?(context: T, fromState?: string): void;
  update?(context: T, time: number, delta: number): void;
  exit?(context: T, toState?: string): void;
}

export class StateMachine<T> {
  private states = new Map<string, State<T>>();
  private currentState?: State<T>;
  private context: T;
  private isTransitioning = false;

  constructor(context: T) {
    this.context = context;
  }

  public addState(state: State<T>): this {
    this.states.set(state.name, state);
    return this;
  }

  public getCurrentState(): State<T> | undefined {
    return this.currentState;
  }

  public getCurrentStateName(): string {
    return this.currentState ? this.currentState.name : 'NONE';
  }

  public transitionTo(stateName: string): boolean {
    if (this.isTransitioning) return false;
    if (this.currentState && this.currentState.name === stateName) return false;

    const nextState = this.states.get(stateName);
    if (!nextState) {
      console.warn(`[StateMachine] State '${stateName}' not found.`);
      return false;
    }

    this.isTransitioning = true;
    const oldStateName = this.currentState ? this.currentState.name : undefined;

    if (this.currentState && this.currentState.exit) {
      this.currentState.exit(this.context, stateName);
    }

    this.currentState = nextState;

    if (this.currentState.enter) {
      this.currentState.enter(this.context, oldStateName);
    }

    this.isTransitioning = false;
    return true;
  }

  public update(time: number, delta: number): void {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(this.context, time, delta);
    }
  }
}

