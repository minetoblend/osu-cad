export class ButtonStates<TButton>
{
  #buttons = new Set<TButton>();

  constructor(buttons?: TButton[])
  {
    if (buttons)
    {
      this.#buttons = new Set(buttons);
    }
  }

  isPressed(button: TButton)
  {
    return this.#buttons.has(button);
  }

  setPressed(button: TButton, pressed: boolean): boolean
  {
    if (this.isPressed(button) === pressed)
      return false;

    if (pressed)
    {
      this.#buttons.add(button);
    }
    else
    {
      this.#buttons.delete(button);
    }

    return true;
  }

  get hasAnyButtonPressed()
  {
    return this.#buttons.size > 0;
  }

  add(button: TButton)
  {
    this.#buttons.add(button);
  }

  get pressedButtons()
  {
    return this.#buttons as ReadonlySet<TButton>;
  }

  enumerateDifference(lastButtons: ButtonStates<TButton>): ButtonStateDifference<TButton>
  {
    if (!lastButtons.hasAnyButtonPressed)
    {
      // if no buttons pressed anywhere, use static to avoid alloc.
      return !this.hasAnyButtonPressed
        ? ButtonStateDifference.EMPTY
        : new ButtonStateDifference([], [...this.pressedButtons]);
    }

    if (!this.hasAnyButtonPressed)
      return new ButtonStateDifference([...lastButtons.pressedButtons], []);

    const released = new Set<TButton>();
    const pressed = new Set<TButton>();

    for (const b of this.pressedButtons)
    {
      if (!lastButtons.pressedButtons.has(b))
        pressed.add(b);
    }

    for (const b of lastButtons.pressedButtons)
    {
      if (!this.pressedButtons.has(b))
        released.add(b);
    }

    return new ButtonStateDifference([...released], [...pressed]);
  }
}

export class ButtonStateDifference<TButton>
{
  constructor(
    public readonly released: TButton[],
    public readonly pressed: TButton[],
  )
  {}

  get hasDifference()
  {
    return this.released.length > 0 || this.pressed.length > 0;
  }

  static readonly EMPTY = new ButtonStateDifference<any>([], []);
}
