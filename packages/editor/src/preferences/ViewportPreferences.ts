import { Bindable } from 'osucad-framework';

const key = 'preferences:viewport';

export class ViewportPreferences {
  init() {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);

      this.hitAnimationsBindable.value = !!parsed.hitAnimations;
    }

    this.hitAnimationsBindable.addOnChangeListener(() => this.save());
  }

  get hitAnimations() {
    return this.hitAnimationsBindable.value;
  }

  set hitAnimations(value: boolean) {
    this.hitAnimationsBindable.value = value;
  }

  hitAnimationsBindable = new Bindable(false);

  private save() {
    localStorage.setItem(
      key,
      JSON.stringify({
        hitAnimations: this.hitAnimations,
      }),
    );
  }
}
